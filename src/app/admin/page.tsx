'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  uuid: string;
  email: string;
  nickname: string;
  created_at: string;
}

interface CreditData {
  id: number;
  user_id: string;
  period_remain_count: number;
  used_count: number;
  is_subscription_active: boolean;
  period_start: string;
  period_end: string;
}

interface SubscriptionData {
  plan_name: string;
  plan_interval: string;
  plan_price: number;
  subscription_status: string;
  remain_count: number;
  current_period_start: string;
  current_period_end: string;
}

interface TestResult {
  action: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [
      {
        ...result,
        timestamp: new Date().toLocaleString()
      },
      ...prev.slice(0, 9) // 只保留最近10条
    ]);
  };

  const searchUser = async () => {
    if (!userId) {
      addTestResult({
        action: '查询用户',
        status: 'error',
        message: '请输入用户ID'
      });
      return;
    }

    setIsLoading(true);
    try {
      // 查询用户基本信息
      const userResponse = await fetch(`/api/debug/user-by-email?email=${encodeURIComponent(userId)}`);
      const userData = await userResponse.json();
      
      if (userResponse.ok && userData.success) {
        setUserData(userData.user);
        addTestResult({
          action: '查询用户',
          status: 'success',
          message: `找到用户: ${userData.user.nickname} (${userData.user.email})`
        });
        
        // 查询积分和订阅信息
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '查询用户',
          status: 'error',
          message: userData.error || '用户不存在'
        });
      }
    } catch (error) {
      addTestResult({
        action: '查询用户',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async (uid: string) => {
    try {
      const [subResponse, creditResponse] = await Promise.all([
        fetch('/api/user/get_user_subscription_info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: uid })
        }),
        fetch('/api/credit/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: uid })
        })
      ]);

      const subData = await subResponse.json();
      const creditInfo = await creditResponse.json();

      if (subResponse.ok && subData.code === 0) {
        setSubscriptionData(subData);
      }
      
      if (creditResponse.ok && creditInfo.code === 0) {
        setCreditData(creditInfo.data);
      }
    } catch (error) {
      console.error('Refresh data error:', error);
    }
  };

  const setupFreeUser = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/credit-system-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'setup_free_user'
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        addTestResult({
          action: '设置免费用户',
          status: 'success',
          message: '已设置为免费用户，获得20积分',
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '设置免费用户',
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: '设置免费用户',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupMonthlyPro = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/credit-system-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'setup_monthly_pro'
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        addTestResult({
          action: '设置月度会员',
          status: 'success',
          message: '已设置为月度专业版会员（100积分/月）',
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '设置月度会员',
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: '设置月度会员',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupYearlyPro = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/credit-system-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'setup_yearly_pro'
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        addTestResult({
          action: '设置年度会员',
          status: 'success',
          message: '已设置为年度专业版会员（1200积分/年）',
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '设置年度会员',
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: '设置年度会员',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async () => {
    if (!userId) return;
    
    const amount = prompt('请输入要添加的积分数:', '50');
    if (!amount || isNaN(amount)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/credit-system-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: 'add_credits',
          amount: parseInt(amount)
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        addTestResult({
          action: '添加积分',
          status: 'success',
          message: `成功添加 ${amount} 积分`,
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '添加积分',
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: '添加积分',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useCredits = async () => {
    if (!userId) return;
    
    const amount = prompt('请输入要使用的积分数:', '1');
    if (!amount || isNaN(amount)) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/credit/adjust', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: parseInt(amount),
          reason: 'Test usage'
        })
      });

      const data = await response.json();
      
      if (data.code === 0) {
        addTestResult({
          action: '使用积分',
          status: 'success',
          message: `成功使用 ${amount} 积分`,
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: '使用积分',
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: '使用积分',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulatePayment = async (planType: 'monthly' | 'yearly') => {
    if (!userId) return;
    
    setIsLoading(true);
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
        addTestResult({
          action: `模拟${planType === 'monthly' ? '月度' : '年度'}支付成功`,
          status: 'success',
          message: `成功模拟${planType === 'monthly' ? '月度' : '年度'}订阅支付`,
          data: data.data
        });
        await refreshUserData(userId);
      } else {
        addTestResult({
          action: `模拟${planType === 'monthly' ? '月度' : '年度'}支付`,
          status: 'error',
          message: data.error
        });
      }
    } catch (error) {
      addTestResult({
        action: `模拟${planType === 'monthly' ? '月度' : '年度'}支付`,
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // 积分机制说明
  const creditSystemInfo = [
    { type: 'Flux1.1 Pro', name: '图像生成', cost: 1, description: '每次生成图片消耗1积分' },
    { type: 'Kling v2.1', name: '视频生成', cost: 15, description: '每次生成视频消耗15积分' },
  ];

  const subscriptionPlans = [
    { name: '免费用户', price: '$0', credits: 20, period: '一次性', features: ['基础功能测试', '20个积分'] },
    { name: '月度专业版', price: '$9.99/月', credits: 100, period: '每月重置', features: ['100积分/月', '优先处理', '全部功能'] },
    { name: '年度专业版', price: '$99.99/年', credits: 1200, period: '每年重置', features: ['1200积分/年', '优先处理', '全部功能', '节省16%'] },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>管理员 - 积分系统管理</h1>
        
        {session?.user && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
            <h3>当前管理员</h3>
            <p><strong>姓名:</strong> {session.user.name}</p>
            <p><strong>邮箱:</strong> {session.user.email}</p>
          </div>
        )}

        {/* 积分机制说明 */}
        <div style={{ marginBottom: '30px' }}>
          <h2>积分消耗规则</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {creditSystemInfo.map((item, index) => (
              <div key={index} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h4>{item.name}</h4>
                <p><strong>消耗:</strong> {item.cost} 积分/次</p>
                <p style={{ fontSize: '14px', color: '#666' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 会员计划说明 */}
        <div style={{ marginBottom: '30px' }}>
          <h2>会员计划</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {subscriptionPlans.map((plan, index) => (
              <div key={index} style={{ 
                padding: '20px', 
                border: index === 1 ? '2px solid #007bff' : '1px solid #ddd', 
                borderRadius: '5px',
                background: index === 1 ? '#f8f9ff' : 'white'
              }}>
                <h3>{plan.name}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{plan.price}</p>
                <p><strong>积分:</strong> {plan.credits} ({plan.period})</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ marginBottom: '5px' }}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 用户查询 */}
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '5px' }}>
          <h2>用户管理</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="输入用户邮箱或 UUID"
              style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button
              onClick={searchUser}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              查询用户
            </button>
          </div>

          {/* 用户信息显示 */}
          {userData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ padding: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h4>用户信息</h4>
                <p><strong>昵称:</strong> {userData.nickname}</p>
                <p><strong>邮箱:</strong> {userData.email}</p>
                <p><strong>UUID:</strong> {userData.uuid}</p>
                <p><strong>注册时间:</strong> {userData.created_at ? new Date(userData.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              
              {creditData && (
                <div style={{ padding: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <h4>积分信息</h4>
                  <p><strong>剩余积分:</strong> <span style={{ fontSize: '24px', color: creditData.period_remain_count > 0 ? '#28a745' : '#dc3545' }}>{creditData.period_remain_count}</span></p>
                  <p><strong>已使用:</strong> {creditData.used_count}</p>
                  <p><strong>总计:</strong> {creditData.used_count + creditData.period_remain_count}</p>
                  <p><strong>订阅状态:</strong> <span style={{ color: creditData.is_subscription_active ? '#28a745' : '#6c757d' }}>
                    {creditData.is_subscription_active ? '活跃' : '未订阅'}
                  </span></p>
                  <p><strong>周期:</strong> {new Date(creditData.period_start).toLocaleDateString()} - {new Date(creditData.period_end).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          {userData && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                <button
                  onClick={setupFreeUser}
                  disabled={isLoading}
                  style={{
                    padding: '10px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  设置免费用户
                </button>
                <button
                  onClick={() => simulatePayment('monthly')}
                  disabled={isLoading}
                  style={{
                    padding: '10px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  模拟月度支付
                </button>
                <button
                  onClick={() => simulatePayment('yearly')}
                  disabled={isLoading}
                  style={{
                    padding: '10px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  模拟年度支付
                </button>
                <button
                  onClick={addCredits}
                  disabled={isLoading}
                  style={{
                    padding: '10px',
                    background: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  添加积分
                </button>
                <button
                  onClick={useCredits}
                  disabled={isLoading}
                  style={{
                    padding: '10px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  使用积分
                </button>
                <button
                  onClick={clearResults}
                  style={{
                    padding: '10px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  清空日志
                </button>
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
                <p>💡 <strong>模拟支付</strong>会完全复制真实支付成功后的业务逻辑，包括：</p>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  <li>创建/更新订阅记录</li>
                  <li>设置正确的计费周期</li>
                  <li>处理积分（续费会保留剩余积分）</li>
                  <li>激活订阅状态</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* 操作日志 */}
        {testResults.length > 0 && (
          <div>
            <h3>操作日志</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '10px',
                    padding: '15px',
                    borderRadius: '5px',
                    borderLeft: `5px solid ${
                      result.status === 'success' ? '#28a745' : '#dc3545'
                    }`,
                    background: result.status === 'success' ? '#d4edda' : '#f8d7da'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{result.action}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>{result.timestamp}</span>
                  </div>
                  <p>{result.message}</p>
                  {result.data && (
                    <details style={{ marginTop: '10px' }}>
                      <summary style={{ cursor: 'pointer' }}>详细数据</summary>
                      <pre style={{ 
                        background: 'white', 
                        padding: '10px', 
                        borderRadius: '3px',
                        overflow: 'auto',
                        fontSize: '12px',
                        marginTop: '5px'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}