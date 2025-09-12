import { NextRequest, NextResponse } from 'next/server';
import { 
  createUserSubscription,
  getUserSubscriptionByUserId,
  updateUserSubscription
} from '@/backend/services/user_subscription';
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage
} from '@/backend/services/credit_usage';
import { UserSubscriptionStatusEnum } from '@/backend/types/enum/user_subscription_enum';
import { getById } from '@/backend/models/subscription_plan';
import { withDev } from '@/lib/auth-middleware';

export const POST = withDev(async (request: NextRequest) => {
  try {
    const { 
      user_id, 
      plan_type = 'monthly', // monthly 或 yearly
      simulate_payment = true 
    } = await request.json();

    if (!user_id) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id is required' 
      }, { status: 400 });
    }

    // 获取订阅计划
    const planId = plan_type === 'yearly' ? 2 : 1; // 1=月度, 2=年度
    const subscriptionPlan = await getById(planId);
    
    if (!subscriptionPlan) {
      return NextResponse.json({
        code: -1,
        error: 'Subscription plan not found'
      }, { status: 404 });
    }

    // 模拟支付成功后的完整流程
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    if (plan_type === 'year') {
      periodEnd.setFullYear(currentDate.getFullYear() + 1);
    } else {
      periodEnd.setMonth(currentDate.getMonth() + 1);
    }

    // 1. 创建/更新用户订阅
    const userSubscriptionParams = {
      user_id,
      subscription_plans_id: planId,
      creem_product_id: `simulated_${plan_type}_product`,
      creem_subscription_id: `simulated_sub_${Date.now()}`,
      creem_customer_id: `simulated_cust_${Date.now()}`,
      status: UserSubscriptionStatusEnum.ACTIVE,
      current_period_start: currentDate,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      created_at: currentDate
    };

    let userSubscription;
    const existingSubscription = await getUserSubscriptionByUserId(user_id);
    
    if (existingSubscription) {
      userSubscription = await updateUserSubscription(userSubscriptionParams);
    } else {
      userSubscription = await createUserSubscription(userSubscriptionParams);
    }

    // 2. 更新积分使用情况（完全模拟支付成功后的逻辑）
    let creditUsage = await getCreditUsageByUserId(user_id);
    const creditAmount = subscriptionPlan.credit_per_interval;

    if (!creditUsage) {
      // 创建新的积分记录
      const newCreditUsage = {
        user_id,
        user_subscriptions_id: userSubscription.id,
        is_subscription_active: true,
        used_count: 0,
        period_remain_count: creditAmount,
        period_start: currentDate,
        period_end: periodEnd,
        created_at: currentDate
      };
      await createCreditUsage(newCreditUsage);
      creditUsage = newCreditUsage;
    } else {
      // 更新现有积分记录（处理续费逻辑）
      if (creditUsage.is_subscription_active) {
        // 订阅续费
        creditUsage.period_remain_count = creditAmount;
      } else {
        // 从非订阅转为订阅，保留剩余积分
        if (creditUsage.period_remain_count > 0 && 
            creditUsage.period_end && 
            new Date(creditUsage.period_end) >= currentDate) {
          creditUsage.period_remain_count += creditAmount;
        } else {
          creditUsage.period_remain_count = creditAmount;
        }
      }
      
      creditUsage.is_subscription_active = true;
      creditUsage.period_start = currentDate;
      creditUsage.period_end = periodEnd;
      creditUsage.user_subscriptions_id = userSubscription.id;
      await updateCreditUsage(creditUsage);
    }

    // 3. 如果需要，创建支付历史记录
    let paymentRecord = null;
    if (simulate_payment) {
      // 这里可以创建支付历史，但测试时可选
      paymentRecord = {
        simulated: true,
        amount: subscriptionPlan.price,
        currency: subscriptionPlan.currency,
        subscription_id: userSubscription.creem_subscription_id,
        payment_date: currentDate
      };
    }

    // 返回完整的结果
    return NextResponse.json({
      code: 0,
      message: `Successfully simulated ${plan_type} subscription payment`,
      data: {
        subscription: userSubscription,
        credit_usage: creditUsage,
        payment_record: paymentRecord,
        plan_info: {
          name: subscriptionPlan.name,
          price: subscriptionPlan.price,
          interval: subscriptionPlan.interval,
          credits_given: creditAmount,
          period_start: currentDate,
          period_end: periodEnd
        },
        summary: {
          user_id,
          action: 'subscription_payment_simulated',
          credits_before: creditAmount - (creditUsage?.period_remain_count || 0),
          credits_after: creditUsage.period_remain_count,
          subscription_active: true,
          next_billing_date: periodEnd
        }
      }
    });

  } catch (error) {
    console.error('Simulate subscription payment error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
});