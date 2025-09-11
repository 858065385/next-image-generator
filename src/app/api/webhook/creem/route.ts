export const dynamic = 'force-dynamic';

import crypto from 'crypto';
import { verifyCreemWebhook } from "@/backend/lib/creem";
import { CreemWebhookPayload } from "@/backend/types/creem";
import {
  createWebhookEvent,
  isWebhookEventProcessed,
  markWebhookEventAsProcessed,
} from "@/backend/services/creem_webhook";
import { SubscriptionLogger } from "@/backend/utils/subscription-logger";
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId,
} from "@/backend/services/user_subscription";
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage,
} from "@/backend/services/credit_usage";
import { CreditUsage, UserSubscription } from "@/backend/types/type";
import {
  getPaymentHistoryById,
  updatePaymentHistory,
  createPaymentHistory,
} from "@/backend/services/payment_history";
import { UserSubscriptionStatusEnum } from "@/backend/types/enum/user_subscription_enum";

/**
 * Creem Webhook 处理接口
 * 
 * 接收 Creem 的 webhook 事件，处理订阅相关的状态变更
 * 
 * 支持的事件类型：
 * - subscription.paid: 订阅支付成功
 * - subscription.canceled: 订阅取消
 * - subscription.expired: 订阅过期
 * - subscription.updated: 订阅更新（升降级）
 * - checkout.completed: 结账完成
 * 
 * 安全措施：
 * 1. HMAC-SHA256 签名验证
 * 2. 事件去重（防止重复处理）
 * 3. 详细的错误日志
 */

