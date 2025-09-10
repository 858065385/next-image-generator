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
    
    // 根据 Creem 官方文档，使用 API Key 作为 salt
    const apiKey = process.env.CREEM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CREEM_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    console.log('🔧 Debug - Simple Signature Test:');
    console.log('   Raw query string:', rawQueryString);
    console.log('   API Key:', apiKey.substring(0, 20) + '...');
    
    // 按照文档：将参数用 | 连接，最后加上 salt=API_KEY
    const params = rawQueryString.split('&');
    const canonical = params.join('|') + `|salt=${apiKey}`;
    
    // 使用 SHA256 哈希（不是 HMAC）
    const expectedSignature = crypto
      .createHash('sha256')
      .update(canonical, 'utf8')
      .digest('hex');
    
    // 尝试从 query string 中提取 signature
    const signatureMatch = rawQueryString.match(/&signature=([^&]+)/);
    const extractedSignature = signatureMatch ? signatureMatch[1] : null;
    
    console.log('   Canonical string:', canonical);
    console.log('   Expected signature:', expectedSignature);
    
    return NextResponse.json({
      rawQueryString,
      canonicalString: canonical,
      expectedSignature,
      extractedSignature,
      apiKeyConfigured: true,
      apiKeyPrefix: apiKey.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('Error in simple signature test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}