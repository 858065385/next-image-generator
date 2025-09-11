'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
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

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            登录
          </h1>
          <p style={{ color: '#64748b' }}>
            使用 Google 账号登录以继续
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
        >
          {loading ? (
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #f3f4f6',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录
            </>
          )}
        </button>

        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <p>登录即表示您同意我们的服务条款</p>
          <p style={{ marginTop: '0.5rem' }}>
            <a 
              href="/" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              ← 返回首页
            </a>
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}