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
    
    // 按照 Creem 官方文档：解析 query string 并按字母顺序排序
    console.log('🔍 Raw query string before parsing:', rawQueryString);
    
    // 尝试解码 URL 编码的参数
    const decodedQueryString = decodeURIComponent(rawQueryString);
    console.log('🔍 Decoded query string:', decodedQueryString);
    
    const searchParams = new URLSearchParams(decodedQueryString);
    const params: Record<string, string> = {};
    
    // 提取所有参数（排除 signature）
    console.log('🔍 All parameters found:');
    searchParams.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
      if (key !== 'signature') {
        params[key] = value;
      }
    });
    
    // 按字母顺序排序参数
    const sortedEntries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    console.log('🔍 Sorted parameters:', sortedEntries);
    
    // 格式化为 key=value 并用 | 连接，最后加上 salt=API_KEY
    const canonical = sortedEntries
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    
    // 使用 SHA256 哈希（不是 HMAC）
    const expectedSignature = crypto
      .createHash('sha256')
      .update(canonical, 'utf8')
      .digest('hex');
    
    // 验证签名（不区分大小写）
    const isValid = signature.toLowerCase() === expectedSignature.toLowerCase();
    
    console.log('   Canonical string:', canonical);
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
      canonicalString: canonical,
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