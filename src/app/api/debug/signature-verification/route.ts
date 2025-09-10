import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { signature, queryParams, webhookSecret } = await req.json();
    
    if (!signature || !queryParams) {
      return NextResponse.json(
        { error: 'Missing signature or query parameters' },
        { status: 400 }
      );
    }
    
    // 使用提供的 webhook secret 或环境变量
    const secret = webhookSecret || process.env.CREEM_WEBHOOK_SECRET;
    
    if (!secret) {
      return NextResponse.json(
        { error: 'No webhook secret configured' },
        { status: 500 }
      );
    }
    
    // 重新计算签名
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(queryParams, 'utf8')
      .digest('hex');
    
    // 验证签名
    const isValid = signature === expectedSignature;
    
    return NextResponse.json({
      valid: isValid,
      expectedSignature,
      receivedSignature: signature,
      queryParams,
      webhookSecret: secret ? '[CONFIGURED]' : '[MISSING]',
      webhookSecretLength: secret?.length || 0
    });
  } catch (error) {
    console.error('Error in signature debug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}