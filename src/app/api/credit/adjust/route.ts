import { NextRequest, NextResponse } from 'next/server';
import { 
  getCreditUsageByUserId,
  reducePeriodRemainCountByUserId,
  checkCreditUsageByUserId,
  updateCreditUsage
} from '@/backend/service/credit_usage';

// 增加积分
export async function POST(request: NextRequest) {
  try {
    const { user_id, amount, reason } = await request.json();
    
    if (!user_id || amount === undefined) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id and amount are required' 
      }, { status: 400 });
    }
    
    const creditUsage = await getCreditUsageByUserId(user_id);
    
    if (!creditUsage) {
      return NextResponse.json({
        code: -1,
        error: 'Credit usage not found for this user'
      }, { status: 404 });
    }
    
    // 增加积分
    const newRemainCount = creditUsage.period_remain_count + amount;
    const updated = await updateCreditUsage({
      ...creditUsage,
      period_remain_count: newRemainCount
    });
    
    return NextResponse.json({
      code: 0,
      message: `Credits added successfully. Added: ${amount}, Current: ${newRemainCount}`,
      data: updated,
      transaction: {
        user_id,
        amount,
        type: 'add',
        reason: reason || 'Manual addition',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}

// 扣除积分
export async function DELETE(request: NextRequest) {
  try {
    const { user_id, amount, reason } = await request.json();
    
    if (!user_id || amount === undefined) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id and amount are required' 
      }, { status: 400 });
    }
    
    // 检查积分是否足够
    const checkResult = await checkCreditUsageByUserId(user_id, amount);
    if (checkResult !== 1) {
      const errorMsg = checkResult === -2 ? 'Insufficient credits' : 
                      checkResult === -3 ? 'Credit limit exceeded' : 
                      'Credit check failed';
      return NextResponse.json({
        code: checkResult,
        error: errorMsg
      }, { status: 400 });
    }
    
    // 扣除积分
    await reducePeriodRemainCountByUserId(user_id, amount);
    
    // 获取更新后的积分信息
    const updated = await getCreditUsageByUserId(user_id);
    
    return NextResponse.json({
      code: 0,
      message: `Credits deducted successfully. Deducted: ${amount}, Remaining: ${updated.period_remain_count}`,
      data: updated,
      transaction: {
        user_id,
        amount,
        type: 'deduct',
        reason: reason || 'Manual deduction',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}