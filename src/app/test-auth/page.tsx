'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setLoading(true);
    // Simple signOut without async/await to avoid any issues
    signOut({ callbackUrl: '/test-auth' });
    // Reset loading state after a delay
    setTimeout(() => setLoading(false), 1000);
  };

  if (status === 'loading') {
    return (
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
          <p style={{ color: '#6b7280' }}>检查登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#1e293b' }}>
        认证测试页面
      </h1>

      {/* 用户状态显示 */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#475569' }}>当前状态</h2>
        <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
          <strong>登录状态:</strong> {session ? '已登录' : '未登录'}
        </p>
        {session && (
          <>
            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
              <strong>用户ID:</strong> {session.user?.id}
            </p>
            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
              <strong>邮箱:</strong> {session.user?.email}
            </p>
            <p style={{ margin: '0.5rem 0', color: '#64748b' }}>
              <strong>昵称:</strong> {session.user?.name || session.user?.email?.split('@')[0]}
            </p>
            {session.user?.image && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={session.user.image} 
                  alt="User avatar" 
                  style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {session ? (
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
          >
            {loading ? (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              '退出登录'
            )}
          </button>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                使用 Google 登录
              </>
            )}
          </button>
        )}
      </div>

      {/* 快速链接 */}
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.75rem',
        border: '1px solid #bae6fd'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0369a1' }}>快速链接</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{
              color: '#0369a1',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            ← 返回首页
          </Link>
          {session && (
            <Link
              href="/dashboard"
              style={{
                color: '#0369a1',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              → 进入用户仪表盘
            </Link>
          )}
          <Link
            href="/signin"
            style={{
              color: '#0369a1',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            → 标准登录页面
          </Link>
        </div>
      </div>

      {/* Session API 测试 */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#fef3c7',
        borderRadius: '0.75rem',
        border: '1px solid #fde68a'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>开发调试</h3>
        <p style={{ margin: '0.5rem 0', color: '#78350f', fontSize: '0.875rem' }}>
          Session API: <code style={{ backgroundColor: '#fffbeb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>GET /api/auth/session</code>
        </p>
        <p style={{ margin: '0.5rem 0', color: '#78350f', fontSize: '0.875rem' }}>
          当前会话状态: {JSON.stringify(session, null, 2)}
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}