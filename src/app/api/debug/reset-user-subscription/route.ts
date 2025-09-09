import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  try {
    const { user_id, reset_credits = false } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({
        code: -1,
        error: 'user_id is required'
      }, { status: 400 });
    }
    
    const db = await getDb();
    
    // 1. 删除用户的订阅记录
    await db.query(`
      DELETE FROM user_subscriptions 
      WHERE user_id = $1
    `, [user_id]);
    
    // 2. 重置积分使用记录（如果需要）
    if (reset_credits) {
      await db.query(`
        UPDATE credit_usage 
        SET 
          user_subscriptions_id = -1,
          is_subscription_active = false,
          used_count = 0,
          period_remain_count = 20,
          period_start = NOW(),
          period_end = NOW() + INTERVAL '30 days',
          updated_at = NOW()
        WHERE user_id = $1
      `, [user_id]);
    }
    
    // 3. 记录清理操作
    try {
      await db.query(`
        INSERT INTO admin_logs (user_id, action, details, created_at)
        VALUES ($1, $2, $3, $4)
      `, [
        'admin',
        'reset_subscription_data',
        JSON.stringify({
          target_user_id: user_id,
          reset_credits,
          action: 'Deleted subscription and reset data for testing'
        }),
        new Date()
      ]);
    } catch (logError) {
      // 日志记录失败不影响主要功能
      console.warn('Failed to log reset operation:', logError);
    }
    
    return NextResponse.json({
      code: 0,
      message: 'User subscription data reset successfully',
      data: {
        user_id,
        subscription_deleted: true,
        credits_reset: reset_credits
      }
    });
    
  } catch (error) {
    console.error('Reset user subscription error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}