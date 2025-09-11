import { getUserSubscriptionInfoByUserId } from "@/backend/services/user_subscription";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user_id, last_known_status } = await request.json();

    // 参数验证
    if (!user_id) {
      return Response.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // 获取最新的订阅信息
    const subscriptionInfo = await getUserSubscriptionInfoByUserId(user_id);

    // 检查状态是否有变化
    const statusChanged = last_known_status && 
      subscriptionInfo?.subscription_status !== last_known_status;

    // 返回响应
    return Response.json({
      code: 0,
      message: "Success",
      data: {
        subscription: subscriptionInfo,
        status_changed: statusChanged,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error polling subscription status:", error);
    return Response.json(
      { error: "Failed to poll subscription status" },
      { status: 500 }
    );
  }
}