import { NextRequest, NextResponse } from 'next/server';
import { getUserByUuidAndEmail } from '@/backend/services/user';
import { getSubscriptionPlan } from '@/backend/services/subscription_plan';
import { getUserSubscriptionByUserIdAndStatus } from '@/backend/services/user_subscription';
import { createPaymentHistory } from '@/backend/services/payment_history';
import { PaymentHistory } from '@/backend/types/type';
import { UserSubscriptionStatusEnum } from '@/backend/types/enum/user_subscription_enum';
import { PaymentStatus } from '@/backend/types/enum/payment_status_enum';
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionByUserId,
} from '@/backend/services/user_subscription';
import {
  createCreditUsage,
  getCreditUsageByUserId,
  updateCreditUsage,
} from '@/backend/services/credit_usage';
import { CreditUsage, UserSubscription } from '@/backend/types/type';
import {
  getPaymentHistoryById,
  updatePaymentHistory,
} from '@/backend/services/payment_history';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_id, amount, interval, user_uuid, user_email } = body;

    // Get user
    const user = await getUserByUuidAndEmail(user_uuid, user_email);
    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get subscription plan
    const subscriptionPlan = await getSubscriptionPlan(plan_id);
    if (!subscriptionPlan) {
      return Response.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Check if user already has active subscription
    const userSubscriptions = await getUserSubscriptionByUserIdAndStatus(
      user.uuid,
      [
        UserSubscriptionStatusEnum.ACTIVE,
        UserSubscriptionStatusEnum.CANCELLED,
      ]
    );
    if (userSubscriptions.length > 0) {
      return Response.json(
        { error: "You already has an active subscription" },
        { status: 500 }
      );
    }

    // Create payment history record
    const createPaymentHistoryRequest: PaymentHistory = {
      user_id: user.uuid,
      subscription_plans_id: plan_id,
      creem_product_id: subscriptionPlan.creem_product_id,
      creem_subscription_id: `sim_sub_${Date.now()}`,
      creem_customer_id: `sim_cus_${Date.now()}`,
      creem_checkout_id: `sim_chk_${Date.now()}`,
      amount: amount,
      currency: "USD",
      status: PaymentStatus.STARTED,
      created_at: new Date(),
    };

    const paymentHistory = await createPaymentHistory(createPaymentHistoryRequest);
    if (!paymentHistory || paymentHistory.id === 0) {
      return Response.json(
        { error: "create payment history failed" },
        { status: 500 }
      );
    }

    // Simulate successful payment
    console.log('Simulating successful payment for user:', user.uuid);
    
    // Create webhook payload similar to Creem's success webhook
    const webhookPayload = {
      id: `sim_evt_${Date.now()}`,
      type: 'subscription.paid',
      data: {
        subscription: {
          id: `sim_sub_${Date.now()}`,
          customer_id: `sim_cus_${Date.now()}`,
          product_id: subscriptionPlan.creem_product_id,
          status: 'active',
          metadata: {
            project: "ai-video-generator",
            interval: interval,
            userId: String(user.uuid),
            productId: subscriptionPlan.creem_product_id,
            paymentHistoryId: String(paymentHistory.id),
            credit: String(subscriptionPlan.credit_per_interval),
            subscriptionPlanId: String(plan_id),
            customer_email: user.email,
          },
          created: Math.floor(Date.now() / 1000),
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + (interval === 'year' ? 31536000 : 2592000)
        }
      }
    };

    // Process the simulated payment (similar to webhook logic)
    const { subscription } = webhookPayload.data;
    
    // 1. Create/update user subscription
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    if (interval === "year") {
      periodEnd.setFullYear(currentDate.getFullYear() + 1);
    } else {
      periodEnd.setMonth(currentDate.getMonth() + 1);
    }

    const userSubscriptionParams: UserSubscription = {
      user_id: user.uuid,
      subscription_plans_id: plan_id,
      creem_product_id: subscriptionPlan.creem_product_id,
      creem_subscription_id: subscription.id,
      creem_customer_id: subscription.customer_id,
      status: UserSubscriptionStatusEnum.ACTIVE,
      current_period_start: currentDate,
      current_period_end: periodEnd,
      created_at: new Date(),
    };

    const existingSubscription = await getUserSubscriptionByUserId(user.uuid);
    let userSubscription: UserSubscription;
    if (existingSubscription) {
      userSubscription = await updateUserSubscription(userSubscriptionParams);
    } else {
      userSubscription = await createUserSubscription(userSubscriptionParams);
    }

    // 2. Update credit usage
    let creditUsage = await getCreditUsageByUserId(user.uuid);
    const creditAmount = subscriptionPlan.credit_per_interval;

    if (!creditUsage) {
      const newCreditUsage: CreditUsage = {
        user_id: user.uuid,
        user_subscriptions_id: userSubscription.id!,
        is_subscription_active: true,
        used_count: 0,
        period_remain_count: creditAmount,
        period_start: currentDate,
        period_end: periodEnd,
        created_at: new Date(),
      };
      await createCreditUsage(newCreditUsage);
    } else {
      // Handle renewal logic
      if (creditUsage.is_subscription_active) {
        // Subscription renewal
        creditUsage.period_remain_count = creditAmount;
      } else {
        // Convert from non-subscription to subscription, keep remaining credits
        if (creditUsage.period_remain_count > 0 && 
            creditUsage.period_end && 
            creditUsage.period_end >= currentDate) {
          creditUsage.period_remain_count += creditAmount;
        } else {
          creditUsage.period_remain_count = creditAmount;
        }
      }
      
      creditUsage.is_subscription_active = true;
      creditUsage.period_start = currentDate;
      creditUsage.period_end = periodEnd;
      creditUsage.user_subscriptions_id = userSubscription.id!;
      creditUsage.updated_at = new Date();
      await updateCreditUsage(creditUsage);
    }

    // 3. Update payment history
    paymentHistory.creem_subscription_id = subscription.id;
    paymentHistory.creem_customer_id = subscription.customer_id;
    paymentHistory.status = "success";
    await updatePaymentHistory(paymentHistory);

    return Response.json({ 
      success: true,
      message: 'Simulated payment successful',
      checkout_url: `${process.env.WEB_BASE_URI}/pricing?success=true`,
      payment_id: paymentHistory.id,
      subscription_id: userSubscription.id
    });

  } catch (error) {
    console.error("Simulated checkout failed: ", error);
    return Response.json(
      { error: "checkout failed" },
      { status: 500 }
    );
  }
}