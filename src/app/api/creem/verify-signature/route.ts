import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // 支持两种格式：JSON 或原始 query string
    let signature: string;
    let rawQueryString: string;
    
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      signature = body.signature;
      rawQueryString = body.rawQueryString || body.queryParams;
    } else {
      // 作为文本处理
      const text = await req.text();
      const [qs, sig] = text.split('&signature=');
      rawQueryString = qs;
      signature = sig;
    }
    
    if (!signature || !rawQueryString) {
      return NextResponse.json(
        { error: 'Missing signature or query parameters' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Debug - Return URL Signature Verification:');
    console.log('   Raw query string:', rawQueryString);
    console.log('   Received signature:', signature);
    
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET!;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'CREEM_WEBHOOK_SECRET not configured' },
        { status: 500 }
      );
    }
    
    // 重新计算签名 - 保持原始编码，不要解码
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawQueryString, 'utf8')
      .digest('hex');
    
    // 验证签名（不区分大小写）
    const isValid = signature.toLowerCase() === expectedSignature.toLowerCase();
    
    console.log('   Expected signature:', expectedSignature);
    console.log('   Signature valid:', isValid);
    
    return NextResponse.json({
      valid: isValid,
      expectedSignature,
      receivedSignature: signature,
      rawQueryString,
      webhookSecretConfigured: !!webhookSecret
    });
  } catch (error) {
    console.error('Error verifying Creem return URL signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}