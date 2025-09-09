'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const success = searchParams.get('success');
    
    if (success === 'true') {
      setStatus('success');
      setMessage('支付成功！您的订阅已激活。');
    } else if (success === 'false') {
      setStatus('error');
      setMessage('支付失败或已取消。');
    } else {
      setStatus('loading');
      setMessage('正在处理支付结果...');
    }
  }, [searchParams]);

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
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: status === 'success' ? '#22c55e' : 
                           status === 'error' ? '#ef4444' : '#64748b',
          color: 'white',
          fontSize: '2rem'
        }}>
          {status === 'loading' ? '⏳' : status === 'success' ? '✓' : '✗'}
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '1rem',
          color: status === 'success' ? '#166534' : 
                 status === 'error' ? '#991b1b' : '#1e293b'
        }}>
          {status === 'loading' ? '处理中...' : 
           status === 'success' ? '支付成功！' : '支付失败'}
        </h1>
        
        <p style={{ 
          fontSize: '1.125rem',
          color: status === 'success' ? '#15803d' : 
                 status === 'error' ? '#7f1d1d' : '#475569',
          marginBottom: '2rem'
        }}>
          {message}
        </p>
        
        {status === 'success' && (
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>接下来您可以：</h3>
            <ul style={{ color: '#15803d', paddingLeft: '1.5rem' }}>
              <li>前往管理员页面查看积分余额</li>
              <li>开始使用 AI 图像/视频生成功能</li>
              <li>管理您的订阅设置</li>
            </ul>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a
            href="/admin-enhanced"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: status === 'success' ? '#22c55e' : '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = status === 'success' ? '#16a34a' : '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = status === 'success' ? '#22c55e' : '#3b82f6';
            }}
          >
            前往管理员页面
          </a>
          
          <a
            href="/test-payment"
            target="_blank"
            rel="noopener noreferrer"
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
            继续测试
          </a>
        </div>
        
        {status === 'error' && (
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
            如果问题持续存在，请联系客服或稍后重试。
          </p>
        )}
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#6b7280' }}>
        <p>返回 <a href="/" style={{ color: '#3b82f6' }}>首页</a></p>
      </div>
    </div>
  );
}