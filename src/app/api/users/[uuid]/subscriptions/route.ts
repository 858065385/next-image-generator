import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuid } from '@/backend/services/user';
import { getUserSubscriptionByUserId } from '@/backend/services/user_subscription';
import { getPaymentHistoryByUserId } from '@/backend/services/payment_history';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const { uuid } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // 验证用户存在
    const user = await getUserByUuid(uuid);
    if (!user) {
      return NextResponse.json({
        code: -1,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取订阅记录
    const subscriptions = await getUserSubscriptionByUserId(uuid);
    
    // 获取支付历史
    const paymentHistory = await getPaymentHistoryByUserId(uuid, page, limit);
    
    // 合并和格式化数据
    const subscriptionHistory = [];
    
    // 添加当前订阅（如果有）
    if (subscriptions) {
      subscriptionHistory.push({
        id: subscriptions.id,
        plan_name: subscriptionInfo?.plan_name || `Plan ${subscriptions.subscription_plans_id}`,
        status: subscriptions.status,
        current_period_start: subscriptions.current_period_start,
        current_period_end: subscriptions.current_period_end,
        created_at: subscriptions.created_at,
        cancel_at_period_end: subscriptions.cancel_at_period_end,
        type: 'subscription'
      });
    }
    
    // 添加支付记录
    if (paymentHistory && paymentHistory.records) {
      paymentHistory.records.forEach(payment => {
        subscriptionHistory.push({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          creem_checkout_id: payment.creem_checkout_id,
          creem_subscription_id: payment.creem_subscription_id,
          created_at: payment.created_at,
          type: 'payment'
        });
      });
    }
    
    // 按时间排序
    subscriptionHistory.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // 分页处理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = subscriptionHistory.slice(startIndex, endIndex);
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: {
        history: paginatedHistory,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: subscriptionHistory.length,
          total_pages: Math.ceil(subscriptionHistory.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user subscription history error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}