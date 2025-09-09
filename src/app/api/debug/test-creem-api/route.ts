import { NextRequest, NextResponse } from 'next/server';
import { creem } from '@/backend/lib/creem';

export async function GET() {
  try {
    // 测试 API Key 是否有效
    console.log('Testing Creem API connection...');
    console.log('API Key:', process.env.CREEM_API_KEY ? '***' + process.env.CREEM_API_KEY.slice(-4) : 'NOT SET');
    console.log('Base URL:', process.env.CREEM_API_BASE_URL);
    
    // 尝试获取产品列表
    const products = await creem.listProducts();
    console.log('Products fetched successfully:', products.length);
    
    // 测试获取特定产品
    const monthlyId = process.env.CREEM_PRODUCT_MONTHLY_ID;
    const yearlyId = process.env.CREEM_PRODUCT_YEARLY_ID;
    
    console.log('Monthly Product ID:', monthlyId);
    console.log('Yearly Product ID:', yearlyId);
    
    return NextResponse.json({
      success: true,
      api_key_status: 'configured',
      base_url: process.env.CREEM_API_BASE_URL,
      products_count: products.length,
      configured_products: {
        monthly: monthlyId,
        yearly: yearlyId
      },
      sample_products: products.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }))
    });
  } catch (error) {
    console.error('Creem API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      api_key: process.env.CREEM_API_KEY ? '***' + process.env.CREEM_API_KEY.slice(-4) : 'NOT SET',
      base_url: process.env.CREEM_API_BASE_URL
    }, { status: 500 });
  }
}