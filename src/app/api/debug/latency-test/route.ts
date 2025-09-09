import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  const timings = [];
  
  try {
    // 测试连接获取时间
    timings.push({
      name: 'Get DB connection',
      start: Date.now()
    });
    const db = getDb();
    timings[0].end = Date.now();
    timings[0].duration = timings[0].end - timings[0].start;
    
    // 测试连接池获取时间
    timings.push({
      name: 'Get client from pool',
      start: Date.now()
    });
    const client = await db.connect();
    timings[1].end = Date.now();
    timings[1].duration = timings[1].end - timings[1].start;
    
    // 测试简单查询
    timings.push({
      name: 'Simple SELECT NOW()',
      start: Date.now()
    });
    await client.query('SELECT NOW()');
    timings[2].end = Date.now();
    timings[2].duration = timings[2].end - timings[2].start;
    
    // 测试查询特定用户
    const { user_id } = await request.json();
    timings.push({
      name: 'Query user by ID',
      start: Date.now()
    });
    const userResult = await client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [user_id]);
    timings[3].end = Date.now();
    timings[3].duration = timings[3].end - timings[3].start;
    
    // 测试查询积分
    timings.push({
      name: 'Query credit usage',
      start: Date.now()
    });
    const creditResult = await client.query('SELECT * FROM credit_usage WHERE user_id = $1 LIMIT 1', [user_id]);
    timings[4].end = Date.now();
    timings[4].duration = timings[4].end - timings[4].start;
    
    client.release();
    
    return NextResponse.json({
      success: true,
      timings,
      summary: {
        totalDbTime: timings.reduce((sum, t) => sum + t.duration, 0),
        networkLatency: timings[0].duration + timings[1].duration,
        queryTime: timings.slice(2).reduce((sum, t) => sum + t.duration, 0),
        userFound: userResult.rows.length > 0,
        creditFound: creditResult.rows.length > 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}