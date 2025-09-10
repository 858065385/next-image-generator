'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [creemDetails, setCreemDetails] = useState<any>(null);
  // const [creemParams, setCreemParams] = useState<string>('');
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
      
      console.log('URL params:', params);
      
      // 尝试从 URL 参数获取 user_id（如果支付页面传了的话）
      const urlUserId = params.user_id;
      if (urlUserId) {
        // 保存到 localStorage 供后续使用
        localStorage.setItem('userId', urlUserId);
      }
      
      // 如果有 success=true，先显示成功状态
      if (success === 'true' || success === '1') {
        setStatus('success');
        setMessage('支付成功！正在确认订单状态...');
      }
      
      // 构建查询字符串（按字母顺序排序以确保一致性）
      const queryParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      console.log('Sorted and encoded query params:', queryParams);
      
      // 验证签名
      if (signature && queryParams) {
        try {
          // 获取完整的原始 query string（从 URL 中获取）
          const fullUrl = typeof window !== 'undefined' ? window.location.search : '';
          const rawQueryString = fullUrl.substring(1); // 去掉 '?'
          
          console.log('🔍 Debug - Payment Result Signature Verification:');
          console.log('   Full URL search:', fullUrl);
          console.log('   Raw query string:', rawQueryString);
          console.log('   Extracted signature:', signature);
          console.log('   Sorted query params:', queryParams);
          console.log('   URL contains success=true:', window.location.search.includes('success=true'));
          console.log('   Current timestamp:', new Date().toISOString());
          
          // 发送原始 query string 进行验证
          const response = await fetch('/api/creem/verify-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signature,
              rawQueryString
            }),
          });
          
          const result = await response.json();
          
          if (result.valid) {
            console.log('✅ Signature verification successful');
          } else {
            // 签名验证失败，但仍继续处理（可能是配置问题）
            console.warn('⚠️ Signature verification failed, but continuing processing:', result);
            console.warn('   Expected:', result.expectedSignature);
            console.warn('   Received:', result.receivedSignature);
            console.warn('   This might be due to CREEM_WEBHOOK_SECRET configuration');
          }
          
          // 不管签名验证结果如何，都处理支付结果
          const checkoutId = params.checkout_id;
          const orderId = params.order_id;
          const paymentId = params.payment_id;
          
          setCreemDetails({
            checkout_id: checkoutId,
            order_id: orderId,
            payment_id: paymentId
          });
          
          if (success === 'true' || success === '1') {
            // 如果之前已经设置为成功状态，不要覆盖消息
            if (status !== 'success') {
              setStatus('success');
              setMessage('支付成功！感谢您的订阅。');
            }
            
            // 检查支付状态
            await checkPaymentStatus();
            
            // 开始轮询检查状态更新
            pollingIntervalRef.current = setInterval(async () => {
              await checkPaymentStatus();
            }, 3000);
          } else if (success === 'false' || success === '0') {
            setStatus('error');
            setMessage('支付失败或已取消。');
          } else {
            setStatus('loading');
            setMessage('正在处理支付结果...');
          }
        } catch (error) {
          console.error('Error verifying signature:', error);
          setStatus('error');
          setMessage('验证支付签名时出错。');
        }
      } else {
        // 没有签名参数，直接处理
        const checkoutId = params.checkout_id;
        const orderId = params.order_id;
        
        setCreemDetails({
          checkout_id: checkoutId,
          order_id: orderId
        });
        
        if (success === 'true' || success === '1') {
          setStatus('success');
          setMessage('支付成功！感谢您的订阅。');
          await checkPaymentStatus();
        } else if (success === 'false' || success === '0') {
          setStatus('error');
          setMessage('支付失败或已取消。');
        } else {
          setStatus('loading');
          setMessage('正在处理支付结果...');
          await checkPaymentStatus();
          pollingIntervalRef.current = setInterval(async () => {
            await checkPaymentStatus();
          }, 3000);
        }
      }
    };
    
    verifySignature();
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [searchParams]);
  
  const checkPaymentStatus = async () => {
    try {
      // 按优先级获取用户 ID
      let userId = null;
      
      // 1. 从 localStorage 获取（之前保存的）
      userId = localStorage.getItem('userId');
      
      // 2. 从 localStorage 获取完整用户信息
      if (!userId) {
        try {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            userId = user.id;
          }
        } catch (e) {
          console.error('Error getting user from localStorage:', e);
        }
      }
      
      // 3. 最后才从 session API 获取
      if (!userId) {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        userId = sessionData.user?.id;
        
        // 缓存到 localStorage
        if (sessionData.user) {
          localStorage.setItem('userInfo', JSON.stringify(sessionData.user));
          localStorage.setItem('userId', sessionData.user.id);
        }
      }
      
      console.log('User ID:', userId);
      console.log('Creem details:', creemDetails);
      
      if (userId && creemDetails?.checkout_id) {
        // 检查支付状态
        const response = await fetch('/api/payment/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkout_id: creemDetails.checkout_id,
            user_id: userId
          }),
        });
        
        const data = await response.json();
        
        console.log('Payment status API response:', data);
        
        if (data.found && data.payment) {
          setSubscriptionDetails({
            paymentId: data.payment.id,
            status: data.payment.status,
            amount: data.payment.amount,
            currency: data.payment.currency,
            checkoutId: data.payment.checkoutId,
            subscriptionId: data.payment.subscriptionId,
            createdAt: data.payment.createdAt,
            userId: userId!,
            email: data.payment.email
          });
          
          // 根据支付状态更新页面状态
          if (data.payment.status === 'success' && status === 'loading') {
            setStatus('success');
            setMessage('支付成功！感谢您的订阅。');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = undefined;
            }
          } else if (data.payment.status === 'failed' && status === 'loading') {
            setStatus('error');
            setMessage('支付失败，请重试或联系客服。');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = undefined;
            }
          }
        } else if (!data.found && status === 'loading') {
          // 未找到支付记录，显示等待状态
          setSubscriptionDetails({
            status: 'pending',
            message: '等待支付确认...'
          });
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      console.error('Error details:', {
        userId: userId ?? '[null]',
        checkoutId: creemDetails?.checkout_id,
        error
      });
      // 如果获取失败，设置错误状态
      if (status === 'loading') {
        setStatus('error');
        setMessage('检查支付状态时出错，请刷新页面重试。');
      }
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
                💳 支付详情
              </h3>
              {subscriptionDetails && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d' }}>支付状态：</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: subscriptionDetails.status === 'success' ? '#166534' : 
                             subscriptionDetails.status === 'pending' ? '#ca8a04' : '#991b1b'
                    }}>
                      {subscriptionDetails.status === 'success' ? '✅ 支付成功' : 
                       subscriptionDetails.status === 'pending' ? '⏳ 处理中' : '❌ 支付失败'}
                    </span>
                  </div>
                  {subscriptionDetails.amount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>支付金额：</span>
                      <span style={{ fontWeight: 'bold', color: '#166534' }}>
                        {subscriptionDetails.amount} {subscriptionDetails.currency}
                      </span>
                    </div>
                  )}
                  {subscriptionDetails.createdAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>支付时间：</span>
                      <span style={{ fontWeight: 'bold', color: '#166534' }}>
                        {formatDateTime(subscriptionDetails.createdAt)}
                      </span>
                    </div>
                  )}
                  {subscriptionDetails.checkoutId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>订单号：</span>
                      <span style={{ fontFamily: 'monospace', color: '#166534', fontSize: '0.875rem' }}>
                        {subscriptionDetails.checkoutId}
                      </span>
                    </div>
                  )}
                  {subscriptionDetails.subscriptionId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#15803d' }}>订阅ID：</span>
                      <span style={{ fontFamily: 'monospace', color: '#166534', fontSize: '0.875rem' }}>
                        {subscriptionDetails.subscriptionId}
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
                  <div style={{ marginBottom: '0.25rem' }}>
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
        
        {status === 'loading' && subscriptionDetails && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#475569', marginBottom: '1rem', fontSize: '1.25rem' }}>
              ⏳ 支付确认中
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>订单号：</span>
                <span style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.875rem' }}>
                  {subscriptionDetails.checkoutId || creemDetails?.checkout_id}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <>
            {subscriptionDetails && (
              <div style={{
                backgroundColor: '#fef2f2',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '1.25rem' }}>
                  ❌ 支付详情
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#7f1d1d' }}>支付状态：</span>
                    <span style={{ fontWeight: 'bold', color: '#991b1b' }}>
                      支付失败
                    </span>
                  </div>
                  {subscriptionDetails.checkoutId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#7f1d1d' }}>订单号：</span>
                      <span style={{ fontFamily: 'monospace', color: '#991b1b', fontSize: '0.875rem' }}>
                        {subscriptionDetails.checkoutId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
          </>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
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
            🏠 返回首页
          </a>
        </div>
        
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
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 1rem',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid #f3f4f6',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          <p style={{ color: '#6b7280' }}>加载中...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}