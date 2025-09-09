import { NextRequest, NextResponse } from 'next/server';
import { 
  getCreditUsageByUserId, 
  updateCreditUsage,
  createCreditUsage
} from '@/backend/service/credit_usage';
import { getUserByUuidAndEmail } from '@/backend/service/user';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { amount, reason, operation = 'add' } = await request.json();
    
    if (amount === undefined || isNaN(amount)) {
      return NextResponse.json({
        code: -1,
        error: 'Invalid amount'
      }, { status: 400 });
    }
    
    // 验证用户存在 - ID格式为 "uuid,email"
    const [uuid, email] = userId.split(',');
    const user = await getUserByUuidAndEmail(uuid, email || '');
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取当前积分信息
    let creditUsage = await getCreditUsageByUserId(uuid);
    const numAmount = parseInt(amount);
    
    if (!creditUsage) {
      // 如果没有积分记录，创建一个
      const newCreditUsage = {
        user_id: uuid,
        user_subscriptions_id: -1, // 无订阅
        is_subscription_active: false,
        used_count: 0,
        period_remain_count: operation === 'add' ? numAmount : Math.max(0, -numAmount),
        period_start: new Date(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        created_at: new Date()
      };
      creditUsage = await createCreditUsage(newCreditUsage);
    } else {
      // 更新现有积分
      const newRemainCount = operation === 'add' 
        ? creditUsage.period_remain_count + numAmount
        : Math.max(0, creditUsage.period_remain_count - numAmount);
      
      creditUsage.period_remain_count = newRemainCount;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
    
    // 记录操作日志（这里可以扩展为专门的日志表）
    console.log(`Admin adjusted credits for user ${userId}: ${operation} ${numAmount}, reason: ${reason}`);
    
    return NextResponse.json({
      code: 0,
      message: `Credits ${operation === 'add' ? 'added' : 'deducted'} successfully`,
      data: {
        user_id: uuid,
        operation,
        amount: numAmount,
        new_balance: creditUsage.period_remain_count,
        reason: reason || 'Manual adjustment by admin',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Adjust user credits error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}