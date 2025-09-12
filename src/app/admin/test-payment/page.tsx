'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [error, setError] = useState('');
  
  // 测试用户数据
  const testUser = {
    uuid: '28sltpmf751lly',
    email: 'karkanini9@gmail.com'
  };
  
  const plans = [
    {
      id: 1,
      name: 'Monthly Pro',
      price: 15.90,
      interval: 'month',
      credits: 100
    },
    {
      id: 2,
      name: 'Yearly Pro',
      price: 99.00,
      interval: 'year',
      credits: 1200
    }
  ];
  
  const createCheckoutSession = async (plan: any, simulate = false) => {
    setLoading(true);
    setError('');
    setCheckoutUrl('');
    
    try {
      const apiUrl = simulate ? '/api/creem/checkout-simulate' : '/api/creem/checkout';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          amount: Math.round(plan.price * 100), // 转换为分
          interval: plan.interval,
          user_uuid: testUser.uuid,
          user_email: testUser.email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (simulate) {
          // 模拟支付直接跳转到成功页面
          window.open(data.checkout_url, '_blank');
          setCheckoutUrl(data.checkout_url);
        } else {
          setCheckoutUrl(data.checkout_url);
          // 在新窗口中打开支付页面
          window.open(data.checkout_url, '_blank');
        }
      } else {
        setError(data.error || '创建支付会话失败');
      }
    } catch (err) {
      setError('网络错误：' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>测试 Creem 支付</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
        <h2>测试用户信息</h2>
        <p><strong>UUID:</strong> {testUser.uuid}</p>
        <p><strong>Email:</strong> {testUser.email}</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>选择订阅计划</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                flex: 1,
                textAlign: 'center'
              }}
            >
              <h3>{plan.name}</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
                ${plan.price}/{plan.interval}
              </p>
              <p>{plan.credits} 积分</p>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => createCheckoutSession(plan, false)}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '创建中...' : '真实支付 (Creem)'}
                </button>
                <button
                  onClick={() => createCheckoutSession(plan, true)}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '创建中...' : '模拟支付 (测试)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '0.25rem' }}>
          <strong>错误：</strong> {error}
        </div>
      )}
      
      {checkoutUrl && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '0.25rem' }}>
          <strong>支付会话已创建！</strong>
          <p style={{ wordBreak: 'break-all' }}>
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              点击这里打开支付页面
            </a>
          </p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            如果没有自动打开，请手动点击上方链接
          </p>
        </div>
      )}
      
      <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '0.25rem' }}>
        <h3>测试说明</h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>点击上方任一计划的"立即支付"按钮</li>
          <li>会在新窗口打开 Creem 支付页面</li>
          <li>使用测试信用卡信息完成支付</li>
          <li>支付成功后，webhook 会自动更新用户的订阅状态</li>
          <li>可以返回管理员页面验证积分和订阅状态</li>
        </ol>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          <strong>测试信用卡：</strong> 4242 4242 4242 4242 (任意未来日期，任意CVC)
        </p>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
        <Link href="/admin-enhanced" style={{ color: '#007bff' }}>
          ← 返回管理员页面
        </Link>
        <Link href="/" style={{ color: '#6c757d' }}>
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}