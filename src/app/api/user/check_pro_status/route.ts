import { NextRequest, NextResponse } from 'next/server';
import { checkUserHasSuccessfulPayment } from "@/backend/services/payment_history";
import { withAuth } from '@/lib/auth-middleware';

export const POST = withAuth(async (request: NextRequest, context: any) => {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    const hasSuccessfulPayment = await checkUserHasSuccessfulPayment(user_id);

    return NextResponse.json({
      isPro: hasSuccessfulPayment,
      user_id,
    });
  } catch (error) {
    console.error("Error checking pro status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
