import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Creem Return URL 签名验证接口
 * 
 * 用途：验证 Creem 支付回调的签名，确保请求来自 Creem 服务器
 * 
 * 签名算法（根据 Creem 官方文档）：
 * 1. 从 query string 中提取白名单字段
 * 2. 按固定顺序拼接成 key=value 格式
 * 3. 末尾追加 |salt=${API_KEY}
 * 4. 计算 SHA256 哈希（非 HMAC）
 * 5. 与请求中的 signature 比较（不区分大小写）
 * 
 * 白名单字段（仅这些字段参与签名计算）：
 * - checkout_id（必选）- 结账会话ID
 * - order_id（必选）- 订单ID
 * - customer_id（必选）- 客户ID
 * - subscription_id（必选）- 订阅ID
 * - product_id（必选）- 产品ID
 * - request_id（可选）- 请求ID
 * 
 * 重要说明：
 * - success 字段不参与签名计算！
 * - timestamp 等其他字段也不参与签名计算
 * - 签名验证失败不应阻止支付流程（可能是配置问题）
 */
export async function POST(req: NextRequest) {
  try {
    // 支持两种请求格式：JSON 或原始 query string
    let signature: string;
    let rawQueryString: string;
    
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // JSON 格式：{ signature: "xxx", rawQueryString: "xxx" }
      const body = await req.json();
      signature = body.signature;
      rawQueryString = body.rawQueryString || body.queryParams;
    } else {
      // 纯文本格式：query string 直接跟在请求体中
      const text = await req.text();
      const [qs, sig] = text.split('&signature=');
      rawQueryString = qs;
      signature = sig;
    }
    
    // 参数校验
    if (!signature || !rawQueryString) {
      return NextResponse.json(
        { error: 'Missing signature or query parameters' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Debug - Return URL Signature Verification:');
    console.log('   Raw query string:', rawQueryString);
    console.log('   Received signature:', signature);
    
    // 获取 API Key 作为 salt
    const apiKey = process.env.CREEM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CREEM_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    console.log('🔍 Raw query string before parsing:', rawQueryString);
    
    // 1. 解析 query string 并过滤字段
    const searchParams = new URLSearchParams(rawQueryString);
    const params: Record<string, string> = {};
    
    // Creem 官方白名单：只有这些字段参与签名计算
    const SIGNED_KEYS = [
      'checkout_id',    // 必选：结账会话ID
      'order_id',       // 必选：订单ID
      'customer_id',    // 必选：客户ID
      'subscription_id', // 必选：订阅ID
      'product_id',     // 必选：产品ID
      'request_id',     // 可选：请求ID
    ];
    
    // 只提取白名单中的字段（忽略其他字段如 success、timestamp 等）
    console.log('🔍 All parameters found:');
    searchParams.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
      if (SIGNED_KEYS.includes(key)) {
        params[key] = value;
      }
    });
    
    // 2. 按固定顺序拼接参数（确保与 Creem 服务器一致）
    const fixedOrder = ['checkout_id', 'order_id', 'customer_id', 'subscription_id', 'product_id', 'request_id'];
    const canonical = [];
    
    for (const key of fixedOrder) {
      if (params[key]) {
        canonical.push(`${key}=${params[key]}`);
      }
    }
    
    console.log('🔍 Parameters in fixed order:', canonical);
    
    // 3. 构造待签名字符串：参数拼接 | 追加 salt
    const data = canonical.concat(`salt=${apiKey}`).join('|');
    
    console.log('🔍 Generated data string:', data);
    console.log('🔍 API Key used:', apiKey ? '***' + apiKey.slice(-4) : 'NOT SET');
    
    // 4. 计算 SHA256 哈希（注意：不是 HMAC-SHA256）
    const expectedSignature = crypto
      .createHash('sha256')
      .update(data, 'utf8')
      .digest('hex');
    
    // 5. 验证签名（不区分大小写）
    const isValid = signature.toLowerCase() === expectedSignature.toLowerCase();
    
    console.log('   Data string:', data);
    console.log('   Expected signature:', expectedSignature);
    console.log('   Received signature:', signature);
    console.log('   Signature valid (case-insensitive):', isValid);
    console.log('   Signature valid (case-sensitive):', signature === expectedSignature);
    
    return NextResponse.json({
      valid: isValid,
      expectedSignature,
      receivedSignature: signature,
      rawQueryString,
      canonicalString: data,
      apiKeyConfigured: !!apiKey,
      debugInfo: {
        signedParams: Object.keys(params),
        fixedOrderUsed: fixedOrder.filter(key => params[key]),
        algorithm: 'SHA256 (not HMAC)'
      }
    });
  } catch (error) {
    console.error('Error verifying Creem return URL signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}