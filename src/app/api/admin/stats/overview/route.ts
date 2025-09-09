import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function GET() {
  try {
    const db = await getDb();
    
    // 获取用户总数
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userCount.rows[0].count);
    
    // 获取活跃订阅数
    const activeSubscriptions = await db.query(`
      SELECT COUNT(*) as count 
      FROM user_subscriptions 
      WHERE status = 'active'
    `);
    const totalActiveSubscriptions = parseInt(activeSubscriptions.rows[0].count);
    
    // 获取今日新增用户
    const todayUsers = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    const newUsersToday = parseInt(todayUsers.rows[0].count);
    
    // 获取积分统计
    const creditStats = await db.query(`
      SELECT 
        SUM(period_remain_count) as total_credits,
        SUM(used_count) as total_used,
        COUNT(*) as total_users_with_credits
      FROM credit_usage
    `);
    
    // 获取订阅计划分布
    const subscriptionDistribution = await db.query(`
      SELECT 
        sp.name,
        sp.interval,
        COUNT(us.id) as count
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.subscription_plans_id = sp.id
      WHERE us.status = 'active'
      GROUP BY sp.id, sp.name, sp.interval
      ORDER BY count DESC
    `);
    
    // 获取最近7天的用户增长
    const userGrowth = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        users: {
          total: totalUsers,
          new_today: newUsersToday,
          growth_7d: userGrowth.rows
        },
        subscriptions: {
          total_active: totalActiveSubscriptions,
          distribution: subscriptionDistribution.rows
        },
        credits: {
          total_credits: parseInt(creditStats.rows[0].total_credits) || 0,
          total_used: parseInt(creditStats.rows[0].total_used) || 0,
          users_with_credits: parseInt(creditStats.rows[0].total_users_with_credits) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}