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
    
    // 根据 Creem 官方文档，Return URL 签名使用 API Key 作为 salt
    const apiKey = process.env.CREEM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CREEM_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // 按照 Creem 官方文档实现签名验证
    console.log('🔍 Raw query string before parsing:', rawQueryString);
    
    // 解析 query string
    const searchParams = new URLSearchParams(rawQueryString);
    const params: Record<string, string> = {};
    
    // Creem 官方允许参与签名的字段白名单
    const SIGNED_KEYS = [
      'checkout_id',
      'order_id', 
      'customer_id',
      'subscription_id',
      'product_id',
      'request_id',      // 可选
    ];
    
    // 只提取白名单中的字段
    console.log('🔍 All parameters found:');
    searchParams.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
      if (SIGNED_KEYS.includes(key)) {
        params[key] = value;
      }
    });
    
    // 按照官方文档：Object.entries(params) 并排序
    const sortedEntries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    console.log('🔍 Sorted parameters:', sortedEntries);
    
    // 完全按照文档实现
    const data = sortedEntries
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    
    console.log('🔍 Generated data string:', data);
    console.log('🔍 API Key used:', apiKey);
    
    // 使用 SHA256 哈希（不是 HMAC）
    const expectedSignature = crypto
      .createHash('sha256')
      .update(data, 'utf8')
      .digest('hex');
    
    // 验证签名（不区分大小写）
    const isValid = signature.toLowerCase() === expectedSignature.toLowerCase();
    
    console.log('   Data string:', data);
    console.log('   Expected signature:', expectedSignature);
    console.log('   Received signature:', signature);
    console.log('   Signature valid (case-insensitive):', isValid);
    console.log('   Signature valid (case-sensitive):', signature === expectedSignature);
    
    // 尝试不排序的版本
    const unsortedCanonical = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const unsortedSignature = crypto
      .createHash('sha256')
      .update(unsortedCanonical, 'utf8')
      .digest('hex');
    console.log('   Unsorted canonical:', unsortedCanonical);
    console.log('   Unsorted signature:', unsortedSignature);
    
    // 尝试用原始字符串的版本
    const rawCanonical = rawQueryString.split('&').join('|') + `|salt=${apiKey}`;
    const rawSignature = crypto
      .createHash('sha256')
      .update(rawCanonical, 'utf8')
      .digest('hex');
    console.log('   Raw canonical:', rawCanonical);
    console.log('   Raw signature:', rawSignature);
    
    return NextResponse.json({
      valid: isValid,
      expectedSignature,
      receivedSignature: signature,
      rawQueryString,
      canonicalString: data,
      apiKeyConfigured: !!apiKey
    });
  } catch (error) {
    console.error('Error verifying Creem return URL signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}