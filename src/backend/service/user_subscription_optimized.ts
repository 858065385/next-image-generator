import { getDb } from "../config/db";
import { UserSubscriptionInfo } from "../type/domain/user_subscription_info";

export async function getUserSubscriptionInfoOptimized(user_id: string) {
  const db = await getDb();
  let client;
  
  try {
    client = await db.connect();
    
    // 单个查询获取所有需要的信息
    const result = await client.query(`
      SELECT 
        us.id as subscription_id,
        us.status as subscription_status,
        us.current_period_start,
        us.current_period_end,
        us.cancel_at_period_end,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.interval as plan_interval,
        sp.price as plan_price,
        cu.id as credit_id,
        cu.period_remain_count,
        cu.is_subscription_active,
        CASE 
          WHEN us.id IS NOT NULL THEN us.status
          ELSE 'inactive'
        END as effective_status
      FROM users u
      LEFT JOIN user_subscriptions us ON u.uuid = us.user_id 
        AND us.status IN ('active', 'trialing', 'past_due')
      LEFT JOIN subscription_plans sp ON us.subscription_plans_id = sp.id
      LEFT JOIN credit_usage cu ON u.uuid = cu.user_id
      WHERE u.uuid = $1
      ORDER BY us.id DESC
      LIMIT 1
    `, [user_id]);
    
    const row = result.rows[0];
    
    if (!row) {
      // 用户不存在
      return null;
    }
    
    // 构建返回数据
    const subscriptionInfo: UserSubscriptionInfo = {
      plan_name: row.plan_name || "Free User",
      plan_interval: row.plan_interval || "month",
      plan_price: row.plan_price || 0,
      subscription_status: row.effective_status || "inactive",
      remain_count: row.period_remain_count || 0,
      current_period_start: row.current_period_start || new Date(),
      current_period_end: row.current_period_end || new Date(),
      cancel_at_period_end: row.cancel_at_period_end || false,
    };
    
    return subscriptionInfo;
  } finally {
    if (client) {
      client.release();
    }
  }
}