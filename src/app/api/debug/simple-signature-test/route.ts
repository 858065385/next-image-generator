import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { rawQueryString, webhookSecret } = await req.json();
    
    if (!rawQueryString) {
      return NextResponse.json(
        { error: 'Missing rawQueryString' },
        { status: 400 }
      );
    }
    
    // 使用提供的 secret 或环境变量
    const secret = webhookSecret || process.env.CREEM_WEBHOOK_SECRET;
    
    if (!secret) {
      return NextResponse.json(
        { error: 'No webhook secret configured' },
        { status: 500 }
      );
    }
    
    console.log('🔧 Debug - Simple Signature Test:');
    console.log('   Raw query string:', rawQueryString);
    console.log('   Secret length:', secret.length);
    
    // 计算签名
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawQueryString, 'utf8')
      .digest('hex');
    
    // 尝试从 query string 中提取 signature
    const signatureMatch = rawQueryString.match(/&signature=([^&]+)/);
    const extractedSignature = signatureMatch ? signatureMatch[1] : null;
    
    return NextResponse.json({
      rawQueryString,
      expectedSignature,
      extractedSignature,
      webhookSecretConfigured: true,
      secretLength: secret.length
    });
  } catch (error) {
    console.error('Error in simple signature test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}