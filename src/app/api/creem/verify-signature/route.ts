import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { signature, queryParams } = await req.json();
    
    if (!signature || !queryParams) {
      return NextResponse.json(
        { error: 'Missing signature or query parameters' },
        { status: 400 }
      );
    }
    
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET!;
    
    // 重新计算签名
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(queryParams, 'utf8')
      .digest('hex');
    
    // 验证签名
    const isValid = signature === expectedSignature;
    
    return NextResponse.json({
      valid: isValid,
      expectedSignature,
      receivedSignature: signature
    });
  } catch (error) {
    console.error('Error verifying Creem return URL signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}