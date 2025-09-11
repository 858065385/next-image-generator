'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface User {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  created_at: string;
}

interface Subscription {
  plan_name: string;
  plan_interval: string;
  plan_price: number;
  subscription_status?: string;
  remain_count: number;
  current_period_start: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

interface Credits {
  id: number;
  user_id: string;
  period_remain_count: number;
  used_count: number;
  is_subscription_active: boolean;
  period_start: string;
  period_end: string;
}

interface PaymentHistory {
  id: number;
  amount: number;
  currency: string;
  status: string;
  creem_checkout_id: string;
  creem_subscription_id: string;
  created_at: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userUuid = params.uuid as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userUuid]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // 获取用户详细信息
      const response = await fetch(`/api/users/${userUuid}`);
      const data = await response.json();
      
      if (data.code === 0) {
        setUser(data.data.user);
        setSubscription(data.data.subscription);
        setCredits(data.data.credits);
        
        // 获取支付历史
        loadPaymentHistory(userUuid);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/subscriptions?page=1&limit=10`);
      const data = await response.json();
      
      if (data.code === 0) {
        // 过滤出支付记录
        const paymentRecords = data.data.history.filter(item => item.type === 'payment');
        setPaymentHistory(paymentRecords);
      }
    } catch (error) {
      console.error('Failed to load payment history:', error);
    }
  };

  const handleBack = () => {
    router.push('/admin/users');
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '#6c757d';
    
    switch (status.toLowerCase()) {
      case 'active':
        return '#28a745';
      case 'cancelled':
      case 'canceled':
        return '#dc3545';
      case 'past_due':
        return '#ffc107';
      case 'expired':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return '未知';
    
    switch (status.toLowerCase()) {
      case 'active':
        return '活跃';
      case 'cancelled':
      case 'canceled':
        return '已取消';
      case 'past_due':
        return '逾期';
      case 'expired':
        return '已过期';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>用户不存在</div>
        <button
          onClick={handleBack}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回用户列表
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* 返回按钮 */}
      <button
        onClick={handleBack}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← 返回用户列表
      </button>

      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        用户详情 - {user.nickname}
      </h1>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 基本信息 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '15px' }}>基本信息</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px' }}>
            <div><strong>ID:</strong></div>
            <div>{user.id}</div>
            
            <div><strong>UUID:</strong></div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{user.uuid}</div>
            
            <div><strong>昵称:</strong></div>
            <div>{user.nickname}</div>
            
            <div><strong>邮箱:</strong></div>
            <div>{user.email}</div>
            
            <div><strong>注册时间:</strong></div>
            <div>{new Date(user.created_at).toLocaleString()}</div>
          </div>
        </div>

        {/* 订阅信息 */}
        {subscription ? (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px' }}>订阅信息</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px' }}>
              <div><strong>计划:</strong></div>
              <div>{subscription.plan_name} ({subscription.plan_interval})</div>
              
              <div><strong>价格:</strong></div>
              <div>${subscription.plan_price} USD</div>
              
              <div><strong>状态:</strong></div>
              <div>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    background: getStatusColor(subscription.subscription_status)
                  }}
                >
                  {formatStatus(subscription.subscription_status)}
                </span>
              </div>
              
              <div><strong>剩余次数:</strong></div>
              <div>{subscription.remain_count}</div>
              
              <div><strong>当前周期:</strong></div>
              <div>
                {new Date(subscription.current_period_start).toLocaleDateString()} - 
                {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '永久'}
              </div>
              
              {subscription.cancel_at_period_end && (
                <>
                  <div><strong>取消设置:</strong></div>
                  <div style={{ color: '#dc3545' }}>将在当前周期结束后取消</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', color: '#666' }}>
            该用户暂无订阅记录
          </div>
        )}

        {/* 积分信息 */}
        {credits ? (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px' }}>积分信息</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px' }}>
              <div><strong>积分ID:</strong></div>
              <div>{credits.id}</div>
              
              <div><strong>剩余积分:</strong></div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {credits.period_remain_count}
              </div>
              
              <div><strong>已使用积分:</strong></div>
              <div>{credits.used_count}</div>
              
              <div><strong>订阅状态:</strong></div>
              <div>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    background: credits.is_subscription_active ? '#28a745' : '#dc3545'
                  }}
                >
                  {credits.is_subscription_active ? '订阅中' : '非订阅'}
                </span>
              </div>
              
              <div><strong>积分周期:</strong></div>
              <div>
                {new Date(credits.period_start).toLocaleDateString()} - 
                {new Date(credits.period_end).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', color: '#666' }}>
            该用户暂无积分记录
          </div>
        )}

        {/* 支付历史 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '15px' }}>支付历史</h3>
          {paymentHistory.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>时间</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>金额</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>订阅ID</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px' }}>
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {payment.amount} {payment.currency}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          background: payment.status === 'success' ? '#d4edda' : '#f8d7da',
                          color: payment.status === 'success' ? '#155724' : '#721c24'
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {payment.creem_subscription_id || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              暂无支付记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}