export async function POST(req: Request) {
  // 1. 获取原始请求体（签名验证需要）
  const rawBody = await req.text();
  
  // 2. 提取签名（兼容两种可能的头名称）
  const signature1 = req.headers.get("x-creem-signature");
  const signature2 = req.headers.get("creem-signature");
  const signature = signature1 || signature2;
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET!;

  // 调试日志（生产环境可移除）
  console.log('[all headers]', [...req.headers.entries()]);
  console.log('[raw webhook]', rawBody.slice(0, 500));
  console.log('[debug] x-creem-signature:', signature1);
  console.log('[debug] creem-signature:', signature2);
  console.log('[debug] using signature:', signature);
  console.log('[debug] webhookSecret exists:', !!webhookSecret);
  console.log('[debug] webhookSecret length:', webhookSecret?.length || 0);

  // 3. 签名验证
  if (!signature) {
    console.error("No Creem webhook signature found in headers");
    return Response.json({ 
      error: "No signature found",
      headers: [...req.headers.entries()],
      availableSignatureHeaders: {
        'x-creem-signature': signature1,
        'creem-signature': signature2
      }
    }, { status: 400 });
  }

  // 使用 HMAC-SHA256 验证签名
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex');
  console.log('[debug] expected signature:', expectedSignature);
  
  if (!verifyCreemWebhook(rawBody, signature, webhookSecret)) {
    console.error("Invalid Creem webhook signature");
    console.error('[debug] signature mismatch');
    console.error('[debug] received:', signature);
    console.error('[debug] expected:', expectedSignature);
    return Response.json({ 
      error: "Invalid signature",
      received: signature,
      expected: expectedSignature,
      webhookSecretLength: webhookSecret?.length || 0
    }, { status: 400 });
  }

  // 4. 解析 JSON
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Invalid JSON in webhook payload:", err);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 调试日志
  console.log('[event type]', event.type || event.eventType);
  console.log('[event object]', event.object ?? '<<< undefined >>>');

  try {
    // 5. 事件去重处理
    const eventType = (event as any).eventType || event.type;
    
    // 记录 webhook 事件到数据库
    await createWebhookEvent({
      event_id: event.id,
      event_type: eventType,
      raw_data: rawBody,
      processed: false,
    });

    // 防止重复处理（并发安全）
    if (await isWebhookEventProcessed(event.id)) {
      console.log(`Event ${event.id} already processed`);
      return Response.json({ received: true });
    }

    // 记录 webhook 事件
    SubscriptionLogger.logWebhookEvent(eventType, event.id, undefined, {
      objectType: event.object?.type,
      hasSubscription: !!event.object?.subscription,
      hasCheckout: !!event.object?.checkout
    });

    // 6. 根据事件类型分发处理
    switch (eventType) {
      case "subscription.paid":
        // 订阅支付成功：激活订阅，添加积分
        await handleSubscriptionPaid(event);
        break;

      case "subscription.canceled":
        // 订阅取消：标记为已取消，停止积分发放
        await handleSubscriptionCanceled(event);
        break;

      case "subscription.expired":
        // 订阅过期：标记为已过期，停止积分发放
        await handleSubscriptionExpired(event);
        break;

      case "subscription.updated":
        // 订阅更新：处理升降级
        await handleSubscriptionUpdated(event);
        break;

      case "subscription.reactivated":
        // 订阅重新激活：处理取消后的重新激活
        await handleSubscriptionReactivated(event);
        break;

      case "subscription.downgraded":
        // 订阅降级
        await handleSubscriptionDowngraded(event);
        break;

      case "checkout.completed":
        // 结账完成：记录但不激活订阅（等待支付）
        await handleCheckoutCompleted(event);
        break;

      default:
        SubscriptionLogger.warn(`Unhandled Creem event type: ${eventType}`, {
          operation: "webhook_handler",
          metadata: {
            eventId: event.id,
            eventType,
            object: event.object
          }
        });
    }

    // 7. 标记事件为已处理
    await markWebhookEventAsProcessed(event.id);

  } catch (error) {
    SubscriptionLogger.error("Error processing Creem webhook", {
      operation: "webhook_handler",
      metadata: {
        eventId: event?.id,
        eventType: event?.eventType || event?.type
      }
    }, error);
    
    return Response.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}

/**
 * 处理订阅支付成功事件
 * 
 * 流程：
 * 1. 创建或更新用户订阅记录
 * 2. 更新积分使用情况（新订阅或续费）
 * 3. 更新支付历史记录状态
 */
async function handleSubscriptionPaid(event: any) {
  console.log("Processing subscription.paid event");
  
  // 验证事件数据
  if (!event.object || !event.object.subscription) {
    console.log('No subscription data in event');
    return;
  }
  
  const { subscription } = event.object;
  if (!subscription.metadata) {
    console.log('No metadata in subscription');
    return;
  }

  // 提取元数据
  const {
    userId,
    subscriptionPlanId,
    credit,
    paymentHistoryId,
    interval
  } = subscription.metadata;

  // 计算订阅周期
  const currentDate = new Date();
  const periodEnd = new Date(currentDate);
  if (interval === "year") {
    periodEnd.setFullYear(currentDate.getFullYear() + 1);
  } else {
    periodEnd.setMonth(currentDate.getMonth() + 1);
  }

  // 1. 创建或更新用户订阅记录
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
    // 更新现有订阅（可能是续费或升级）
    userSubscription = await updateUserSubscription(userSubscriptionParams);
  } else {
    // 创建新订阅
    userSubscription = await createUserSubscription(userSubscriptionParams);
  }

  // 2. 更新积分使用情况
  let creditUsage = await getCreditUsageByUserId(userId);
  const creditAmount = parseInt(credit);

  if (!creditUsage) {
    // 首次订阅：创建新的积分记录
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
    // 已有积分记录：处理续费或升级
    if (creditUsage.is_subscription_active) {
      // 订阅续费：重置积分（不累积）
      creditUsage.period_remain_count = creditAmount;
    } else {
      // 从非订阅转为订阅：保留有效期内剩余积分
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

  // 3. 更新支付历史状态
  if (paymentHistoryId) {
    const paymentHistory = await getPaymentHistoryById(paymentHistoryId);
    if (paymentHistory) {
      paymentHistory.creem_subscription_id = subscription.id;
      paymentHistory.creem_customer_id = subscription.customer_id;
      paymentHistory.status = "success";  // 从 STARTED 改为 SUCCESS
      await updatePaymentHistory(paymentHistory);
    }
  }
}

/**
 * 处理订阅取消事件
 * 
 * 注意：取消后用户仍可使用剩余积分直到当前周期结束
 */
async function handleSubscriptionCanceled(event: any) {
  console.log("Processing subscription.canceled event");
  
  // 验证事件数据
  if (!event.object || !event.object.subscription) {
    console.log('No subscription data in event');
    return;
  }
  
  const { subscription } = event.object;
  if (!subscription.metadata) {
    console.log('No metadata in subscription');
    return;
  }

  const { userId } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    // 检查是否是立即取消还是周期结束后取消
    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
    
    if (cancelAtPeriodEnd) {
      // 周期结束后取消 - 标记为取消但保持活跃直到周期结束
      existingSubscription.status = UserSubscriptionStatusEnum.ACTIVE;
      existingSubscription.cancel_at_period_end = true;
      existingSubscription.canceled_at = new Date();
      existingSubscription.cancellation_reason = subscription.cancellation_details?.reason || 'User requested cancellation';
      console.log(`Subscription ${subscription.id} will cancel at period end: ${subscription.current_period_end}`);
    } else {
      // 立即取消 - 标记为已取消
      existingSubscription.status = UserSubscriptionStatusEnum.CANCELLED;
      existingSubscription.cancel_at_period_end = false;
      existingSubscription.canceled_at = new Date();
      existingSubscription.cancellation_reason = subscription.cancellation_details?.reason || 'Immediate cancellation';
      existingSubscription.ends_at = new Date();
      
      // 立即更新积分状态
      const creditUsage = await getCreditUsageByUserId(userId);
      if (creditUsage) {
        creditUsage.is_subscription_active = false;
        creditUsage.updated_at = new Date();
        await updateCreditUsage(creditUsage);
      }
    }
    
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);
    
    console.log(`Subscription for user ${userId} cancelled: ${cancelAtPeriodEnd ? 'at period end' : 'immediately'}`);
  }
}

