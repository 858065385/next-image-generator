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

export default function UserManagementPage() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('1');

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>用户管理</h1>
      
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
    </div>
  );
}