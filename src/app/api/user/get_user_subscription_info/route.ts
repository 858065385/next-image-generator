import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionInfoByUserId } from "@/backend/services/user_subscription";
import { withAuth } from '@/lib/auth-middleware';

export const POST = withAuth(async (request: NextRequest, context: any) => {
  const { user_id } = await request.json();
  const userSubscriptionInfo = await getUserSubscriptionInfoByUserId(user_id);
  return NextResponse.json(userSubscriptionInfo);
});
