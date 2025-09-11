import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/backend/services/user';
import { getUserSubscriptionInfoByUserId } from '@/backend/services/user_subscription';
import { getCreditUsageByUserId } from '@/backend/services/credit_usage';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const userUuid = params.uuid;
    
    // 获取用户基本信息
    const user = await getUserByUuid(userUuid);
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取订阅信息
    const subscriptionInfo = await getUserSubscriptionInfoByUserId(userUuid);
    
    // 获取积分详情（subscriptionInfo已包含基本积分信息，这里获取详细信息）
    const creditUsage = await getCreditUsageByUserId(userUuid);
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        user,
        subscription: subscriptionInfo,
        credits: creditUsage
      }
    });
  } catch (error) {
    console.error('Get user by UUID error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}