import { NextRequest, NextResponse } from 'next/server';
import { 
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId
} from '@/backend/services/user_subscription';
import { 
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage
} from '@/backend/services/credit_usage';
import { UserSubscriptionStatusEnum } from '@/backend/types/enum/user_subscription_enum';
import { getById } from '@/backend/models/subscription_plan';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ID格式为 "uuid,email"
    const [uuid, email] = params.id.split(',');
    const userId = uuid;
    const { 
      subscription_plan_id, 
      status, 
      action = 'create',
      custom_credits 
    } = await request.json();
    
    if (!subscription_plan_id) {
      return NextResponse.json({
        code: -1,
        error: 'subscription_plan_id is required'
      }, { status: 400 });
    }
    
    // 获取订阅计划
    const subscriptionPlan = await getById(subscription_plan_id);
    if (!subscriptionPlan) {
      return NextResponse.json({
        code: -1,
        error: 'Subscription plan not found'
      }, { status: 404 });
    }
    
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    if (subscriptionPlan.interval === 'year') {
      periodEnd.setFullYear(currentDate.getFullYear() + 1);
    } else {
      periodEnd.setMonth(currentDate.getMonth() + 1);
    }
    
    let userSubscription;
    const existingSubscription = await getUserSubscriptionByUserId(userId);
    
    if (action === 'create' || !existingSubscription) {
      // 创建新订阅
      const subscriptionParams = {
        user_id: userId,
        subscription_plans_id: subscription_plan_id,
        creem_product_id: `admin_${subscriptionPlan.interval}`,
        creem_subscription_id: `admin_sub_${Date.now()}`,
        creem_customer_id: `admin_cust_${Date.now()}`,
        status: status || UserSubscriptionStatusEnum.ACTIVE,
        current_period_start: currentDate,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        created_at: currentDate
      };
      
      userSubscription = await createUserSubscription(subscriptionParams);
    } else {
      // 更新现有订阅
      existingSubscription.subscription_plans_id = subscription_plan_id;
      existingSubscription.status = status || existingSubscription.status;
      existingSubscription.current_period_start = currentDate;
      existingSubscription.current_period_end = periodEnd;
      existingSubscription.updated_at = currentDate;
      
      userSubscription = await updateUserSubscription(existingSubscription);
    }
    
    // 更新积分使用情况
    let creditUsage = await getCreditUsageByUserId(userId);
    const creditAmount = custom_credits || subscriptionPlan.credit_per_interval;
    
    if (!creditUsage) {
      // 创建新的积分记录
      const newCreditUsage = {
        user_id: userId,
        user_subscriptions_id: userSubscription.id,
        is_subscription_active: true,
        used_count: 0,
        period_remain_count: creditAmount,
        period_start: currentDate,
        period_end: periodEnd,
        created_at: currentDate
      };
      await createCreditUsage(newCreditUsage);
    } else {
      // 更新现有积分记录
      creditUsage.is_subscription_active = true;
      creditUsage.period_remain_count = creditAmount;
      creditUsage.period_start = currentDate;
      creditUsage.period_end = periodEnd;
      creditUsage.user_subscriptions_id = userSubscription.id;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }
    
    return NextResponse.json({
      code: 0,
      message: `Subscription ${action === 'create' ? 'created' : 'updated'} successfully`,
      data: {
        subscription: userSubscription,
        credit_usage: creditUsage,
        plan_info: {
          name: subscriptionPlan.name,
          price: subscriptionPlan.price,
          interval: subscriptionPlan.interval,
          credits_given: creditAmount,
          period_start: currentDate,
          period_end: periodEnd
        }
      }
    });
  } catch (error) {
    console.error('Update user subscription error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}