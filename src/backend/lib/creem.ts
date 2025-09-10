/**
 * Creem 工具库 - 工具库层
 * 
 * 作用：
 * - 封装与 Creem API 的所有通信
 * - 提供纯算法函数（如签名验证）
 * - 作为底层工具，被其他层调用
 * 
 * 设计原则：
 * - 不处理 HTTP 请求
 * - 不包含业务逻辑
 * - 只提供可复用的工具函数
 * 
 * 使用场景：
 * - API 路由层调用验证函数
 * - 服务层调用 Creem API
 * - 单元测试
 */
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

/**
 * Creem Webhook 签名验证函数
 * 
 * 算法说明：
 * - 使用 HMAC-SHA256 算法
 * - 使用 Webhook Secret 作为密钥
 * - 对原始请求体（raw body）进行签名验证
 * 
 * 验证流程：
 * 1. 使用 webhook secret 创建 HMAC 对象
 * 2. 更新原始请求体数据
 * 3. 计算 SHA256 哈希值
 * 4. 与接收到的签名进行不区分大小写的比较
 * 
 * @param payload - 原始请求体字符串
 * @param signature - 从 HTTP 头接收到的签名
 * @param secret - Webhook Secret
 * @returns 签名是否有效
 */
export function verifyCreemWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // 步骤 1-3: 使用 HMAC-SHA256 计算期望的签名
  const expectedSignature = crypto
    .createHmac('sha256', secret)  // 使用 webhook secret
    .update(payload, 'utf8')      // 原始请求体
    .digest('hex');               // SHA256 哈希
  
  // 步骤 4: 不区分大小写比较签名
  return signature.toLowerCase() === expectedSignature.toLowerCase();
}

// 创建 Creem 客户端实例
export const creem = new CreemClient(
  process.env.CREEM_API_KEY!,
  process.env.CREEM_API_BASE_URL || 'https://api.creem.io',
  false // 禁用测试模式头部
);