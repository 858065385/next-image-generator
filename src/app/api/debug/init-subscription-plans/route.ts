import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST() {
  try {
    const db = await getDb();
    
    // 检查是否已有数据
    const checkRes = await db.query('SELECT COUNT(*) FROM subscription_plans');
    const count = parseInt(checkRes.rows[0].count);
    
    if (count > 0) {
      return NextResponse.json({
        code: 0,
        message: 'Subscription plans already exist',
        data: { count }
      });
    }
    
    // 插入初始数据
    const insertSql = `
      INSERT INTO subscription_plans (name, interval, price, currency, credit_per_interval, creem_product_id, is_active, created_at) 
      VALUES 
        ('Monthly Pro', 'month', 9.99, 'USD', 100, $1, true, NOW()),
        ('Yearly Pro', 'year', 99.99, 'USD', 1200, $2, true, NOW())
      RETURNING *
    `;
    
    const result = await db.query(insertSql, [
      process.env.CREEM_PRODUCT_MONTHLY_ID || 'prod_monthly_xxx',
      process.env.CREEM_PRODUCT_YEARLY_ID || 'prod_yearly_xxx'
    ]);
    
    return NextResponse.json({
      code: 0,
      message: 'Subscription plans initialized successfully',
      data: result.rows
    });
    
  } catch (error) {
    console.error('Init subscription plans error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}