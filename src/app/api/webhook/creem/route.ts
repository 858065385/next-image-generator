export const dynamic = 'force-dynamic';
export const config = { api: { bodyParser: false } };

import crypto from 'crypto';
import { verifyCreemWebhook } from "@/backend/lib/creem";
import { CreemWebhookPayload } from "@/backend/type/creem";
import {
  createWebhookEvent,
  isWebhookEventProcessed,
  markWebhookEventAsProcessed,
} from "@/backend/service/creem_webhook";
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId,
} from "@/backend/service/user_subscription";
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage,
} from "@/backend/service/credit_usage";
import { CreditUsage, UserSubscription } from "@/backend/type/type";
import {
  getPaymentHistoryById,
  updatePaymentHistory,
  createPaymentHistory,
} from "@/backend/service/payment_history";
import { UserSubscriptionStatusEnum } from "@/backend/type/enum/user_subscription_enum";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("creem-signature") as string;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET!;

  // 调试日志
  console.log('[raw webhook]', rawBody.slice(0, 500));

  // 验证 webhook 签名
  if (!verifyCreemWebhook(rawBody, signature, webhookSecret)) {
    console.error("Invalid Creem webhook signature");
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Invalid JSON in webhook payload:", err);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 调试日志
  console.log('[event type]', event.type || event.eventType);
  console.log('[event data]', event.data ?? '<<< undefined >>>');

  try {
    // 获取事件类型，兼容不同的字段名
    const eventType = (event as any).eventType || event.type;
    
    // 记录 webhook 事件（使用 UPSERT 避免重复）
    await createWebhookEvent({
      event_id: event.id,
      event_type: eventType,
      raw_data: body,
      processed: false,
    });

    // 再次检查是否已处理（防止并发）
    if (await isWebhookEventProcessed(event.id)) {
      console.log(`Event ${event.id} already processed`);
      return Response.json({ received: true });
    }

    switch (eventType) {
      case "subscription.paid":
        await handleSubscriptionPaid(event);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(event);
        break;

      case "checkout.completed":
        await handleCheckoutCompleted(event);
        break;

      default:
        console.log(`Unhandled Creem event type: ${eventType}`);
        console.log('Event data:', JSON.stringify(event.data, null, 2));
    }

    // 标记事件为已处理
    await markWebhookEventAsProcessed(event.id);

  } catch (error) {
    console.error("Error processing Creem webhook:", error);
    return Response.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}

async function handleSubscriptionPaid(event: any) {
  console.log("Processing subscription.paid event");
  if (!event.data || !event.data.subscription) {
    console.log('No subscription data in event');
    return;
  }
  const { subscription } = event.data;
  if (!subscription.metadata) return;

  const {
    userId,
    subscriptionPlanId,
    credit,
    paymentHistoryId,
    interval
  } = subscription.metadata;

  const currentDate = new Date();
  const periodEnd = new Date(currentDate);
  if (interval === "year") {
    periodEnd.setFullYear(currentDate.getFullYear() + 1);
  } else {
    periodEnd.setMonth(currentDate.getMonth() + 1);
  }

  // 1. 创建/更新用户订阅
  const userSubscriptionParams: UserSubscription = {
    user_id: userId,
    subscription_plans_id: parseInt(subscriptionPlanId),
    creem_product_id: subscription.product_id,
    creem_subscription_id: subscription.id,
    creem_customer_id: subscription.customer_id,
    status: UserSubscriptionStatusEnum.ACTIVE,
    current_period_start: currentDate,
    current_period_end: periodEnd,
    created_at: new Date(),
  };

  const existingSubscription = await getUserSubscriptionByUserId(userId);
  let userSubscription: UserSubscription;
  if (existingSubscription) {
    userSubscription = await updateUserSubscription(userSubscriptionParams);
  } else {
    userSubscription = await createUserSubscription(userSubscriptionParams);
  }

  // 2. 更新积分使用情况
  let creditUsage = await getCreditUsageByUserId(userId);
  const creditAmount = parseInt(credit);

  if (!creditUsage) {
    const newCreditUsage: CreditUsage = {
      user_id: userId,
      user_subscriptions_id: userSubscription.id!,
      is_subscription_active: true,
      used_count: 0,
      period_remain_count: creditAmount,
      period_start: currentDate,
      period_end: periodEnd,
      created_at: new Date(),
    };
    await createCreditUsage(newCreditUsage);
  } else {
    // 处理续费逻辑
    if (creditUsage.is_subscription_active) {
      // 订阅续费
      creditUsage.period_remain_count = creditAmount;
    } else {
      // 从非订阅转为订阅，保留剩余积分
      if (creditUsage.period_remain_count > 0 && 
          creditUsage.period_end && 
          creditUsage.period_end >= currentDate) {
        creditUsage.period_remain_count += creditAmount;
      } else {
        creditUsage.period_remain_count = creditAmount;
      }
    }
    
    creditUsage.is_subscription_active = true;
    creditUsage.period_start = currentDate;
    creditUsage.period_end = periodEnd;
    creditUsage.user_subscriptions_id = userSubscription.id!;
    creditUsage.updated_at = new Date();
    await updateCreditUsage(creditUsage);
  }

  // 3. 更新支付历史
  if (paymentHistoryId) {
    const paymentHistory = await getPaymentHistoryById(paymentHistoryId);
    if (paymentHistory) {
      paymentHistory.creem_subscription_id = subscription.id;
      paymentHistory.creem_customer_id = subscription.customer_id;
      paymentHistory.status = "success";
      await updatePaymentHistory(paymentHistory);
    }
  }
}

async function handleSubscriptionCanceled(event: any) {
  console.log("Processing subscription.canceled event");
  if (!event.data || !event.data.subscription) {
    console.log('No subscription data in event');
    return;
  }
  const { subscription } = event.data;
  if (!subscription.metadata) return;

  const { userId } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    existingSubscription.status = UserSubscriptionStatusEnum.CANCELLED;
    existingSubscription.canceled_at = new Date();
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);

    // 更新积分状态
    const creditUsage = await getCreditUsageByUserId(userId);
    if (creditUsage) {
      creditUsage.is_subscription_active = false;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
  }
}

async function handleSubscriptionExpired(event: any) {
  console.log("Processing subscription.expired event");
  if (!event.data || !event.data.subscription) {
    console.log('No subscription data in event');
    return;
  }
  const { subscription } = event.data;
  if (!subscription.metadata) return;

  const { userId } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    existingSubscription.status = UserSubscriptionStatusEnum.EXPIRED;
    existingSubscription.ends_at = new Date();
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);

    // 更新积分状态
    const creditUsage = await getCreditUsageByUserId(userId);
    if (creditUsage) {
      creditUsage.is_subscription_active = false;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
  }
}

async function handleSubscriptionUpdated(event: any) {
  console.log("Processing subscription.updated event");
  // 处理订阅更新逻辑，如升降级等
  await handleSubscriptionPaid(event); // 可以复用 paid 逻辑
}

async function handleCheckoutCompleted(event: any) {
  console.log("Processing checkout.completed event");
  
  if (!event.data || !event.data.checkout) {
    console.log('No checkout data in event');
    console.log('Full event structure:', JSON.stringify(event, null, 2));
    return;
  }
  
  const { checkout } = event.data;
  console.log('Checkout data:', JSON.stringify(checkout, null, 2));
  
  if (checkout.metadata) {
    console.log('Checkout metadata:', checkout.metadata);
  }