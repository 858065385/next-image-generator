import { creem } from "@/backend/lib/creem";
import { getUserByUuid } from "@/backend/services/user";
import { getUserSubscriptionByUserIdAndStatus } from "@/backend/services/user_subscription";
import { createPaymentHistory } from "@/backend/services/payment_history";
import { PaymentStatus } from "@/backend/types/enum/payment_status_enum";
import { UserSubscriptionStatusEnum } from "@/backend/types/enum/user_subscription_enum";
import { SubscriptionLogger } from "@/backend/utils/subscription-logger";

export async function POST(request: Request) {
  try {
    const { user_id, reason } = await request.json();

    // 1. 参数验证
    if (!user_id) {
      SubscriptionLogger.warn("Missing user_id in cancel subscription request", {
        operation: "cancel_subscription",
        metadata: { reason }
      });
      return Response.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // 2. 验证用户存在
    const user = await getUserByUuid(user_id);
    if (!user) {
      SubscriptionLogger.warn("User not found for cancellation", {
        userId: user_id,
        operation: "cancel_subscription",
        metadata: { reason }
      });
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. 获取用户的活跃订阅
    const activeSubscriptions = await getUserSubscriptionByUserIdAndStatus(
      user_id,
      [UserSubscriptionStatusEnum.ACTIVE, UserSubscriptionStatusEnum.TRIALING]
    );

    if (activeSubscriptions.length === 0) {
      SubscriptionLogger.warn("No active subscription found for cancellation", {
        userId: user_id,
        operation: "cancel_subscription",
        metadata: { reason }
      });
      return Response.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const subscription = activeSubscriptions[0];
    
    SubscriptionLogger.logSubscriptionOperation(
      "cancel_subscription_initiated",
      user_id,
      subscription.id?.toString(),
      subscription.creem_subscription_id,
      { reason, cancelAtPeriodEnd: true }
    );

    // 4. 如果是 Creem 订阅，调用 Creem API 取消
    if (subscription.creem_subscription_id) {
      try {
        await creem.cancelSubscription(subscription.creem_subscription_id, true);
        SubscriptionLogger.info("Creem subscription cancelled successfully", {
          userId: user_id,
          subscriptionId: subscription.id?.toString(),
          creemSubscriptionId: subscription.creem_subscription_id,
          operation: "cancel_creem_subscription"
        });
      } catch (creemError) {
        SubscriptionLogger.error("Failed to cancel Creem subscription", {
          userId: user_id,
          subscriptionId: subscription.id?.toString(),
          creemSubscriptionId: subscription.creem_subscription_id,
          operation: "cancel_creem_subscription"
        }, creemError);
        // 即使 Creem 取消失败，我们仍然标记为本地取消，后续通过 webhook 同步
      }
    }

    // 5. 更新本地订阅状态为取消
    // 注意：这里不直接更新数据库，而是通过 webhook 来处理状态变更
    // 这样可以确保状态与 Creem 保持一致

    // 6. 记录取消历史
    const cancelRecord = {
      user_id: user_id,
      subscription_plans_id: subscription.subscription_plans_id.toString(),
      creem_product_id: subscription.creem_product_id || "",
      creem_subscription_id: subscription.creem_subscription_id || "",
      creem_customer_id: subscription.creem_customer_id || "",
      creem_checkout_id: "",
      amount: 0, // 取消订阅没有金额
      currency: "USD",
      status: PaymentStatus.CANCELLED,
      created_at: new Date(),
    };

    const paymentHistory = await createPaymentHistory(cancelRecord);
    
    SubscriptionLogger.logPaymentOperation(
      "subscription_cancelled",
      user_id,
      paymentHistory.id?.toString(),
      0,
      "CANCELLED",
      { 
        reason, 
        subscriptionId: subscription.id,
        creemSubscriptionId: subscription.creem_subscription_id
      }
    );

    // 7. 返回成功响应
    const responseData = {
      subscription_id: subscription.id,
      creem_subscription_id: subscription.creem_subscription_id,
      cancel_at_period_end: true,
      current_period_end: subscription.current_period_end,
      reason: reason || "User requested cancellation"
    };
    
    SubscriptionLogger.logSubscriptionOperation(
      "cancel_subscription_success",
      user_id,
      subscription.id?.toString(),
      subscription.creem_subscription_id,
      responseData
    );
    
    return Response.json({
      code: 0,
      message: "Subscription cancellation initiated",
      data: responseData
    });

  } catch (error) {
    SubscriptionLogger.error("Unexpected error during subscription cancellation", {
      userId: user_id,
      operation: "cancel_subscription",
      metadata: { reason }
    }, error);
    
    return Response.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}