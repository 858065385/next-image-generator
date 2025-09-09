// Creem API 客户端封装
import crypto from 'crypto';

export interface CreemCheckoutSession {
  id: string;
  checkout_url: string;
  status: string;
  product_id: string;
  customer_email: string;
  amount: number;
  currency: string;
}

export interface CreemProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  active: boolean;
}

export class CreemClient {
  private apiKey: string;
  private baseUrl: string;
  private testMode: boolean;

  constructor(apiKey: string, baseUrl: string = 'https://api.creem.io', testMode: boolean = false) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.testMode = testMode;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...(this.testMode ? { 'x-test-mode': 'true' } : {}),
      ...options.headers,
    };

    console.log('Creem API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        ...headers,
        'x-api-key': '***' + this.apiKey.slice(-4)
      },
      body: options.body
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('Creem API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error
      });
      throw new Error(`Creem API Error: ${response.status} ${error}`);
    }

    return response.json();
  }

  // 创建 Checkout Session
  async createCheckoutSession(params: {
    product_id: string;
    success_url: string;
    metadata?: Record<string, string>;
  }): Promise<CreemCheckoutSession> {
    return this.makeRequest('/v1/checkouts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 查询 Checkout Session
  async getCheckoutSession(checkoutId: string): Promise<CreemCheckoutSession> {
    return this.makeRequest(`/v1/checkouts/${checkoutId}`);
  }

  // 查询产品列表
  async listProducts(): Promise<CreemProduct[]> {
    const response = await this.makeRequest('/v1/products/search');
    return response.products || [];
  }

  // 升级订阅
  async upgradeSubscription(subscriptionId: string, newProductId: string) {
    return this.makeRequest(`/v1/subscriptions/${subscriptionId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ product_id: newProductId }),
    });
  }
}

// Webhook 签名验证
export function verifyCreemWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return signature === expectedSignature;
}

// 创建 Creem 客户端实例
export const creem = new CreemClient(
  process.env.CREEM_API_KEY!,
  process.env.CREEM_API_BASE_URL || 'https://api.creem.io',
  false // 禁用测试模式头部
);