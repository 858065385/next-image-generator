import { getDb } from "../config/db";
import { SubscriptionPlan } from "../type/type";

function formatSubscriptionPlan(row: any): SubscriptionPlan {
  return {
    id: row.id,
    name: row.name,
    interval: row.interval,
    price: parseFloat(row.price),
    currency: row.currency,
    credit_per_interval: row.credit_per_interval,
    creem_product_id: row.creem_product_id,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getById(id: number) {
  const db = await getDb();
  const res = await db.query(`SELECT * FROM subscription_plans WHERE id = $1`, [id]);
  return res.rows[0] ? formatSubscriptionPlan(res.rows[0]) : null;
}

export async function getByCreemProductId(productId: string) {
  const db = await getDb();
  const res = await db.query(`SELECT * FROM subscription_plans WHERE creem_product_id = $1`, [productId]);
  return res.rows[0] ? formatSubscriptionPlan(res.rows[0]) : null;
}

export async function getAll() {
  const db = await getDb();
  const res = await db.query(`SELECT * FROM subscription_plans ORDER BY id`);
  return res.rows.map(formatSubscriptionPlan);
}
  