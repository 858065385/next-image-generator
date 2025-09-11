import { creem } from "@/backend/lib/creem";
import { getUserByUuidAndEmail } from "@/backend/services/user";
import { getSubscriptionPlan } from "@/backend/services/subscription_plan";
import { UserSubscriptionStatusEnum } from "@/backend/types/enum/user_subscription_enum";
import { PaymentStatus } from "@/backend/types/enum/payment_status_enum";
import { PaymentHistory } from "@/backend/types/type";
import { createPaymentHistory } from "@/backend/services/payment_history";
import { getUserSubscriptionByUserIdAndStatus } from "@/backend/services/user_subscription";

/**
 * 创建 Creem 结账会话
 * 
 * 流程：
 * 1. 验证用户身份和参数
 * 2. 检查订阅计划是否存在且有效
 * 3. 防止重复订阅（相同计划）
 * 4. 创建支付历史记录
 * 5. 调用 Creem API 创建结账会话
 * 
 * 请求参数：
 * - plan_id: 订阅计划ID
 * - amount: 金额（分）
 * - interval: 'month' | 'year'
 * - user_uuid: 用户UUID
 * - user_email: 用户邮箱
 * 
 * 响应：
 * - checkout_url: Creem结账页面URL
 * - checkout_id: Creem结账会话ID
 */
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { plan_id, amount, interval, user_uuid, user_email } = await req.json();
    
    // 1. 参数验证
    if (user_uuid === undefined || user_email === undefined) {
      return Response.json({ error: "invalid params" }, { status: 401 });
    }
    if (!plan_id || !amount || !interval) {
      return Response.json({ error: "invalid params" }, { status: 400 });
    }

    // 2. 用户验证
    const user = await getUserByUuidAndEmail(user_uuid, user_email);
    if (!user || user.uuid !== user_uuid) {
      return Response.json({ error: "user not found" }, { status: 401 });
    }

    // 3. 订阅计划验证
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

    // 4. 防止重复订阅检查
    // 所有付费计划都不允许重复订阅相同计划，但允许升级到不同计划
    // 注意：当前系统没有免费计划，只有两个付费计划：
    // - Monthly Pro (ID: 1) - $15.9/月，100积分
    // - Yearly Pro (ID: 2) - $99/年，1200积分
      const userSubscriptions = await getUserSubscriptionByUserIdAndStatus(
      user.uuid,
      [
        UserSubscriptionStatusEnum.ACTIVE,
        // 注释：允许从已取消的订阅升级
        // UserSubscriptionStatusEnum.CANCELLED,
      ]
    );
    if (userSubscriptions.length > 0) {
      const existingPlanId = userSubscriptions[0].subscription_plans_id;
      if (existingPlanId !== parseInt(plan_id)) {
        // 允许升级到不同计划
        console.log(`User upgrading from plan ${existingPlanId} to plan ${plan_id}`);
      } else {
        // 相同计划 - 不允许重复订阅
        return Response.json(
          { error: "You already has an active subscription to this plan" },
          { status: 500 }
        );
      }
    }

    // 5. 创建支付历史记录（状态为 STARTED）
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

    // 6. 根据订阅周期选择 Creem 产品 ID
    // 环境变量配置：
    // - CREEM_PRODUCT_MONTHLY_ID: 月度产品ID
    // - CREEM_PRODUCT_YEARLY_ID: 年度产品ID
    console.log('Environment variables:', {
      apiKey: process.env.CREEM_API_KEY ? '***' + process.env.CREEM_API_KEY.slice(-4) : 'NOT SET',
      baseUrl: process.env.CREEM_API_BASE_URL,
      testMode: 'true'
    });

    const creemProductId = interval === 'month' 
      ? process.env.CREEM_PRODUCT_MONTHLY_ID 
      : process.env.CREEM_PRODUCT_YEARLY_ID;

    if (!creemProductId) {
      return Response.json(
        { error: `Creem product ID not found for ${interval} interval` },
        { status: 500 }
      );
    }

    // 7. 创建 Creem 结账会话
    console.log('Creating Creem checkout session with:', {
      product_id: creemProductId,
      interval,
      userId: user.uuid,
      plan_id,
      email: user.email
    });
    
    let checkoutSession;
    try {
      const successUrl = `${process.env.WEB_BASE_URI}${process.env.CREEM_SUCCESS_URL || '/admin/payment-result?success=true'}`;
      console.log('Creating checkout session with success URL:', successUrl);
      
      checkoutSession = await creem.createCheckoutSession({
        product_id: creemProductId,
        success_url: successUrl,
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
      console.log('Creem checkout session created successfully:', checkoutSession.id);
    } catch (creemError) {
      console.error('Creem API error:', creemError);
      return Response.json(
        { error: `Creem checkout failed: ${creemError.message || creemError}` },
        { status: 500 }
      );
    }

    // 8. 返回结账 URL 给前端
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