import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionByUserId } from '@/backend/services/user_subscription';
import { createUserSubscription } from '@/backend/services/user_subscription';
import { getCreditUsageByUserId, updateCreditUsage } from '@/backend/services/credit_usage';
import { getById } from '@/backend/models/subscription_plan';

// 设置用户为月度会员
export async function POST(request: NextRequest) {
  try {
    const { user_id, plan_type = 'monthly' } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ 
        code: -1,
        error: 'user_id is required' 
      }, { status: 400 });
    }
    
    // 获取订阅计划
    const planId = plan_type === 'yearly' ? 2 : 1; // 假设 1 是月度，2 是年度
    const subscriptionPlan = await getById(planId);
    
    if (!subscriptionPlan) {
      return NextResponse.json({
        code: -1,
        error: 'Subscription plan not found'
      }, { status: 404 });
    }
    
    // 检查是否已有订阅
    const existingSubscription = await getUserSubscriptionByUserId(user_id);
    
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan_type === 'yearly' ? 12 : 1));
    
    if (existingSubscription) {
      // 更新现有订阅
      // 这里需要实现更新逻辑，暂时先创建新的
      console.log('Existing subscription found, creating new one...');
    }
    
    // 创建新的订阅记录
    const newSubscription = await createUserSubscription({
      user_id,
      creem_product_id: `manual_${plan_type}`,
      subscription_plans_id: planId,
      creem_subscription_id: `manual_sub_${Date.now()}`,
      creem_customer_id: `manual_cust_${Date.now()}`,
      status: 'active',
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      created_at: now
    });
    
    // 更新或创建积分记录
    let creditUsage = await getCreditUsageByUserId(user_id);
    
    if (creditUsage) {
      // 更新现有积分记录
      await updateCreditUsage({
        ...creditUsage,
        user_subscriptions_id: newSubscription.id,
        is_subscription_active: true,
        period_remain_count: subscriptionPlan.credit_per_interval,
        used_count: 0,
        period_start: now,
        period_end: periodEnd
      });
    } else {
      // 创建新的积分记录
      await require('@/backend/services/credit_usage').then(({ createCreditUsage }) => 
        createCreditUsage({
          user_id,
          user_subscriptions_id: newSubscription.id,
          is_subscription_active: true,
          used_count: 0,
          period_remain_count: subscriptionPlan.credit_per_interval,
          period_start: now,
          period_end: periodEnd,
          created_at: now
        })
      );
    }
    
    // 获取更新后的积分信息
    creditUsage = await getCreditUsageByUserId(user_id);
    
    return NextResponse.json({
      code: 0,
      message: `Successfully set user to ${plan_type} plan`,
      data: {
        subscription: newSubscription,
        credit_usage: creditUsage,
        plan_info: {
          name: subscriptionPlan.name,
          price: subscriptionPlan.price,
          interval: subscriptionPlan.interval,
          credits_given: subscriptionPlan.credit_per_interval
        }
      }
    });
  } catch (error) {
    console.error('Set subscription error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}