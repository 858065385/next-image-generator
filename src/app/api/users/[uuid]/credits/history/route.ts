import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/backend/services/user';
import { getCreditUsageByUserId } from '@/backend/services/credit_usage';
import { pageListEffectResultsByUserId } from '@/backend/services/effect_result';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    
    // 验证用户存在
    const user = await getUserByUuid(uuid);
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取当前积分信息
    const creditUsage = await getCreditUsageByUserId(uuid);
    
    // 获取使用历史（effect_result 记录）
    const effectResults = await pageListEffectResultsByUserId(uuid, page, pageSize);
    
    // 计算统计数据
    const totalUsed = creditUsage?.used_count || 0;
    const totalRemaining = creditUsage?.period_remain_count || 0;
    const totalCredits = totalUsed + totalRemaining;
    
    // 按日期统计使用情况
    const usageByDate = {};
    effectResults.forEach(result => {
      const date = new Date(result.created_at).toISOString().split('T')[0];
      if (!usageByDate[date]) {
        usageByDate[date] = {
          date,
          count: 0,
          credits: 0
        };
      }
      usageByDate[date].count++;
      usageByDate[date].credits += result.credit || 0;
    });
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        current_balance: {
          total_credits: totalCredits,
          used: totalUsed,
          remaining: totalRemaining,
          period_start: creditUsage?.period_start,
          period_end: creditUsage?.period_end,
          is_active: creditUsage?.is_subscription_active
        },
        usage_history: effectResults,
        usage_by_date: Object.values(usageByDate),
        pagination: {
          current_page: page,
          page_size: pageSize,
          total_items: effectResults.length
        }
      }
    });
  } catch (error) {
    console.error('Get user credit history error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}