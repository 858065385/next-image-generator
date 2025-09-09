'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [creemDetails, setCreemDetails] = useState<any>(null);
  const [creemParams, setCreemParams] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    
    const verifySignature = async () => {
      const success = searchParams.get('success');
      const signature = searchParams.get('signature');
      
      // 收集所有查询参数（除了 signature）
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== 'signature') {
          params[key] = value;
        }
      });
      
      // 构建查询字符串（按字母顺序排序以确保一致性）
      const queryParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      setCreemParams(queryParams);
      
      // 验证签名
      if (signature && queryParams) {
        try {
          const response = await fetch('/api/creem/verify-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signature,
              queryParams
            }),
          });
          
          const result = await response.json();
          
          if (result.valid) {
            // 签名验证成功，处理支付结果
            const checkoutId = params.checkout_id;
            const orderId = params.order_id;
            const paymentId = params.payment_id;
            
            setCreemDetails({
              checkout_id: checkoutId,
              order_id: orderId,
              payment_id: paymentId
            });
            
            if (success === 'true' || success === '1') {
              setStatus('success');
              setMessage('支付成功！感谢您的订阅。');
              
              // 获取订阅详情
              await fetchSubscriptionDetails();
              
              // 开始轮询检查状态更新
              pollingIntervalRef.current = setInterval(async () => {
                await fetchSubscriptionDetails();
              }, 3000);
            } else if (success === 'false' || success === '0') {
              setStatus('error');
              setMessage('支付失败或已取消。');
            } else {
              setStatus('loading');
              setMessage('正在处理支付结果...');
            }
          } else {
            // 签名验证失败
            setStatus('error');
            setMessage('支付验证失败，请检查订单状态。');
            console.error('Signature verification failed:', result);
          }
        } catch (error) {
          console.error('Error verifying signature:', error);
          setStatus('error');
          setMessage('验证支付状态时出错。');
        }
      } else {
        // 没有签名，显示警告但仍处理
        setStatus('loading');
        setMessage('警告：支付结果未经验证，请联系客服确认。');
        
        // 仍然尝试获取订阅详情
        await fetchSubscriptionDetails();
      }
    };
    
    verifySignature();
    
    // 清理函数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [searchParams]);
  
  const fetchSubscriptionDetails = async () => {
    try {
      // 获取用户会话信息
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (sessionData.user) {
        // 获取用户的订阅和积分信息
        const response = await fetch('/api/user/get_user_subscription_info');
        const data = await response.json();
        
        if (data.code === 0 && data.user && data.subscription && data.credit_usage) {
          // 根据订阅计划 ID 确定计划名称
          const planName = data.subscription.subscription_plans_id === 1 ? 'Monthly Pro' : 
                          data.subscription.subscription_plans_id === 2 ? 'Yearly Pro' : 'Pro Plan';
          
          // 根据积分余额和周期计算总积分
          const totalCredits = data.credit_usage.period_remain_count + data.credit_usage.used_count;
          
          const details = {
            plan: planName,
            credits: data.credit_usage.period_remain_count,
            totalCredits: totalCredits,
            interval: data.subscription.interval || 'year',
            amount: data.subscription.interval === 'year' ? '$99.00' : '$15.90',
            status: data.subscription.status,
            currentPeriodEnd: data.subscription.current_period_end,
            userId: data.user.id,
            email: data.user.email
          };
          
          setSubscriptionDetails(details);
          
          // 如果订阅已经激活，更新消息并停止轮询
          if (data.subscription.status === 'active' && status === 'loading') {
            setStatus('success');
            setMessage('支付成功！订阅已激活。');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = undefined;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      // 如果获取失败，使用默认数据
      setSubscriptionDetails({
        plan: 'Pro Plan',
        credits: 0,
        totalCredits: 0,
        interval: 'year',
        amount: '$99.00',
        status: 'pending',
        currentPeriodEnd: null,
        userId: null,
        email: null
      });
    }
  };

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
                      {subscriptionDetails.totalCredits > 0 && (
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                          (总计: {subscriptionDetails.totalCredits})
                        </span>
                      )}
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
                      color: subscriptionDetails.status === 'active' ? '#166534' : 
                             subscriptionDetails.status === 'pending' ? '#ca8a04' : '#991b1b'
                    }}>
                      {subscriptionDetails.status === 'active' ? '✅ 已激活' : 
                       subscriptionDetails.status === 'pending' ? '⏳ 待激活' : '❌ 已过期'}
                    </span>
                  </div>
                  {subscriptionDetails.currentPeriodEnd && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>到期时间：</span>
                      <span style={{ fontWeight: 'bold', color: '#166534' }}>
                        {formatDateTime(subscriptionDetails.currentPeriodEnd)}
                      </span>
                    </div>
                  )}
                  {subscriptionDetails.userId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>用户ID：</span>
                      <span style={{ fontFamily: 'monospace', color: '#166534', fontSize: '0.875rem' }}>
                        {subscriptionDetails.userId}
                      </span>
                    </div>
                  )}
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
                {creemParams && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e0f2fe' }}>
                    <span style={{ color: '#075985' }}>🔒 签名验证：已通过</span>
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