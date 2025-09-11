'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface SubscriptionInfo {
  plan_name: string;
  plan_interval: string;
  plan_price: number;
  subscription_status: string;
  remain_count: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface PaymentHistory {
  id: number;
  amount: number;
  currency: string;
  status: string;
  creem_checkout_id: string;
  creem_subscription_id: string;
  created_at: string;
  type: 'subscription' | 'payment';
  plan_name?: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // 获取用户会话信息
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setUserInfo(data.user);
          // 加载订阅信息
          await loadSubscriptionInfo(data.user.uuid || data.user.id);
          // 加载支付历史
          await loadPaymentHistory(data.user.uuid || data.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        setLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const loadSubscriptionInfo = async (uuid: string) => {
    try {
      const response = await fetch('/api/user/get_user_subscription_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uuid })
      });
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async (uuid: string) => {
    try {
      const response = await fetch(`/api/users/${uuid}/subscriptions?page=1&limit=10`);
      const data = await response.json();
      if (data.code === 0) {
        setPaymentHistory(data.data.history || []);
      }
    } catch (error) {
      console.error('Failed to load payment history:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userInfo) return;

    setCancelling(true);
    try {
      const response = await fetch('/api/user/cancel_subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userInfo.uuid || userInfo.id,
          reason: 'User requested cancellation'
        })
      });

      const data = await response.json();
      if (response.ok) {
        // 重新加载订阅信息
        await loadSubscriptionInfo(userInfo.uuid || userInfo.id);
        setShowCancelModal(false);
        alert('订阅已成功取消，您将在当前计费周期结束后失去访问权限');
      } else {
        alert(data.error || '取消订阅失败');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('取消订阅失败，请稍后重试');
    } finally {
      setCancelling(false);
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
      case 'past_due':
        return '#ffc107';
      case 'inactive':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'cancelled':
        return '已取消';
      case 'past_due':
        return '逾期';
      case 'inactive':
        return '未订阅';
      default:
        return status;
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
            您需要登录后才能管理订阅
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 头部 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2rem' }}>订阅管理</h1>
          <Link
            href="/admin/dashboard"
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
            ← 返回仪表盘
          </Link>
        </div>
        <p style={{ color: '#64748b', margin: 0 }}>管理您的订阅计划和账单历史</p>
      </div>

      {/* 当前订阅卡片 */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem' }}>当前订阅</h2>
        
        {subscription && subscription.subscription_status !== 'inactive' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>
                  {subscription.plan_name}
                </h3>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
                  ${subscription.plan_price}/{subscription.plan_interval === 'month' ? '月' : '年'}
                </p>
              </div>
              <div style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: `${getStatusColor(subscription.subscription_status)}20`,
                color: getStatusColor(subscription.subscription_status),
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                {getStatusText(subscription.subscription_status)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>当前周期</p>
                <p style={{ color: '#1e293b', fontWeight: '500', margin: 0 }}>
                  {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>剩余积分</p>
                <p style={{ color: '#1e293b', fontWeight: '500', margin: 0 }}>
                  💎 {subscription.remain_count}
                </p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#92400e', margin: 0, fontSize: '0.875rem' }}>
                  ⚠️ 您的订阅将在 {formatDate(subscription.current_period_end)} 到期后取消
                </p>
              </div>
            )}

            {subscription.subscription_status === 'active' && !subscription.cancel_at_period_end && (
              <button
                onClick={() => setShowCancelModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
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
                取消订阅
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              您当前没有活跃的订阅
            </p>
            <Link
              href="/test-payment"
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
              立即订阅
            </Link>
          </div>
        )}
      </div>

      {/* 支付历史 */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.5rem' }}>账单历史</h2>
        
        {paymentHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paymentHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {item.type === 'subscription' ? item.plan_name : '支付'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {formatDateTime(item.created_at)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {item.type === 'payment' ? `$${(item.amount / 100).toFixed(2)}` : '-'}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: item.status === 'success' ? '#d1fae5' : '#fee2e2',
                    color: item.status === 'success' ? '#065f46' : '#991b1b',
                    borderRadius: '9999px',
                    display: 'inline-block'
                  }}>
                    {item.status === 'success' ? '成功' : item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>暂无账单记录</p>
          </div>
        )}
      </div>

      {/* 取消确认弹窗 */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.25rem' }}>
              确认取消订阅
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              您确定要取消订阅吗？取消后，您仍可在当前计费周期结束前继续使用服务，到期后将失去访问权限。
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: cancelling ? 'not-allowed' : 'pointer'
                }}
              >
                返回
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: cancelling ? 'not-allowed' : 'pointer'
                }}
              >
                {cancelling ? '处理中...' : '确认取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}