import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  try {
    const { user_uuid } = await request.json();
    
    if (!user_uuid) {
      return NextResponse.json({ error: 'user_uuid is required' }, { status: 400 });
    }
    
    const db = getDb();
    const client = await db.connect();
    
    // 查询用户订阅信息
    const subscriptionQuery = await client.query(`
      SELECT us.*, sp.name as plan_name, sp.price, sp.interval, sp.credit_per_interval
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.subscription_plans_id = sp.id
      WHERE us.user_id = $1
      ORDER BY us.created_at DESC
      LIMIT 5
    `, [user_uuid]);
    
    // 查询积分使用情况
    const creditQuery = await client.query(`
      SELECT * FROM credit_usage
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [user_uuid]);
    
    // 查询支付历史
    const paymentQuery = await client.query(`
      SELECT ph.*, sp.name as plan_name
      FROM payment_history ph
      LEFT JOIN subscription_plans sp ON ph.subscription_plans_id = sp.id
      WHERE ph.user_id = $1
      ORDER BY ph.created_at DESC
      LIMIT 10
    `, [user_uuid]);
    
    client.release();
    
    return NextResponse.json({
      user_uuid,
      subscriptions: subscriptionQuery.rows,
      credit_usage: creditQuery.rows,
      payment_history: paymentQuery.rows
    });
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}