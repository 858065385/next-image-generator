import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { signature, rawQueryString } = await req.json();
    
    const apiKey = process.env.CREEM_API_KEY;
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    
    // 解析参数
    const searchParams = new URLSearchParams(rawQueryString);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'signature') {
        params[key] = value;
      }
    });
    
    const results: any = {
      received: signature,
      tests: {}
    };
    
    // 尝试各种可能的组合
    
    // 1. 官方文档方式（当前实现）
    const sorted1 = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    const canonical1 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig1 = crypto.createHash('sha256').update(canonical1, 'utf8').digest('hex');
    results.tests.official_document = { canonical: canonical1, signature: sig1, matches: sig1 === signature };
    
    // 2. 使用 webhook secret 而不是 API key
    const canonical2 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${webhookSecret}`)
      .join('|');
    const sig2 = crypto.createHash('sha256').update(canonical2, 'utf8').digest('hex');
    results.tests.webhook_secret_as_salt = { canonical: canonical2, signature: sig2, matches: sig2 === signature };
    
    // 3. HMAC with API key
    const sig3 = crypto.createHmac('sha256', apiKey).update(canonical1, 'utf8').digest('hex');
    results.tests.hmac_with_api_key = { canonical: canonical1, signature: sig3, matches: sig3 === signature };
    
    // 4. HMAC with webhook secret
    const sig4 = crypto.createHmac('sha256', webhookSecret).update(canonical1, 'utf8').digest('hex');
    results.tests.hmac_with_webhook_secret = { canonical: canonical1, signature: sig4, matches: sig4 === signature };
    
    // 5. 不包含 salt=
    const canonical5 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .concat(apiKey)
      .join('|');
    const sig5 = crypto.createHash('sha256').update(canonical5, 'utf8').digest('hex');
    results.tests.no_salt_prefix = { canonical: canonical5, signature: sig5, matches: sig5 === signature };
    
    // 6. 使用原始 query string + HMAC
    const sig6 = crypto.createHmac('sha256', webhookSecret).update(rawQueryString, 'utf8').digest('hex');
    results.tests.hmac_raw_query = { canonical: rawQueryString, signature: sig6, matches: sig6 === signature };
    
    // 7. 不同的分隔符
    const canonical7 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('&');
    const sig7 = crypto.createHash('sha256').update(canonical7, 'utf8').digest('hex');
    results.tests.ampersand_separator = { canonical: canonical7, signature: sig7, matches: sig7 === signature };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}