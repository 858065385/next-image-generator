'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [creemDetails, setCreemDetails] = useState<any>(null);
  
  useEffect(() => {
    const success = searchParams.get('success');
    const checkoutId = searchParams.get('checkout_id');
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    
    // Store Creem-specific parameters
    const creemParams = {
      checkout_id: checkoutId,
      order_id: orderId,
      payment_id: paymentId
    };
    
    setCreemDetails(creemParams);
    
    if (success === 'true' || success === '1') {
      setStatus('success');
      setMessage('支付成功！感谢您的订阅。');
      
      // Simulate fetching subscription details
      // In a real implementation, you would fetch this from your API
      setSubscriptionDetails({
        plan: 'Pro Plan',
        credits: 100,
        interval: 'monthly',
        amount: '$15.90',
        status: 'active'
      });
    } else if (success === 'false' || success === '0') {
      setStatus('error');
      setMessage('支付失败或已取消。');
    } else {
      setStatus('loading');
      setMessage('正在处理支付结果...');
    }
  }, [searchParams]);

  const formatDateTime = (timestamp: number | string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        borderRadius: '0.75rem',
        backgroundColor: status === 'success' ? '#f0fdf4' : 
                         status === 'error' ? '#fef2f2' : '#f8fafc',
        border: `2px solid ${status === 'success' ? '#22c55e' : 
                              status === 'error' ? '#ef4444' : '#e2e8f0'}`
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: status === 'success' ? '#22c55e' : 
                           status === 'error' ? '#ef4444' : '#64748b',
          color: 'white',
          fontSize: '2.5rem'
        }}>
          {status === 'loading' ? '⏳' : status === 'success' ? '✓' : '✗'}
        </div>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          color: status === 'success' ? '#166534' : 
                 status === 'error' ? '#991b1b' : '#1e293b'
        }}>
          {status === 'loading' ? '处理中...' : 
           status === 'success' ? '支付结果' : '支付失败'}
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem',
          color: status === 'success' ? '#15803d' : 
                 status === 'error' ? '#7f1d1d' : '#475569',
          marginBottom: '2rem'
        }}>
          {message}
        </p>
        
        {status === 'success' && (
          <>
            <div style={{
              backgroundColor: '#dcfce7',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#166534', marginBottom: '1rem', fontSize: '1.25rem' }}>
                🎉 订阅详情
              </h3>
              {subscriptionDetails && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>订阅计划：</span>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>
                      {subscriptionDetails.plan}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>积分余额：</span>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>
                      {subscriptionDetails.credits} 积分
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>计费周期：</span>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>
                      {subscriptionDetails.interval === 'monthly' ? '月付' : '年付'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>支付金额：</span>
                    <span style={{ fontWeight: 'bold', color: '#166534' }}>
                      {subscriptionDetails.amount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>状态：</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: subscriptionDetails.status === 'active' ? '#166534' : '#ca8a04'
                    }}>
                      {subscriptionDetails.status === 'active' ? '已激活' : '待激活'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {creemDetails && (creemDetails.checkout_id || creemDetails.order_id) && (
              <div style={{
                backgroundColor: '#f0f9ff',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
                fontSize: '0.875rem'
              }}>
                <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>
                  📋 交易信息
                </h4>
                {creemDetails.checkout_id && (
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: '#075985' }}>Checkout ID: </span>
                    <span style={{ fontFamily: 'monospace', color: '#0c4a6e' }}>
                      {creemDetails.checkout_id}
                    </span>
                  </div>
                )}
                {creemDetails.order_id && (
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ color: '#075985' }}>Order ID: </span>
                    <span style={{ fontFamily: 'monospace', color: '#0c4a6e' }}>
                      {creemDetails.order_id}
                    </span>
                  </div>
                )}
                {creemDetails.payment_id && (
                  <div>
                    <span style={{ color: '#075985' }}>Payment ID: </span>
                    <span style={{ fontFamily: 'monospace', color: '#0c4a6e' }}>
                      {creemDetails.payment_id}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>
                ✨ 接下来您可以
              </h3>
              <ul style={{ color: '#78350f', paddingLeft: '1.5rem', margin: '0' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  前往管理员页面查看积分余额和使用情况
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  开始使用 AI 图像/视频生成功能
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  管理您的订阅设置和自动续费
                </li>
                <li>
                  随时查看生成历史和积分使用记录
                </li>
              </ul>
            </div>
          </>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/admin-enhanced"
            style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              backgroundColor: status === 'success' ? '#22c55e' : '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = status === 'success' ? '#16a34a' : '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = status === 'success' ? '#22c55e' : '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            🚀 开始使用
          </a>
          
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 12px -1px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            🏠 返回首页
          </a>
        </div>
        
        {status === 'error' && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem' }}>
            <p style={{ color: '#991b1b', marginBottom: '1rem' }}>
              如果问题持续存在，请尝试以下操作：
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/test-payment"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                重新尝试支付
              </a>
              <a
                href="/admin-enhanced"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                }}
              >
                查看账户状态
              </a>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>交易时间：{formatDateTime(Date.now())}</p>
          {status === 'success' && (
            <p style={{ marginTop: '0.5rem' }}>
              交易确认邮件已发送至您的邮箱
            </p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#6b7280' }}>
        <p style={{ marginBottom: '1rem' }}>
          如有任何问题，请联系客服支持
        </p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/pricing" style={{ color: '#3b82f6' }}>
            查看订阅计划
          </a>
          <a href="/admin-enhanced" style={{ color: '#3b82f6' }}>
            管理账户
          </a>
          <a href="/" style={{ color: '#3b82f6' }}>
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>加载中...</span>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}