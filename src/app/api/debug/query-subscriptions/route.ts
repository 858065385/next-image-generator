import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // 查询所有订阅记录
    const result = await db.query(`
      SELECT 
        us.id,
        us.user_id,
        us.creem_subscription_id,
        us.creem_customer_id,
        us.subscription_plans_id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.created_at,
        us.updated_at,
        us.canceled_at,
        u.email as user_email,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.interval as plan_interval
      FROM user_subscriptions us
      LEFT JOIN users u ON us.user_id = u.uuid
      LEFT JOIN subscription_plans sp ON us.subscription_plans_id = sp.id
      ORDER BY us.created_at DESC
      LIMIT 20
    `);
    
    // 查询最新的 webhook 事件
    const webhookResult = await db.query(`
      SELECT 
        id,
        event_id,
        event_type,
        processed,
        created_at
      FROM creem_webhook_events
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    // 查询积分使用情况
    const creditResult = await db.query(`
      SELECT 
        id,
        user_id,
        user_subscriptions_id,
        period_remain_count,
        used_count,
        is_subscription_active,
        period_start,
        period_end,
        created_at,
        updated_at
      FROM credit_usage
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    return NextResponse.json({
      subscriptions: result.rows,
      webhooks: webhookResult.rows,
      credit_usage: creditResult.rows,
      total_subscriptions: result.rowCount,
      total_webhooks: webhookResult.rowCount,
      total_credit_records: creditResult.rowCount
    });
    
  } catch (error) {
    console.error('Error querying database:', error);
    return NextResponse.json(
      { error: 'Failed to query database' },
      { status: 500 }
    );
  }
}