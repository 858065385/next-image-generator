import { getUserSubscriptionInfoByUserId } from "@/backend/services/user_subscription";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user_id, last_known_status, timeout = 30000 } = await request.json();

    // 参数验证
    if (!user_id) {
      return Response.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // 长轮询实现
    const startTime = Date.now();
    const pollInterval = 2000; // 每2秒检查一次
    
    // 立即检查一次
    let subscriptionInfo = await getUserSubscriptionInfoByUserId(user_id);
    
    // 如果状态有变化，立即返回
    if (last_known_status && subscriptionInfo?.subscription_status !== last_known_status) {
      return Response.json({
        code: 0,
        message: "Status changed",
        data: {
          subscription: subscriptionInfo,
          status_changed: true,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 长轮询循环
    while (Date.now() - startTime < timeout) {
      // 等待 pollInterval 毫秒
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // 再次检查订阅状态
      subscriptionInfo = await getUserSubscriptionInfoByUserId(user_id);
      
      // 如果状态有变化，返回结果
      if (last_known_status && subscriptionInfo?.subscription_status !== last_known_status) {
        return Response.json({
          code: 0,
          message: "Status changed",
          data: {
            subscription: subscriptionInfo,
            status_changed: true,
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    // 超时返回
    return Response.json({
      code: 0,
      message: "No change",
      data: {
        subscription: subscriptionInfo,
        status_changed: false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in long polling subscription status:", error);
    return Response.json(
      { error: "Failed to poll subscription status" },
      { status: 500 }
    );
  }
}