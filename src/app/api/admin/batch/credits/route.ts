import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  try {
    const { user_ids, amount, reason, operation = 'add' } = await request.json();
    
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json({
        code: -1,
        error: 'user_ids must be a non-empty array'
      }, { status: 400 });
    }
    
    if (amount === undefined || isNaN(amount)) {
      return NextResponse.json({
        code: -1,
        error: 'Invalid amount'
      }, { status: 400 });
    }
    
    const db = await getDb();
    const results = [];
    const errors = [];
    const numAmount = parseInt(amount);
    
    // 批量处理每个用户
    for (const userId of user_ids) {
      try {
        // 检查用户是否存在
        const userCheck = await db.query('SELECT uuid FROM users WHERE uuid = $1', [userId]);
        if (userCheck.rowCount === 0) {
          errors.push({ user_id: userId, error: 'User not found' });
          continue;
        }
        
        // 获取或创建积分记录
        let creditUsage = await db.query(
          'SELECT * FROM credit_usage WHERE user_id = $1',
          [userId]
        );
        
        if (creditUsage.rowCount === 0) {
          // 创建新的积分记录
          const newCreditUsage = await db.query(`
            INSERT INTO credit_usage (
              user_id, user_subscriptions_id, is_subscription_active, 
              used_count, period_remain_count, period_start, period_end, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `, [
            userId,
            -1, // 无订阅
            false,
            0,
            operation === 'add' ? numAmount : Math.max(0, -numAmount),
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            new Date()
          ]);
          
          results.push({
            user_id: userId,
            action: 'created',
            new_balance: newCreditUsage.rows[0].period_remain_count
          });
        } else {
          // 更新现有积分
          const currentCredits = creditUsage.rows[0].period_remain_count;
          const newBalance = operation === 'add' 
            ? currentCredits + numAmount 
            : Math.max(0, currentCredits - numAmount);
          
          await db.query(`
            UPDATE credit_usage 
            SET period_remain_count = $1, updated_at = $2
            WHERE user_id = $3
          `, [newBalance, new Date(), userId]);
          
          results.push({
            user_id: userId,
            action: 'updated',
            old_balance: currentCredits,
            new_balance: newBalance
          });
        }
        
        // 记录批量操作日志
        await db.query(`
          INSERT INTO admin_logs (user_id, action, details, created_at)
          VALUES ($1, $2, $3, $4)
        `, [
          'admin', // 管理员ID，可以从session获取
          `batch_credit_${operation}`,
          JSON.stringify({
            target_user_id: userId,
            amount: numAmount,
            reason: reason || 'Batch credit adjustment'
          }),
          new Date()
        ]);
        
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        errors.push({ user_id: userId, error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return NextResponse.json({
      code: 0,
      message: `Batch credit ${operation} completed`,
      data: {
        processed: results.length,
        failed: errors.length,
        results,
        errors
      }
    });
    
  } catch (error) {
    console.error('Batch credit adjustment error:', error);
    return NextResponse.json({
      code: -1,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}