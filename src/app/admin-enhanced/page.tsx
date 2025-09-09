'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  created_at: string;
}

interface UserData {
  user: User;
  subscription?: {
    plan_name: string;
    subscription_status: string;
    remain_count: number;
  };
  credits?: {
    period_remain_count: number;
    used_count: number;
    is_subscription_active: boolean;
  };
}

interface Stats {
  users: {
    total: number;
    new_today: number;
    growth_7d: Array<{ date: string; count: number }>;
  };
  subscriptions: {
    total_active: number;
    distribution: Array<{ name: string; interval: string; count: number }>;
  };
  credits: {
    total_credits: number;
    total_used: number;
    users_with_credits: number;
  };
}

interface LogEntry {
  id: number;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_nickname?: string;
  user_email?: string;
}

export default function AdminEnhancedPage() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'stats' | 'logs'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('1');

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  // 加载操作日志
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/overview');
      const data = await response.json();
      if (data.code === 0) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs?limit=50');
      const data = await response.json();
      if (data.code === 0) {
        setLogs(data.data.logs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm) return;
    
    try {
      const response = await fetch(`/api/admin/users?search=${searchTerm}`);
      const data = await response.json();
      if (data.code === 0) {
        setSearchResults(data.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const loadUserDetails = async (uid: string) => {
    setLoading(true);
    setUserId(uid);
    setSearchResults([]);
    
    try {
      const response = await fetch(`/api/admin/users/${uid}`);
      const data = await response.json();
      if (data.code === 0) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustCredits = async (operation: 'add' | 'deduct') => {
    if (!userId || !creditAmount) return;
    
    if (!confirm(`确定要${operation === 'add' ? '增加' : '扣除'} ${creditAmount} 积分吗？`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: creditAmount,
          reason: creditReason || '管理员调整',
          operation
        })
      });
      
      const data = await response.json();
      if (data.code === 0) {
        alert(`操作成功！新余额：${data.data.new_balance}`);
        // 刷新用户数据
        loadUserDetails(userId);
        setCreditAmount('');
        setCreditReason('');
      } else {
        alert(`操作失败：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to adjust credits:', error);
      alert('操作失败');
    }
  };

  const updateSubscription = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_plan_id: parseInt(selectedPlan),
          status: 'active',
          action: 'create'
        })
      });
      
      const data = await response.json();
      if (data.code === 0) {
        alert('订阅更新成功！');
        loadUserDetails(userId);
      } else {
        alert(`操作失败：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('操作失败');
    }
  };

  const simulatePayment = async (planType: 'monthly' | 'yearly') => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/debug/simulate-subscription-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan_type: planType,
          simulate_payment: true
        })
      });
      
      const data = await response.json();
      if (data.code === 0) {
        alert(`模拟${planType === 'monthly' ? '月度' : '年度'}支付成功！`);
        loadUserDetails(userId);
      } else {
        alert(`模拟失败：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to simulate payment:', error);
      alert('模拟失败');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>管理员控制台</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href="/test-payment" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            测试支付
          </a>
          <a 
            href="/" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            ← 返回首页
          </a>
        </div>
      </div>
      
      {/* 标签页导航 */}
      <div style={{ marginBottom: '30px' }}>
        <button
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            background: activeTab === 'user' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'user' ? 'white' : 'black',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('user')}
        >
          用户管理
        </button>
        <button
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            background: activeTab === 'stats' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'stats' ? 'white' : 'black',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('stats')}
        >
          数据统计
        </button>
        <button
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            background: activeTab === 'logs' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'logs' ? 'white' : 'black',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('logs')}
        >
          操作日志
        </button>
      </div>

      {activeTab === 'user' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          {/* 左侧搜索和操作面板 */}
          <div>
            {/* 用户搜索 */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>用户搜索</h3>
              <input
                type="text"
                placeholder="输入 UUID 或邮箱"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                onClick={searchUsers}
                style={{ width: '100%', padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                搜索
              </button>
              
              {/* 搜索结果 */}
              {searchResults.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h4>搜索结果</h4>
                  {searchResults.map(user => (
                    <div
                      key={user.uuid}
                      style={{
                        padding: '10px',
                        margin: '5px 0',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => loadUserDetails(user.uuid)}
                    >
                      <div>{user.nickname || user.email}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 快速操作 */}
            {userData && (
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h3>快速操作</h3>
                
                {/* 积分调整 */}
                <div style={{ marginBottom: '15px' }}>
                  <h4>积分调整</h4>
                  <input
                    type="number"
                    placeholder="积分数量"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    placeholder="调整原因"
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => adjustCredits('add')}
                      style={{ flex: 1, padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      增加
                    </button>
                    <button
                      onClick={() => adjustCredits('deduct')}
                      style={{ flex: 1, padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      扣除
                    </button>
                  </div>
                </div>

                {/* 订阅管理 */}
                <div style={{ marginBottom: '15px' }}>
                  <h4>订阅管理</h4>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="1">月度会员 (100积分)</option>
                    <option value="2">年度会员 (1200积分)</option>
                  </select>
                  <button
                    onClick={updateSubscription}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    设置订阅
                  </button>
                </div>

                {/* 模拟支付 */}
                <div>
                  <h4>模拟支付</h4>
                  <button
                    onClick={() => simulatePayment('monthly')}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
                  >
                    模拟月度支付
                  </button>
                  <button
                    onClick={() => simulatePayment('yearly')}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', background: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    模拟年度支付
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右侧用户详情 */}
          <div>
            {userData ? (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2>用户详情</h2>
                
                {/* 基本信息 */}
                <div style={{ marginBottom: '30px' }}>
                  <h3>基本信息</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px', alignItems: 'center' }}>
                    <div><strong>UUID:</strong></div>
                    <div>{userData.user.uuid}</div>
                    <div><strong>邮箱:</strong></div>
                    <div>{userData.user.email}</div>
                    <div><strong>昵称:</strong></div>
                    <div>{userData.user.nickname || '未设置'}</div>
                    <div><strong>注册时间:</strong></div>
                    <div>{new Date(userData.user.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* 订阅信息 */}
                {userData.subscription && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3>订阅信息</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px', alignItems: 'center' }}>
                      <div><strong>计划名称:</strong></div>
                      <div>{userData.subscription.plan_name}</div>
                      <div><strong>订阅状态:</strong></div>
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: userData.subscription.subscription_status === 'active' ? '#d4edda' : '#f8d7da',
                          color: userData.subscription.subscription_status === 'active' ? '#155724' : '#721c24'
                        }}>
                          {userData.subscription.subscription_status}
                        </span>
                      </div>
                      <div><strong>剩余积分:</strong></div>
                      <div>{userData.subscription.remain_count}</div>
                    </div>
                  </div>
                )}

                {/* 积分信息 */}
                {userData.credits && (
                  <div>
                    <h3>积分信息</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px', alignItems: 'center' }}>
                      <div><strong>当前余额:</strong></div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                        {userData.credits.period_remain_count}
                      </div>
                      <div><strong>已使用:</strong></div>
                      <div>{userData.credits.used_count}</div>
                      <div><strong>订阅状态:</strong></div>
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: userData.credits.is_subscription_active ? '#d4edda' : '#f8d7da',
                          color: userData.credits.is_subscription_active ? '#155724' : '#721c24'
                        }}>
                          {userData.credits.is_subscription_active ? '活跃' : '非活跃'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                请搜索用户以查看详情
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* 用户统计 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>用户统计</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff', margin: '10px 0' }}>
              {stats.users.total}
            </div>
            <div>总用户数</div>
            <div style={{ marginTop: '15px', fontSize: '18px', color: '#28a745' }}>
              今日新增: {stats.users.new_today}
            </div>
          </div>

          {/* 订阅统计 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>订阅统计</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', margin: '10px 0' }}>
              {stats.subscriptions.total_active}
            </div>
            <div>活跃订阅</div>
            <div style={{ marginTop: '15px' }}>
              {stats.subscriptions.distribution.map(item => (
                <div key={item.name} style={{ margin: '5px 0' }}>
                  {item.name} ({item.interval}): {item.count}
                </div>
              ))}
            </div>
          </div>

          {/* 积分统计 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>积分统计</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107', margin: '10px 0' }}>
              {stats.credits.total_credits}
            </div>
            <div>总积分</div>
            <div style={{ marginTop: '10px' }}>
              已使用: {stats.credits.total_used}
            </div>
            <div>
              有积分用户: {stats.credits.users_with_credits}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>操作日志</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>时间</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>操作人</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>详情</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      {log.user_nickname || log.user_email || log.user_id}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: '#e9ecef',
                        color: '#495057'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <pre style={{ fontSize: '12px', margin: 0 }}>
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}