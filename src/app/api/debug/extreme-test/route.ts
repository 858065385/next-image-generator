import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { rawQueryString } = await req.json();
    
    const apiKey = process.env.CREEM_API_KEY;
    
    // 解析所有参数，包括可能被忽略的
    const searchParams = new URLSearchParams(rawQueryString);
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    
    // 尝试一些额外的可能性
    
    // 1. 检查是否有编码问题
    const decodedQueryString = decodeURIComponent(rawQueryString);
    const decodedParams = new URLSearchParams(decodedQueryString);
    const decodedObj: Record<string, string> = {};
    decodedParams.forEach((value, key) => {
      decodedObj[key] = value;
    });
    
    // 2. 尝试包含 signature 参数
    const paramsWithSignature = { ...allParams };
    
    // 3. 尝试不同的排序方式
    const results: any = {
      rawQueryString,
      decodedQueryString,
      allParams,
      decodedParams: decodedObj,
      tests: {}
    };
    
    // 测试 1: 官方方式（排除 signature）
    const params1 = { ...allParams };
    delete params1.signature;
    const sorted1 = Object.entries(params1).sort(([a], [b]) => a.localeCompare(b));
    const canonical1 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig1 = crypto.createHash('sha256').update(canonical1, 'utf8').digest('hex');
    results.tests.official_no_signature = { signature: sig1 };
    
    // 测试 2: 包含 signature
    const sorted2 = Object.entries(allParams).sort(([a], [b]) => a.localeCompare(b));
    const canonical2 = sorted2
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig2 = crypto.createHash('sha256').update(canonical2, 'utf8').digest('hex');
    results.tests.include_signature = { signature: sig2 };
    
    // 测试 3: 使用解码后的参数
    const params3 = { ...decodedObj };
    delete params3.signature;
    const sorted3 = Object.entries(params3).sort(([a], [b]) => a.localeCompare(b));
    const canonical3 = sorted3
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    const sig3 = crypto.createHash('sha256').update(canonical3, 'utf8').digest('hex');
    results.tests.decoded_params = { signature: sig3 };
    
    // 测试 4: 不同的 salt 格式
    const canonical4 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .join('|') + `|${apiKey}`;
    const sig4 = crypto.createHash('sha256').update(canonical4, 'utf8').digest('hex');
    results.tests.salt_without_prefix = { signature: sig4 };
    
    // 测试 5: 只用 API key，不用 salt=
    const canonical5 = sorted1
      .map(([key, value]) => `${key}=${value}`)
      .join('|') + `|${apiKey}`;
    const sig5 = crypto.createHash('sha256').update(canonical5, 'utf8').digest('hex');
    results.tests.just_api_key = { signature: sig5 };
    
    // 测试 6: 尝试大小写敏感
    const canonical6 = canonical1.toUpperCase();
    const sig6 = crypto.createHash('sha256').update(canonical6, 'utf8').digest('hex');
    results.tests.uppercase = { signature: sig6 };
    
    // 测试 7: 尝试不同的哈希算法
    const sig7 = crypto.createHash('md5').update(canonical1, 'utf8').digest('hex');
    results.tests.md5_hash = { signature: sig7 };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}