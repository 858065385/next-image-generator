'use client';

import { useState, useEffect } from 'react';

interface DebugData {
  subscriptions?: any[];
  webhooks?: any[];
  credit_usage?: any[];
}

export default function SubscriptionDebugPage() {
  const [debugData, setDebugData] = useState<DebugData>({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDebugData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDebugData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/debug/query-subscriptions');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Failed to load debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDebugData();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#333' }}>订阅调试</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>自动刷新 (30秒)</span>
          </label>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            刷新
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* 订阅记录 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>订阅记录 (最新20条)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>用户ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>邮箱</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>计划</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>状态</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>当前周期</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Creem订阅ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {debugData.subscriptions?.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{sub.id}</td>
                    <td style={{ padding: '8px' }}>{sub.user_id}</td>
                    <td style={{ padding: '8px' }}>{sub.user_email || '-'}</td>
                    <td style={{ padding: '8px' }}>{sub.plan_name} ({sub.plan_interval})</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        background: sub.status === 'active' ? '#d4edda' : 
                                   sub.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                        color: sub.status === 'active' ? '#155724' : 
                              sub.status === 'cancelled' ? '#721c24' : '#856404'
                      }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {new Date(sub.current_period_start).toLocaleDateString()} - 
                      {new Date(sub.current_period_end).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{sub.creem_subscription_id || '-'}</td>
                    <td style={{ padding: '8px' }}>{new Date(sub.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhook事件 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Webhook事件 (最新10条)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>事件ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>事件类型</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>处理状态</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {debugData.webhooks?.map((webhook) => (
                  <tr key={webhook.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{webhook.event_id}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        background: '#e9ecef',
                        color: '#495057'
                      }}>
                        {webhook.event_type}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        background: webhook.processed ? '#d4edda' : '#f8d7da',
                        color: webhook.processed ? '#155724' : '#721c24'
                      }}>
                        {webhook.processed ? '已处理' : '未处理'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>{new Date(webhook.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 积分使用记录 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>积分使用记录 (最新20条)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>用户ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>订阅ID</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>剩余积分</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>已使用</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>订阅状态</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>周期</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>更新时间</th>
                </tr>
              </thead>
              <tbody>
                {debugData.credit_usage?.map((credit) => (
                  <tr key={credit.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{credit.id}</td>
                    <td style={{ padding: '8px' }}>{credit.user_id}</td>
                    <td style={{ padding: '8px' }}>{credit.user_subscriptions_id || '-'}</td>
                    <td style={{ padding: '8px' }}>{credit.period_remain_count}</td>
                    <td style={{ padding: '8px' }}>{credit.used_count}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        background: credit.is_subscription_active ? '#d4edda' : '#f8d7da',
                        color: credit.is_subscription_active ? '#155724' : '#721c24'
                      }}>
                        {credit.is_subscription_active ? '活跃' : '非活跃'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {new Date(credit.period_start).toLocaleDateString()} - 
                      {new Date(credit.period_end).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '8px' }}>{new Date(credit.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}