/**
 * 处理订阅过期事件
 * 
 * 过期后用户无法再使用积分（即使有剩余）
 */
async function handleSubscriptionExpired(event: any) {
  console.log("Processing subscription.expired event");
  
  // 验证事件数据
  if (!event.object || !event.object.subscription) {
    console.log('No subscription data in event');
    return;
  }
  
  const { subscription } = event.object;
  if (!subscription.metadata) {
    console.log('No metadata in subscription');
    return;
  }

  const { userId } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    // 标记订阅为已过期
    existingSubscription.status = UserSubscriptionStatusEnum.EXPIRED;
    existingSubscription.ends_at = new Date();
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);

    // 更新积分状态（标记为非活跃）
    const creditUsage = await getCreditUsageByUserId(userId);
    if (creditUsage) {
      creditUsage.is_subscription_active = false;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
  }
}

/**
 * 处理订阅更新事件（升降级）
 * 
 * 复用 paid 事件的逻辑，因为更新通常伴随着新的支付
 */
async function handleSubscriptionUpdated(event: any) {
  console.log("Processing subscription.updated event");
  // 处理订阅更新逻辑，如升降级等
  await handleSubscriptionPaid(event); // 复用 paid 逻辑
}

/**
 * 处理订阅重新激活事件
 * 
 * 当用户取消后又在周期结束前重新激活订阅时触发
 */
async function handleSubscriptionReactivated(event: any) {
  console.log("Processing subscription.reactivated event");
  
  // 验证事件数据
  if (!event.object || !event.object.subscription) {
    console.log('No subscription data in event');
    return;
  }
  
  const { subscription } = event.object;
  if (!subscription.metadata) {
    console.log('No metadata in subscription');
    return;
  }

  const { userId } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    // 重新激活订阅
    existingSubscription.status = UserSubscriptionStatusEnum.ACTIVE;
    existingSubscription.cancel_at_period_end = false;
    existingSubscription.canceled_at = null;
    existingSubscription.cancellation_reason = null;
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);

    // 重新激活积分
    const creditUsage = await getCreditUsageByUserId(userId);
    if (creditUsage && creditUsage.period_end > new Date()) {
      creditUsage.is_subscription_active = true;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
    
    console.log(`Subscription for user ${userId} reactivated`);
  }
}

/**
 * 处理订阅降级事件
 * 
 * 当用户从高价计划降级到低价计划时触发
 */
async function handleSubscriptionDowngraded(event: any) {
  console.log("Processing subscription.downgraded event");
  
  // 验证事件数据
  if (!event.object || !event.object.subscription) {
    console.log('No subscription data in event');
    return;
  }
  
  const { subscription } = event.object;
  if (!subscription.metadata) {
    console.log('No metadata in subscription');
    return;
  }

  const { userId, subscriptionPlanId, credit } = subscription.metadata;
  const existingSubscription = await getUserSubscriptionByUserId(userId);
  
  if (existingSubscription) {
    // 更新订阅计划
    existingSubscription.subscription_plans_id = parseInt(subscriptionPlanId);
    existingSubscription.creem_product_id = subscription.product_id;
    existingSubscription.updated_at = new Date();
    await updateUserSubscription(existingSubscription);

    // 降级通常会在下一个周期生效，所以这里只是更新记录
    // 实际的积分调整会在下一个周期开始时处理
    console.log(`Subscription for user ${userId} downgraded to plan ${subscriptionPlanId}`);
  }
}

/**
 * 处理结账完成事件
 * 
 * 注意：结账完成不等于支付成功！
 * 只是表示用户完成了结账流程，实际支付状态需要等待 subscription.paid 事件
 */
async function handleCheckoutCompleted(event: any) {
  console.log("Processing checkout.completed event");
  
  // 验证事件数据
  if (!event.object || !event.object.checkout) {
    console.log('No checkout data in event');
    console.log('Full event structure:', JSON.stringify(event, null, 2));
    return;
  }
  
  const { checkout } = event.object;
  console.log('Checkout data:', JSON.stringify(checkout, null, 2));
  
  // 记录结账信息（但不激活订阅）
  if (checkout.metadata) {
    console.log('Checkout metadata:', checkout.metadata);
    // TODO: 可以在这里更新支付历史记录的状态
  }
}