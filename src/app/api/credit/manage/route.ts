import { NextRequest, NextResponse } from 'next/server';
import { 
  getCreditUsageByUserId, 
  createCreditUsage, 
  updateCreditUsage,
  reducePeriodRemainCountByUserId,
  checkCreditUsageByUserId
} from '@/backend/services/credit_usage';
import { withAdmin } from '@/lib/auth-middleware';

// 获取用户积分信息
export const POST = withAdmin(async (request: NextRequest, context: any) => {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id is required' 
      }, { status: 400 });
    }
    
    const creditUsage = await getCreditUsageByUserId(user_id);
    
    if (!creditUsage) {
      return NextResponse.json({
        code: -1,
        message: 'Credit usage not found for this user',
        data: null
      });
    }
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: creditUsage
    });
  } catch (error) {
    console.error('Get credit usage error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
});

// 创建积分记录
export const PUT = withAdmin(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const { 
      user_id, 
      user_subscriptions_id = -1,
      is_subscription_active = false,
      used_count = 0,
      period_remain_count,
      period_start,
      period_end
    } = body;
    
    if (!user_id || period_remain_count === undefined) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id and period_remain_count are required' 
      }, { status: 400 });
    }
    
    const creditUsage = await createCreditUsage({
      user_id,
      user_subscriptions_id,
      is_subscription_active,
      used_count,
      period_remain_count,
      period_start: period_start || new Date(),
      period_end: period_end || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      created_at: new Date()
    });
    
    return NextResponse.json({
      code: 0,
      message: 'Credit usage created successfully',
      data: creditUsage
    });
  } catch (error) {
    console.error('Create credit usage error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
});

// 更新积分记录
export const PATCH = withAdmin(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const { 
      user_id,
      period_remain_count,
      used_count,
      is_subscription_active,
      period_start,
      period_end
    } = body;
    
    if (!user_id) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id is required' 
      }, { status: 400 });
    }
    
    // 获取现有记录
    const existing = await getCreditUsageByUserId(user_id);
    if (!existing) {
      return NextResponse.json({
        code: -1,
        error: 'Credit usage not found'
      }, { status: 404 });
    }
    
    // 更新记录
    const updated = await updateCreditUsage({
      ...existing,
      period_remain_count: period_remain_count ?? existing.period_remain_count,
      used_count: used_count ?? existing.used_count,
      is_subscription_active: is_subscription_active ?? existing.is_subscription_active,
      period_start: period_start ?? existing.period_start,
      period_end: period_end ?? existing.period_end,
    });
    
    return NextResponse.json({
      code: 0,
      message: 'Credit usage updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update credit usage error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
});