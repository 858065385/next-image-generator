'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export default function DatabaseDemoPage() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const testUserRegistration = async () => {
    if (!session?.user) {
      addTestResult({
        name: '用户注册测试',
        status: 'error',
        message: '请先登录'
      });
      return;
    }

    setIsLoading(true);
    addTestResult({
      name: '用户注册测试',
      status: 'pending',
      message: '正在测试用户注册...'
    });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: session.user,
          account: {
            type: 'oauth',
            provider: 'google',
            providerAccountId: session.sub || 'test'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addTestResult({
          name: '用户注册测试',
          status: 'success',
          message: '用户注册成功',
          data: data
        });
      } else {
        addTestResult({
          name: '用户注册测试',
          status: 'error',
          message: `注册失败: ${data.error || '未知错误'}`
        });
      }
    } catch (error) {
      addTestResult({
        name: '用户注册测试',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUserQuery = async () => {
    if (!session?.user?.email) {
      addTestResult({
        name: '用户查询测试',
        status: 'error',
        message: '请先登录'
      });
      return;
    }

    setIsLoading(true);
    addTestResult({
      name: '用户查询测试',
      status: 'pending',
      message: '正在查询用户信息...'
    });

    try {
      // 测试通过邮箱查询用户
      const response = await fetch(`/api/debug/user-by-email?email=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      
      if (response.ok) {
        addTestResult({
          name: '用户查询测试',
          status: 'success',
          message: '用户查询成功',
          data: data
        });
      } else {
        addTestResult({
          name: '用户查询测试',
          status: 'error',
          message: `查询失败: ${data.error || '未知错误'}`
        });
      }
    } catch (error) {
      addTestResult({
        name: '用户查询测试',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCreditUsage = async () => {
    if (!session?.user?.email) {
      addTestResult({
        name: '积分系统测试',
        status: 'error',
        message: '请先登录'
      });
      return;
    }

    setIsLoading(true);
    addTestResult({
      name: '积分系统测试',
      status: 'pending',
      message: '正在查询积分信息...'
    });

    try {
      const response = await fetch(`/api/user/get_user_subscription_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: session.user.email
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        addTestResult({
          name: '积分系统测试',
          status: 'success',
          message: `积分查询成功 - ${data.plan_name} (剩余积分: ${data.remain_count})`,
          data: data
        });
      } else {
        addTestResult({
          name: '积分系统测试',
          status: 'error',
          message: `查询失败: ${data.detail || '未知错误'}`
        });
      }
    } catch (error) {
      addTestResult({
        name: '积分系统测试',
        status: 'error',
        message: `网络错误: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEffectResult = async () => {
    if (!session?.user?.email) {
      addTestResult({
        name: '效果结果测试',
        status: 'error',
        message: '请先登录'
      });
      return;
    }

    setIsLoading(true);
    addTestResult({
      name: '效果结果测试',
      status: 'pending',
      message: '正在测试保存效果结果...'
    });

    try {
      const response = await fetch('/api/debug/effect-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: session.user.email,
          prompt: '测试提示词',
          effect_name: 'test-effect',
          credit: 1
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addTestResult({
          name: '效果结果测试',
          status: 'success',
          message: '效果结果保存成功',
          data: data
        });
      } else {
        addTestResult({
          name: '效果结果测试',
          status: 'error',
          message: `保存失败: ${data.error || '未知错误'}`
        });
      }
    } catch (error) {
      addTestResult({
        name: '效果结果测试',
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1>数据库功能测试页面</h1>
        <p>此页面用于测试数据库的各项功能，帮助诊断和解决数据库连接问题。</p>

        {/* 用户信息 */}
        <div style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
          <h3>当前用户信息</h3>
          {session?.user ? (
            <div>
              <p><strong>姓名:</strong> {session.user.name}</p>
              <p><strong>邮箱:</strong> {session.user.email}</p>
              <p><strong>ID:</strong> {session.user.id || 'N/A'}</p>
            </div>
          ) : (
            <p>未登录</p>
          )}
        </div>

        {/* 测试按钮 */}
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={testUserRegistration}
            disabled={isLoading || !session?.user}
            style={{ 
              padding: '10px 20px', 
              margin: '5px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              background: '#007bff',
              color: 'white'
            }}
          >
            测试用户注册
          </button>
          
          <button 
            onClick={testUserQuery}
            disabled={isLoading || !session?.user}
            style={{ 
              padding: '10px 20px', 
              margin: '5px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              background: '#28a745',
              color: 'white'
            }}
          >
            测试用户查询
          </button>
          
          <button 
            onClick={testCreditUsage}
            disabled={isLoading || !session?.user}
            style={{ 
              padding: '10px 20px', 
              margin: '5px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              background: '#ffc107',
              color: 'black'
            }}
          >
            测试积分系统
          </button>
          
          <button 
            onClick={testEffectResult}
            disabled={isLoading || !session?.user}
            style={{ 
              padding: '10px 20px', 
              margin: '5px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              background: '#17a2b8',
              color: 'white'
            }}
          >
            测试效果结果保存
          </button>
          
          <button 
            onClick={clearResults}
            style={{ 
              padding: '10px 20px', 
              margin: '5px', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              background: '#6c757d',
              color: 'white'
            }}
          >
            清除结果
          </button>
        </div>

        {/* 测试结果 */}
        <div style={{ marginTop: '30px' }}>
          <h3>测试结果</h3>
          {testResults.length === 0 ? (
            <p>暂无测试结果</p>
          ) : (
            <div>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  style={{ 
                    margin: '10px 0', 
                    padding: '15px', 
                    borderRadius: '5px',
                    borderLeft: `5px solid ${
                      result.status === 'success' ? '#28a745' : 
                      result.status === 'error' ? '#dc3545' : '#ffc107'
                    }`,
                    background: result.status === 'error' ? '#f8d7da' : 
                                 result.status === 'success' ? '#d4edda' : '#fff3cd'
                  }}
                >
                  <h4>{result.name}</h4>
                  <p><strong>状态:</strong> {result.status}</p>
                  <p><strong>消息:</strong> {result.message}</p>
                  {result.data && (
                    <details>
                      <summary>详细数据</summary>
                      <pre style={{ 
                        background: '#f8f9fa', 
                        padding: '10px', 
                        borderRadius: '3px',
                        overflow: 'auto',
                        fontSize: '12px'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}