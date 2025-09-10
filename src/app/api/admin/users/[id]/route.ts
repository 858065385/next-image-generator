import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuidAndEmail } from '@/backend/services/user';
import { getUserSubscriptionInfoByUserId } from '@/backend/services/user_subscription';
import { getCreditUsageByUserId } from '@/backend/services/credit_usage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // 获取用户基本信息 - ID格式为 "uuid,email"
    const [uuid, email] = userId.split(',');
    const user = await getUserByUuidAndEmail(uuid, email || '');
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取订阅信息
    const subscriptionInfo = await getUserSubscriptionInfoByUserId(uuid);
    
    // 获取积分信息
    const creditUsage = await getCreditUsageByUserId(uuid);
    
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
    console.error('Get user detail error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}