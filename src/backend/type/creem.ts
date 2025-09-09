// Creem 相关的类型定义
import { User, UserSubscription, CreditUsage, PaymentHistory } from './type';

export interface CreemSubscription {
  id?: number;
  user_id: string;
  creem_product_id: string;
  creem_subscription_id: string;
  creem_customer_id: string;
  subscription_plans_id: number;
  status: string;
  current_period_start: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
  canceled_at?: Date;
  cancellation_reason?: string;
  ends_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface CreemPaymentHistory {
  id?: number;
  user_id: string;
  creem_checkout_id?: string;
  creem_subscription_id?: string;
  creem_customer_id?: string;
  creem_product_id?: string;
  amount: number;
  currency: string;
  status: string;
  subscription_plans_id: number;
  created_at: Date;
}

export interface CreemWebhookEvent {
  id?: number;
  event_id: string;
  event_type: string;
  raw_data: string;
  processed: boolean;
  created_at?: Date;
}

// Creem Webhook 事件类型
export interface CreemWebhookPayload {
  id: string;
  type?: 'subscription.paid' | 'subscription.canceled' | 'subscription.expired' | 'subscription.updated';
  eventType?: 'subscription.paid' | 'subscription.canceled' | 'subscription.expired' | 'subscription.updated' | 'checkout.completed';
  object: {
    subscription?: {
      id: string;
      customer_id: string;
      product_id: string;
      status: string;
      current_period_start: string;
      current_period_end: string;
      metadata?: Record<string, string>;
    };
    checkout?: {
      id: string;
      customer_email: string;
      product_id: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: Record<string, string>;
    };
  };
  created_at: string;
}