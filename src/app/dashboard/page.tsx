'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserInfo {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
}

interface SubscriptionInfo {
  id: number;
  plan_name: string;
  subscription_status: string;
  current_period_start: string;
  current_period_end: string;
  creem_subscription_id: string;
}

interface CreditInfo {
  period_remain_count: number;
  used_count: number;
  is_subscription_active: boolean;
  period_start: string;
  period_end: string;
}

interface GenerationHistory {
  id: number;
  effect_name: string;
  prompt: string;
  url: string;
  status: string;
  credit: number;
  created_at: string;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUuid, setUserUuid] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // 获取用户会话信息
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setUserInfo(data.user);
          setUserUuid(data.user.uuid || data.user.id);
          setUserEmail(data.user.email);
          // 加载用户详细信息
          await loadUserDetails(data.user.uuid || data.user.id, data.user.email);
        } else {
          // 用户未登录
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        setLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const loadUserDetails = async (uuid: string, email: string) => {
    try {
      // 加载订阅信息
      const subResponse = await fetch('/api/user/get_user_subscription_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uuid })
      });
      
      const subData = await subResponse.json();
      if (subData.code === 0) {
        setSubscription(subData.data.subscription);
        setCredits(subData.data.credits);
      }

      // 加载最近生成记录
      const genResponse = await fetch('/api/effect_result/list_by_user_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: uuid,
          page: 1,
          page_size: 5
        })
      });
      
      const genData = await genResponse.json();
      if (genData.code === 0) {
        setRecentGenerations(genData.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'expired':
        return '#6c757d';
      default:
        return '#ffc107';
    }
  };

  if (loading) {
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
          <p style={{ color: '#6b7280' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
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
          <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>请先登录</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            您需要登录后才能访问用户仪表盘
          </p>
          <Link
            href="/signin"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 头部 */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2rem' }}>用户仪表盘</h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>管理您的订阅和生成记录</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/admin-enhanced"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#6f42c1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontSize: '14px'
            }}
          >
            ⚙️ 管理后台
          </Link>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontSize: '14px'
            }}
          >
            ← 返回首页
          </Link>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <img 
          src={userInfo.avatar_url || `https://ui-avatars.com/api/?name=${userInfo.nickname}&background=3b82f6&color=fff`}
          alt={userInfo.nickname}
          style={{ width: '64px', height: '64px', borderRadius: '50%' }}
        />
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>{userInfo.nickname}</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>{userInfo.email}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            注册时间: {formatDate(userInfo.created_at)}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* 积分卡片 */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 'normal' }}>剩余积分</h3>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>💎</span>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
            {credits?.period_remain_count || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
            已使用: {credits?.used_count || 0}
          </div>
        </div>

        {/* 订阅状态卡片 */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 'normal' }}>订阅状态</h3>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.25rem', color: '#10b981' }}>⭐</span>
            </div>
          </div>
          {subscription ? (
            <>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                {subscription.plan_name}
              </div>
              <div style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: `${getStatusColor(subscription.subscription_status)}20`,
                color: getStatusColor(subscription.subscription_status),
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}>
                {subscription.subscription_status === 'active' ? '活跃' : 
                 subscription.subscription_status === 'cancelled' ? '已取消' : '已过期'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                至 {formatDate(subscription.current_period_end)}
              </div>
            </>
          ) : (
            <div style={{ color: '#64748b' }}>
              暂无订阅
            </div>
          )}
        </div>

        {/* 生成统计卡片 */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 'normal' }}>生成统计</h3>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.25rem', color: '#f59e0b' }}>🎨</span>
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
            {credits?.used_count || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
            总生成次数
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>快捷操作</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/test-payment"
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            💳 订阅服务
          </Link>
          
          {!subscription || subscription.subscription_status !== 'active' ? (
            <Link
              href="/test-payment"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              💳 测试订阅支付
            </Link>
          ) : null}
          
          <Link
            href="/admin-enhanced"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
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
            ⚙️ 管理中心
          </Link>
        </div>
      </div>

      {/* 最近生成记录 */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>最近生成记录</h3>
        {recentGenerations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentGenerations.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <img
                  src={item.url || '/placeholder.png'}
                  alt="Generated content"
                  style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {item.effect_name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {item.prompt.length > 50 ? `${item.prompt.substring(0, 50)}...` : item.prompt}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>💎 {item.credit} 积分</span>
                    <span>•</span>
                    <span>{formatDateTime(item.created_at)}</span>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: item.status === 'completed' ? '#d1fae5' : '#fef3c7',
                      color: item.status === 'completed' ? '#065f46' : '#92400e',
                      borderRadius: '9999px'
                    }}>
                      {item.status === 'completed' ? '已完成' : '处理中'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>暂无生成记录</p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                color: '#3b82f6',
                textDecoration: 'none'
              }}
            >
              开始生成 →
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}