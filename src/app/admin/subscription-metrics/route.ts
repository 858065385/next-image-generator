import { getSubscriptionMetrics, getSubscriptionPlanMetrics } from "@/backend/services/subscription_metrics";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // 获取订阅指标
    const metrics = await getSubscriptionMetrics({
      planId: planId ? parseInt(planId) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    });

    // 获取计划统计
    const planMetrics = await getSubscriptionPlanMetrics();

    return Response.json({
      code: 0,
      message: "Success",
      data: {
        summary: metrics,
        plans: planMetrics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error fetching subscription metrics:", error);
    return Response.json(
      { error: "Failed to fetch subscription metrics" },
      { status: 500 }
    );
  }
}