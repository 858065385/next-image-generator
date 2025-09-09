import { NextRequest, NextResponse } from 'next/server';
import { getAll } from '@/backend/models/subscription_plan';

export async function GET() {
  try {
    const subscriptionPlans = await getAll();
    
    return NextResponse.json({
      code: 0,
      message: 'Success',
      data: subscriptionPlans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}