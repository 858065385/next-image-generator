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
    
    // 使用 Return URL Signature 密钥，不是 Webhook Secret
    const returnSignatureSecret = process.env.CREEM_RETURN_SIGNATURE;
    
    if (!returnSignatureSecret) {
      return NextResponse.json(
        { error: 'CREEM_RETURN_SIGNATURE not configured' },
        { status: 500 }
      );
    }
    
    // 重新计算签名 - 使用原始查询字符串，不做任何修改
    const expectedSignature = crypto
      .createHmac('sha256', returnSignatureSecret)
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
      returnSignatureSecretConfigured: !!returnSignatureSecret
    });
  } catch (error) {
    console.error('Error verifying Creem return URL signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}