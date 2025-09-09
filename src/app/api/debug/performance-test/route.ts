import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionInfoByUserId } from '@/backend/service/user_subscription';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timings = [];
  
  try {
    const { user_id } = await request.json();
    
    // 测试1: 直接数据库查询
    timings.push({
      name: 'Total getUserSubscriptionInfoByUserId',
      start: Date.now()
    });
    
    const result = await getUserSubscriptionInfoByUserId(user_id);
    
    timings[0].end = Date.now();
    timings[0].duration = timings[0].end - timings[0].start;
    
    // 测试2: 分解每个查询
    const db = getDb();
    const client = await db.connect();
    
    // 查询用户订阅
    timings.push({
      name: 'getInfoByUserId query',
      start: Date.now()
    });
    
    const userSubQuery = await client.query(
      `SELECT us.*, cu.period_remain_count 
       FROM user_subscriptions us 
       JOIN credit_usage cu ON us.id = cu.user_subscriptions_id 
       WHERE us.user_id = $1`, 
      [user_id]
    );
    
    timings[1].end = Date.now();
    timings[1].duration = timings[1].end - timings[1].start;
    
    // 查询积分使用（如果没有订阅）
    timings.push({
      name: 'credit_usage query',
      start: Date.now()
    });
    
    if (!userSubQuery.rows[0]) {
      const creditQuery = await client.query(
        'SELECT * FROM credit_usage WHERE user_id = $1',
        [user_id]
      );
      timings[2].end = Date.now();
      timings[2].duration = timings[2].end - timings[2].start;
    } else {
      timings[2].end = Date.now();
      timings[2].duration = 0;
    }
    
    client.release();
    
    const totalDuration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      result,
      performance: {
        totalDuration,
        breakdown: timings,
        connectionPool: {
          totalConnections: db.totalCount,
          idleConnections: db.idleCount,
          waitingConnections: db.waitingCount
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      totalDuration: Date.now() - startTime
    }, { status: 500 });
  }
}