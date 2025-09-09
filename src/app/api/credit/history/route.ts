import { NextRequest, NextResponse } from 'next/server';
import { getCreditUsageByUserId } from '@/backend/service/credit_usage';
import { pageListEffectResultsByUserId } from '@/backend/service/effect_result';

// 获取积分使用历史
export async function POST(request: NextRequest) {
  try {
    const { user_id, page = 1, page_size = 20 } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id is required' 
      }, { status: 400 });
    }
    
    // 获取当前积分信息
    const creditUsage = await getCreditUsageByUserId(user_id);
    
    // 获取使用历史（effect_result 记录）
    const effectResults = await pageListEffectResultsByUserId(user_id, page, page_size);
    
    // 计算统计数据
    const totalUsed = creditUsage?.used_count || 0;
    const totalRemaining = creditUsage?.period_remain_count || 0;
    const totalCredits = totalUsed + totalRemaining;
    
    // 按日期统计使用情况
    const usageByDate = {};
    effectResults.forEach(result => {
      const date = result.created_at.split('T')[0];
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
          page_size,
          total_items: effectResults.length
        }
      }
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}