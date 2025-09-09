export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    
    const db = await getDb();
    
    // 根据时间段设置间隔
    let interval;
    let pgInterval;
    switch (period) {
      case '7d':
        interval = '1 day';
        pgInterval = '7 days';
        break;
      case '30d':
        interval = '1 day';
        pgInterval = '30 days';
        break;
      case '90d':
        interval = '7 days';
        pgInterval = '90 days';
        break;
      case '1y':
        interval = '1 month';
        pgInterval = '1 year';
        break;
      default:
        interval = '1 day';
        pgInterval = '7 days';
    }
    
    // 获取积分使用趋势
    const creditUsageTrend = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as period,
        SUM(credit) as total_credits_used,
        COUNT(*) as total_generations
      FROM effect_result
      WHERE created_at >= CURRENT_DATE - INTERVAL '${pgInterval}'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY period ASC
    `);
    
    // 获取热门功能统计
    const popularFeatures = await db.query(`
      SELECT 
        e.name,
        e.credit,
        COUNT(er.id) as usage_count,
        SUM(er.credit) as total_credits_used
      FROM effect_result er
      JOIN effect e ON er.effect_id = e.id
      WHERE er.created_at >= CURRENT_DATE - INTERVAL '${period}'
      GROUP BY e.id, e.name, e.credit
      ORDER BY usage_count DESC
      LIMIT 10
    `);
    
    // 获取积分余额分布
    const creditDistribution = await db.query(`
      SELECT 
        CASE 
          WHEN period_remain_count = 0 THEN '0'
          WHEN period_remain_count BETWEEN 1 AND 10 THEN '1-10'
          WHEN period_remain_count BETWEEN 11 AND 50 THEN '11-50'
          WHEN period_remain_count BETWEEN 51 AND 100 THEN '51-100'
          WHEN period_remain_count BETWEEN 101 AND 500 THEN '101-500'
          ELSE '500+'
        END as range,
        COUNT(*) as count
      FROM credit_usage
      GROUP BY range
      ORDER BY range
    `);
    
    // 获取Top积分用户
    const topCreditUsers = await db.query(`
      SELECT 
        u.uuid,
        u.email,
        u.nickname,
        cu.period_remain_count as credits,
        cu.used_count as used
      FROM credit_usage cu
      JOIN users u ON cu.user_id = u.uuid
      ORDER BY cu.period_remain_count DESC
      LIMIT 20
    `);
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        period,
        usage_trend: creditUsageTrend.rows,
        popular_features: popularFeatures.rows,
        credit_distribution: creditDistribution.rows,
        top_users: topCreditUsers.rows
      }
    });
  } catch (error) {
    console.error('Get credit stats error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}