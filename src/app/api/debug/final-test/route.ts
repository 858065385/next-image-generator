import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { rawQueryString } = await req.json();
    
    // 使用固定的测试数据
    const testParams = {
      checkout_id: "ch_IDPUDE83aubR9Qtd6ud4Q",
      customer_id: "cust_1MoEaamC85R5psMrgwl77W",
      order_id: "ord_6oOspWArXuuREswOevGyW4",
      product_id: "prod_VNpWNdsTUA5sRhQbtn7Jz",
      subscription_id: "sub_4QdRAyucIdZtCWbZz08HyA",
      success: "true"
    };
    
    // 严格按照文档实现
    const apiKey = process.env.CREEM_API_KEY;
    const data = Object.entries(testParams)
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${apiKey}`)
      .join('|');
    
    const signature = crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    
    return NextResponse.json({
      explanation: "严格按照 Creem 文档生成签名",
      params: testParams,
      dataString: data,
      generatedSignature: signature,
      expectedSignature: "02129adb2a18d30be277954e9c6af9e5599c47f33b0341e1ebc23e587aabf419",
      matches: signature === "02129adb2a18d30be277954e9c6af9e5599c47f33b0341e1ebc23e587aabf419",
      apiKeyPrefix: apiKey?.substring(0, 20) + "..."
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}