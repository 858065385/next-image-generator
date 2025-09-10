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

interface DebugData {
  subscriptions?: any[];
  webhooks?: any[];
  credit_usage?: any[];
}

export default function AdminEnhancedPage() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'stats' | 'logs' | 'debug'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('1');
  const [debugData, setDebugData] = useState<DebugData>({});

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

  // 加载调试数据
  useEffect(() => {
    if (activeTab === 'debug') {
      loadDebugData();
      const interval = setInterval(loadDebugData, 30000);
      return () => clearInterval(interval);
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

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/debug/query-subscriptions');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Failed to load debug data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.code === 0) {
        setSearchResults(data.data.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: User) => {
    setUserId(user.uuid);
    try {
      const response = await fetch(`/api/admin/users/${user.uuid}`);
      const data = await response.json();
      if (data.code === 0) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!userId || !creditAmount || !creditReason) {
      alert('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/admin/credits/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: parseInt(creditAmount),
          reason: creditReason
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        alert('积分添加成功');
        setCreditAmount('');
        setCreditReason('');
        // 刷新用户数据
        if (userData) {
          handleUserSelect(userData.user);
        }
      } else {
        alert(data.message || '添加失败');
      }
    } catch (error) {
      console.error('Failed to add credits:', error);
      alert('添加失败');
    }
  };

  const handleSimulateSubscription = async () => {
    if (!userId) {
      alert('请先选择用户');
      return;
    }

    try {
      const response = await fetch('/api/admin/subscription/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan_id: parseInt(selectedPlan)
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        alert('订阅模拟成功');
        // 刷新用户数据
        if (userData) {
          handleUserSelect(userData.user);
        }
      } else {
        alert(data.message || '模拟失败');
      }
    } catch (error) {
      console.error('Failed to simulate subscription:', error);
      alert('模拟失败');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#333' }}>管理后台</h1>
        <div>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#6c757d',
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
        <button
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            background: activeTab === 'debug' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'debug' ? 'white' : 'black',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('debug')}
        >
          订阅调试
        </button>
      </div>

      {activeTab === 'user' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
          {/* 左侧搜索 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>搜索用户</h3>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="输入邮箱或昵称"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? '搜索中...' : '搜索'}
            </button>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4>搜索结果</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        background: userId === user.uuid ? '#f0f0f0' : 'white'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{user.nickname}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧用户详情 */}
          <div>
            {userData ? (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>用户详情</h3>
                <div style={{ marginBottom: '20px' }}>
                  <h4>基本信息</h4>
                  <p><strong>昵称:</strong> {userData.user.nickname}</p>
                  <p><strong>邮箱:</strong> {userData.user.email}</p>
                  <p><strong>注册时间:</strong> {new Date(userData.user.created_at).toLocaleString()}</p>
                </div>

                {userData.subscription && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>订阅信息</h4>
                    <p><strong>计划:</strong> {userData.subscription.plan_name}</p>
                    <p><strong>状态:</strong> {userData.subscription.subscription_status}</p>
                    <p><strong>剩余次数:</strong> {userData.subscription.remain_count}</p>
                  </div>
                )}

                {userData.credits && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>积分信息</h4>
                    <p><strong>剩余积分:</strong> {userData.credits.period_remain_count}</p>
                    <p><strong>已使用:</strong> {userData.credits.used_count}</p>
                    <p><strong>订阅状态:</strong> {userData.credits.is_subscription_active ? '活跃' : '非活跃'}</p>
                  </div>
                )}

                {/* 添加积分 */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <h4>添加积分</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="number"
                      placeholder="积分数量"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="原因"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={handleAddCredits}
                      style={{
                        padding: '8px 16px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      添加积分
                    </button>
                  </div>
                </div>

                {/* 模拟订阅 */}
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <h4>模拟订阅</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="1">基础计划 (月付)</option>
                      <option value="2">基础计划 (年付)</option>
                      <option value="3">专业计划 (月付)</option>
                      <option value="4">专业计划 (年付)</option>
                    </select>
                    <button
                      onClick={handleSimulateSubscription}
                      style={{
                        padding: '8px 16px',
                        background: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      模拟订阅
                    </button>
                  </div>
                </div>
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

      {activeTab === 'debug' && (
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
      )}
    </div>
  );
}