import { getRecentWebhookEventsByUserId } from "@/backend/services/creem_webhook";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user_id, since } = await request.json();

    // 参数验证
    if (!user_id) {
      return Response.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // 设置默认时间（5分钟前）
    const sinceTime = since || new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // 获取最近的 webhook 事件
    const events = await getRecentWebhookEventsByUserId(user_id, sinceTime);

    // 返回响应
    return Response.json({
      code: 0,
      message: "Success",
      data: {
        events,
        count: events.length,
        since: sinceTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error polling webhook events:", error);
    return Response.json(
      { error: "Failed to poll webhook events" },
      { status: 500 }
    );
  }
}