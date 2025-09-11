'use client';

import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 如果用户已经登出，重定向到首页
    if (!session) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (!session) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>您已成功退出登录</h1>
          <p style={{ color: '#64748b' }}>正在跳转到首页...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.75rem'
      }}>
        <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>确认退出登录</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          您确定要退出登录吗？
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleSignOut}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            确认退出
          </button>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#e5e7eb',
              color: '#1f2937',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#d1d5db';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}