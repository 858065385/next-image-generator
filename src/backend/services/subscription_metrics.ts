import { getDb } from "../config/db";

export interface SubscriptionMetrics {
  totalActiveSubscriptions: number;
  totalCancelledSubscriptions: number;
  totalExpiredSubscriptions: number;
  totalTrialingSubscriptions: number;
  newSubscriptionsToday: number;
  cancellationsToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  mrr: number; // Monthly Recurring Revenue
  churnRate: number; // Customer churn rate
}

export interface SubscriptionMetricFilters {
  planId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * 获取订阅统计数据
 */
export async function getSubscriptionMetrics(filters?: SubscriptionMetricFilters): Promise<SubscriptionMetrics> {
  const db = await getDb();
  
  // 基础查询条件
  const whereConditions: string[] = [];
  const queryParams: any[] = [];
  
  if (filters?.planId) {
    whereConditions.push(`us.subscription_plans_id = $${queryParams.length + 1}`);
    queryParams.push(filters.planId);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // 查询当前订阅状态统计
  const statusQuery = `
    SELECT 
      status,
      COUNT(*) as count
    FROM user_subscriptions us
    ${whereClause}
    GROUP BY status
  `;
  
  const statusResult = await db.query(statusQuery, queryParams);
  const statusCounts = statusResult.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    return acc;
  }, {} as Record<string, number>);
  
  // 查询今日新增订阅
  const today = new Date().toISOString().split('T')[0];
  const newTodayQuery = `
    SELECT COUNT(*) as count
    FROM user_subscriptions us
    WHERE DATE(us.created_at) = $1
    ${filters?.planId ? `AND us.subscription_plans_id = $2` : ''}
  `;
  
  const newTodayParams = filters?.planId ? [today, filters.planId] : [today];
  const newTodayResult = await db.query(newTodayQuery, newTodayParams);
  const newSubscriptionsToday = parseInt(newTodayResult.rows[0]?.count || 0);
  
  // 查询今日取消
  const cancellationsTodayQuery = `
    SELECT COUNT(*) as count
    FROM user_subscriptions us
    WHERE DATE(us.canceled_at) = $1
    ${filters?.planId ? `AND us.subscription_plans_id = $2` : ''}
  `;
  
  const cancellationsTodayResult = await db.query(cancellationsTodayQuery, newTodayParams);
  const cancellationsToday = parseInt(cancellationsTodayResult.rows[0]?.count || 0);
  
  // 查询今日收入
  const revenueTodayQuery = `
    SELECT COALESCE(SUM(ph.amount), 0) as revenue
    FROM payment_history ph
    WHERE DATE(ph.created_at) = $1
    AND ph.status = 'success'
    ${filters?.planId ? `AND ph.subscription_plans_id::integer = $2` : ''}
  `;
  
  const revenueTodayResult = await db.query(revenueTodayQuery, newTodayParams);
  const revenueToday = parseInt(revenueTodayResult.rows[0]?.revenue || 0) / 100; // 转换为美元
  
  // 查询本月收入
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  
  const revenueMonthParams = filters?.planId ? [monthStartStr, filters.planId] : [monthStartStr];
  const revenueMonthQuery = `
    SELECT COALESCE(SUM(ph.amount), 0) as revenue
    FROM payment_history ph
    WHERE DATE(ph.created_at) >= $1
    AND ph.status = 'success'
    ${filters?.planId ? `AND ph.subscription_plans_id::integer = $2` : ''}
  `;
  
  const revenueMonthResult = await db.query(revenueMonthQuery, revenueMonthParams);
  const revenueThisMonth = parseInt(revenueMonthResult.rows[0]?.revenue || 0) / 100;
  
  // 计算 MRR (Monthly Recurring Revenue)
  const mrrQuery = `
    SELECT COALESCE(SUM(sp.price), 0) as mrr
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.subscription_plans_id = sp.id
    WHERE us.status = 'active'
    ${filters?.planId ? `AND us.subscription_plans_id = $1` : ''}
  `;
  
  const mrrParams = filters?.planId ? [filters.planId] : [];
  const mrrResult = await db.query(mrrQuery, mrrParams);
  const mrr = parseFloat(mrrResult.rows[0]?.mrr || 0);
  
  // 计算客户流失率 (过去30天)
  const churnQuery = `
    WITH active_subs AS (
      SELECT COUNT(*) as total
      FROM user_subscriptions 
      WHERE status = 'active'
      ${filters?.planId ? `AND subscription_plans_id = $1` : ''}
    ),
    cancelled_subs AS (
      SELECT COUNT(*) as cancelled
      FROM user_subscriptions 
      WHERE status = 'cancelled'
      AND canceled_at >= NOW() - INTERVAL '30 days'
      ${filters?.planId ? `AND subscription_plans_id = $1` : ''}
    )
    SELECT 
      active_subs.total as active_count,
      cancelled_subs.cancelled as cancelled_count,
      CASE 
        WHEN active_subs.total > 0 
        THEN (cancelled_subs.cancelled::float / active_subs.total) * 100 
        ELSE 0 
      END as churn_rate
    FROM active_subs, cancelled_subs
  `;
  
  const churnParams = filters?.planId ? [filters.planId, filters.planId] : [];
  const churnResult = await db.query(churnQuery, churnParams);
  const churnRate = parseFloat(churnResult.rows[0]?.churn_rate || 0);
  
  return {
    totalActiveSubscriptions: statusCounts['active'] || 0,
    totalCancelledSubscriptions: statusCounts['cancelled'] || 0,
    totalExpiredSubscriptions: statusCounts['expired'] || 0,
    totalTrialingSubscriptions: statusCounts['trialing'] || 0,
    newSubscriptionsToday,
    cancellationsToday,
    revenueToday,
    revenueThisMonth,
    mrr,
    churnRate
  };
}

/**
 * 获取订阅计划统计
 */
export async function getSubscriptionPlanMetrics() {
  const db = await getDb();
  
  const query = `
    SELECT 
      sp.id,
      sp.name,
      sp.price,
      sp.interval,
      COUNT(us.id) as total_subscriptions,
      SUM(CASE WHEN us.status = 'active' THEN 1 ELSE 0 END) as active_subscriptions,
      SUM(CASE WHEN us.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_subscriptions,
      SUM(CASE WHEN us.status = 'expired' THEN 1 ELSE 0 END) as expired_subscriptions,
      SUM(ph.amount) as total_revenue
    FROM subscription_plans sp
    LEFT JOIN user_subscriptions us ON sp.id = us.subscription_plans_id
    LEFT JOIN payment_history ph ON sp.id = ph.subscription_plans_id::integer AND ph.status = 'success'
    GROUP BY sp.id, sp.name, sp.price, sp.interval
    ORDER BY sp.price DESC
  `;
  
  const result = await db.query(query);
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price),
    interval: row.interval,
    totalSubscriptions: parseInt(row.total_subscriptions || 0),
    activeSubscriptions: parseInt(row.active_subscriptions || 0),
    cancelledSubscriptions: parseInt(row.cancelled_subscriptions || 0),
    expiredSubscriptions: parseInt(row.expired_subscriptions || 0),
    totalRevenue: parseFloat(row.total_revenue || 0) / 100
  }));
}