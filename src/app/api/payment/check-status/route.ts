import { getDb } from "@/backend/config/db";

export async function POST(request: Request) {
  try {
    const { checkout_id, user_id } = await request.json();

    if (!checkout_id || !user_id) {
      return Response.json({ 
        error: "checkout_id and user_id are required" 
      }, { status: 400 });
    }

    const db = await getDb();
    
    // 查询支付记录
    const result = await db.query(`
      SELECT 
        id,
        status,
        creem_checkout_id as checkoutId,
        creem_subscription_id as subscriptionId,
        amount,
        currency,
        created_at as createdAt,
        updated_at as updatedAt
      FROM payment_history 
      WHERE user_id = $1 AND creem_checkout_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [user_id, checkout_id]);

    if (result.rows.length === 0) {
      return Response.json({
        found: false,
        message: "Payment record not found"
      });
    }

    const payment = result.rows[0];

    return Response.json({
      found: true,
      payment: {
        id: payment.id,
        status: payment.status,
        checkoutId: payment.checkoutid,
        subscriptionId: payment.subscriptionid,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdat,
        updatedAt: payment.updatedat
      }
    });

  } catch (error) {
    console.error("Error checking payment status:", error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}