export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    creem: {
      api_key: process.env.CREEM_API_KEY ? '***' + process.env.CREEM_API_KEY.slice(-4) : 'NOT SET',
      base_url: process.env.CREEM_API_BASE_URL || 'https://api.creem.io',
      monthly_product_id: process.env.CREEM_PRODUCT_MONTHLY_ID || 'NOT SET',
      yearly_product_id: process.env.CREEM_PRODUCT_YEARLY_ID || 'NOT SET',
      webhook_secret: process.env.CREEM_WEBHOOK_SECRET ? '***' + process.env.CREEM_WEBHOOK_SECRET.slice(-4) : 'NOT SET',
    },
    environment: {
      node_env: process.env.NODE_ENV,
      web_base_uri: process.env.WEB_BASE_URI || 'NOT SET',
    }
  };

  return NextResponse.json(config);
}