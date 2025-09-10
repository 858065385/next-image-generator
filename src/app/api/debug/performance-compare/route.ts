import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionInfoByUserId } from '@/backend/services/user_subscription';
import { getUserSubscriptionInfoOptimized } from '@/backend/services/user_subscription_optimized';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    const results = [];
    
    // 测试原始版本
    console.log('Testing original version...');
    const start1 = Date.now();
    const result1 = await getUserSubscriptionInfoByUserId(user_id);
    const duration1 = Date.now() - start1;
    results.push({
      version: 'Original',
      duration: duration1,
      result: result1
    });
    
    // 等待一下避免连接池影响
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 测试优化版本
    console.log('Testing optimized version...');
    const start2 = Date.now();
    const result2 = await getUserSubscriptionInfoOptimized(user_id);
    const duration2 = Date.now() - start2;
    results.push({
      version: 'Optimized',
      duration: duration2,
      result: result2
    });
    
    return NextResponse.json({
      success: true,
      comparison: results,
      improvement: ((duration1 - duration2) / duration1 * 100).toFixed(2) + '%'
    });
  } catch (error) {
    console.error('Performance test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}