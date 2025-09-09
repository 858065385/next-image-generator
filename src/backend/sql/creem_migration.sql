-- Creem 集成数据库迁移脚本
-- 基于现有 Stripe 表结构，最小化改动适配 Creem

-- 1. 修改 subscription_plans 表：将 stripe_price_id 改为 creem_product_id
ALTER TABLE subscription_plans 
DROP COLUMN IF EXISTS stripe_price_id,
ADD COLUMN creem_product_id character varying(100) NOT NULL DEFAULT '';

-- 2. 修改 user_subscriptions 表：替换 Stripe 字段为 Creem 字段
ALTER TABLE user_subscriptions 
DROP COLUMN IF EXISTS stripe_price_id,
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS stripe_customer_id,
ADD COLUMN creem_product_id text NOT NULL DEFAULT '',
ADD COLUMN creem_subscription_id character varying(100) NOT NULL DEFAULT '',
ADD COLUMN creem_customer_id character varying(100) NOT NULL DEFAULT '';

-- 3. 修改 payment_history 表：替换 Stripe 字段为 Creem 字段
ALTER TABLE payment_history 
DROP COLUMN IF EXISTS stripe_payment_intent_id,
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS stripe_customer_id,
DROP COLUMN IF EXISTS stripe_price_id,
ADD COLUMN creem_checkout_id character varying(100) NULL,
ADD COLUMN creem_subscription_id text NULL,
ADD COLUMN creem_customer_id text NULL,
ADD COLUMN creem_product_id text NULL;

-- 4. 新增 creem_webhook_events 表用于记录和防重
CREATE TABLE creem_webhook_events (
  id SERIAL PRIMARY KEY,
  event_id character varying(127) NOT NULL UNIQUE,  -- Creem 事件 ID
  event_type character varying(50) NOT NULL,        -- 事件类型
  raw_data text NOT NULL,                          -- 原始事件 JSON
  processed boolean DEFAULT false,                  -- 是否已处理
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询
CREATE INDEX idx_creem_webhook_events_event_id ON creem_webhook_events(event_id);
CREATE INDEX idx_creem_webhook_events_processed ON creem_webhook_events(processed);

-- 5. 更新现有 subscription_plans 数据（示例数据，需要根据实际情况调整）
INSERT INTO subscription_plans (name, interval, price, currency, credit_per_interval, creem_product_id, is_active, created_at) 
VALUES 
  ('Monthly Pro', 'month', 9.99, 'USD', 100, 'prod_monthly_xxx', true, NOW()),
  ('Yearly Pro', 'year', 99.99, 'USD', 1200, 'prod_yearly_xxx', true, NOW())
ON CONFLICT DO NOTHING;