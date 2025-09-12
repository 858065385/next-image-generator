import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/backend/services/user';
import { getUserSubscriptionInfoByUserId } from '@/backend/services/user_subscription';
import { getCreditUsageByUserId } from '@/backend/services/credit_usage';
import { withSelf } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export const GET = withSelf()(async (
  request: NextRequest,
  { params }: { params: { uuid: string } }
) => {
  try {
    const { uuid } = params;
    
    // 获取用户基本信息
    const user = await getUserByUuid(uuid);
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取订阅信息（包含积分余额）
    const subscriptionInfo = await getUserSubscriptionInfoByUserId(uuid);
    
    // 获取详细的积分信息
    const creditDetails = await getCreditUsageByUserId(uuid);
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          locale: user.locale,
          signin_type: user.signin_type
        },
        subscription: subscriptionInfo,
        credits: creditDetails
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
});