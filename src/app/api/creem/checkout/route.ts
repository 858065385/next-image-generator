import { creem } from "@/backend/lib/creem";
import { getUserByUuidAndEmail } from "@/backend/service/user";
import { getSubscriptionPlan } from "@/backend/service/subscription_plan";
import { UserSubscriptionStatusEnum } from "@/backend/type/enum/user_subscription_enum";
import { PaymentStatus } from "@/backend/type/enum/payment_status_enum";
import { PaymentHistory } from "@/backend/type/type";
import { createPaymentHistory } from "@/backend/service/payment_history";
import { getUserSubscriptionByUserIdAndStatus } from "@/backend/service/user_subscription";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { plan_id, amount, interval, user_uuid, user_email } = await req.json();
    
    if (user_uuid === undefined || user_email === undefined) {
      return Response.json({ error: "invalid params" }, { status: 401 });
    }
    if (!plan_id || !amount || !interval) {
      return Response.json({ error: "invalid params" }, { status: 400 });
    }

    // check user
    const user = await getUserByUuidAndEmail(user_uuid, user_email);
    if (!user || user.uuid !== user_uuid) {
      return Response.json({ error: "user not found" }, { status: 401 });
    }

    // check subscription plan
    const subscriptionPlan = await getSubscriptionPlan(parseInt(plan_id));
    if (
      !subscriptionPlan ||
      Math.round(amount) !== Math.round(subscriptionPlan.price * 100) ||
      subscriptionPlan.is_active === false ||
      subscriptionPlan.interval !== interval
    ) {
      return Response.json(
        { error: "subscription plan not found" },
        { status: 404 }
      );
    }

    // check existing user subscription
    if (plan_id !== 1 && plan_id !== 8 && plan_id !== 9) {
      const userSubscriptions = await getUserSubscriptionByUserIdAndStatus(
        user.uuid,
        [
          UserSubscriptionStatusEnum.ACTIVE,
          UserSubscriptionStatusEnum.CANCELLED,
        ]
      );
      if (userSubscriptions.length > 0) {
        return Response.json(
          { error: "You already has an active subscription" },
          { status: 500 }
        );
      }
    }

    // Create payment history record
    const createPaymentHistoryRequest: PaymentHistory = {
      user_id: user.uuid,
      subscription_plans_id: plan_id,
      creem_product_id: subscriptionPlan.creem_product_id,
      creem_subscription_id: "",
      creem_customer_id: "",
      creem_checkout_id: "",
      amount: amount,
      currency: "USD",
      status: PaymentStatus.STARTED,
      created_at: new Date(),
    };

    const paymentHistory = await createPaymentHistory(createPaymentHistoryRequest);
    if (!paymentHistory || paymentHistory.id === 0) {
      return Response.json(
        { error: "create payment history failed" },
        { status: 500 }
      );
    }

    // 记录环境变量和请求参数
    console.log('Environment variables:', {
      apiKey: process.env.CREEM_API_KEY ? '***' + process.env.CREEM_API_KEY.slice(-4) : 'NOT SET',
      baseUrl: process.env.CREEM_API_BASE_URL,
      testMode: 'true'
    });

    // 根据订阅周期选择正确的 Creem 产品 ID
    const creemProductId = interval === 'month' 
      ? process.env.CREEM_PRODUCT_MONTHLY_ID 
      : process.env.CREEM_PRODUCT_YEARLY_ID;

    if (!creemProductId) {
      return Response.json(
        { error: `Creem product ID not found for ${interval} interval` },
        { status: 500 }
      );
    }

    // Create Creem checkout session
    const checkoutSession = await creem.createCheckoutSession({
      product_id: creemProductId,
      success_url: `${process.env.WEB_BASE_URI}/pricing?success=true`,
      metadata: {
        project: "ai-video-generator",
        interval: interval,
        userId: String(user.uuid),
        productId: creemProductId,
        paymentHistoryId: String(paymentHistory.id),
        credit: String(subscriptionPlan.credit_per_interval),
        subscriptionPlanId: String(plan_id),
        customer_email: user.email,
      }
    });

    return Response.json({ 
      checkout_url: checkoutSession.checkout_url,
      checkout_id: checkoutSession.id
    });

  } catch (error) {
    console.error("Creem checkout failed: ", error);
    return Response.json(
      { error: "checkout failed" },
      { status: 500 }
    );
  }
}