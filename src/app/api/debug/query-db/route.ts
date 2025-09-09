import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/config/db';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({
        code: -1,
        error: 'Query is required'
      }, { status: 400 });
    }
    
    const db = await getDb();
    const result = await db.query(query);
    
    return NextResponse.json({
      code: 0,
      message: 'Query executed successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({
      code: -1,
      error: error.message
    }, { status: 500 });
  }
}