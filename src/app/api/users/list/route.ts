import { NextRequest, NextResponse } from 'next/server';
import { searchUsers as searchUsersService } from '@/backend/services/user';
import { getUserSubscriptionInfoByUserId } from '@/backend/services/user_subscription';
import { getCreditUsageByUserId } from '@/backend/services/credit_usage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // 获取用户列表（注意：当前不支持排序参数）
    const usersResult = await searchUsersService(search, page, limit);
    
    // 为每个用户获取订阅和积分信息
    const usersWithDetails = await Promise.all(
      usersResult.users.map(async (user) => {
        try {
          const subscriptionInfo = await getUserSubscriptionInfoByUserId(user.uuid);
          const creditInfo = await getCreditUsageByUserId(user.uuid);
          
          return {
            ...user,
            subscription: subscriptionInfo,
            credits: creditInfo
          };
        } catch (error) {
          console.error(`Failed to get details for user ${user.uuid}:`, error);
          return {
            ...user,
            subscription: null,
            credits: null
          };
        }
      })
    );

    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        users: usersWithDetails,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: usersResult.total,
          total_pages: Math.ceil(usersResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users list error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}