import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { signature, rawQueryString } = await req.json();
    
    if (!signature || !rawQueryString) {
      return NextResponse.json(
        { error: 'Missing signature or rawQueryString' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.CREEM_API_KEY;
    
    console.log('🔍 Debug - Multiple Algorithm Test:');
    console.log('   Raw query string:', rawQueryString);
    console.log('   Received signature:', signature);
    console.log('   API Key:', apiKey?.substring(0, 20) + '...');
    
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
      algorithms: {}
    };
    
    // 算法 1: 官方文档方式（排序）
    const sortedEntries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
    const canonical1 = sortedEntries
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig1 = crypto.createHash('sha256').update(canonical1, 'utf8').digest('hex');
    results.algorithms.official_sorted = {
      canonical: canonical1,
      signature: sig1,
      matches: sig1 === signature
    };
    
    // 算法 2: 不排序
    const unsortedEntries = Object.entries(params);
    const canonical2 = unsortedEntries
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig2 = crypto.createHash('sha256').update(canonical2, 'utf8').digest('hex');
    results.algorithms.unsorted = {
      canonical: canonical2,
      signature: sig2,
      matches: sig2 === signature
    };
    
    // 算法 3: 原始字符串方式
    const canonical3 = rawQueryString.split('&').join('|') + `|salt=${apiKey}`;
    const sig3 = crypto.createHash('sha256').update(canonical3, 'utf8').digest('hex');
    results.algorithms.raw_string = {
      canonical: canonical3,
      signature: sig3,
      matches: sig3 === signature
    };
    
    // 算法 4: HMAC-SHA256 (webhook 方式)
    const sig4 = crypto.createHmac('sha256', apiKey).update(rawQueryString, 'utf8').digest('hex');
    results.algorithms.hmac = {
      canonical: rawQueryString,
      signature: sig4,
      matches: sig4 === signature
    };
    
    // 算法 5: 排序但使用原始参数顺序的连接
    const canonical5 = paramsArrayFromSorted(searchParams).join('|') + `|salt=${apiKey}`;
    const sig5 = crypto.createHash('sha256').update(canonical5, 'utf8').digest('hex');
    results.algorithms.sorted_params = {
      canonical: canonical5,
      signature: sig5,
      matches: sig5 === signature
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error in debug algorithm test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 辅助函数：从 URLSearchParams 获取排序后的参数数组
function paramsArrayFromSorted(searchParams: URLSearchParams): string[] {
  const params: string[] = [];
  const sortedKeys = Array.from(searchParams.keys()).filter(k => k !== 'signature').sort();
  
  for (const key of sortedKeys) {
    params.push(`${key}=${searchParams.get(key)}`);
  }
  
  return params;
}