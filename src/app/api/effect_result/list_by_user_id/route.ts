export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pageListEffectResultsByUserId } from "@/backend/services/effect_result";
import { withAuth } from '@/lib/auth-middleware';

export const maxDuration = 60; // Set max duration to 60 seconds (1 minute)

export const GET = withAuth(async (request: NextRequest, context: any) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ detail: "User ID is required" }, { status: 400 });
  }
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "10";
  
  console.log('[DEBUG] Searching for user_id:', userId);
  console.log('[DEBUG] Page:', page, 'PageSize:', pageSize);
  
  const results = await pageListEffectResultsByUserId(
    userId,
    parseInt(page),
    parseInt(pageSize)
  );
  
  console.log('[DEBUG] Found results:', results?.length || 0);
  
  return NextResponse.json(results);
});

export const POST = withAuth(async (request: NextRequest, context: any) => {
  const body = await request.json();
  const userId = body.user_id;
  if (!userId) {
    return NextResponse.json({ detail: "User ID is required" }, { status: 400 });
  }
  const page = body.page || 1;
  const pageSize = body.limit || 10;
  
  console.log('[DEBUG] Searching for user_id:', userId);
  console.log('[DEBUG] Page:', page, 'PageSize:', pageSize);
  
  const results = await pageListEffectResultsByUserId(
    userId,
    parseInt(page),
    parseInt(pageSize)
  );
  
  console.log('[DEBUG] Found results:', results?.length || 0);
  
  return NextResponse.json(results);
});
