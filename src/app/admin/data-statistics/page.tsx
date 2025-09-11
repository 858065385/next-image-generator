'use client';

import { useState, useEffect } from 'react';

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

export default function DataStatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/overview');
      const data = await response.json();
      if (data.code === 0) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>加载统计数据失败</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>数据统计</h1>
      
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

      {/* 用户增长趋势 */}
      {stats.users.growth_7d && stats.users.growth_7d.length > 0 && (
        <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>近7天用户增长趋势</h3>
          <div style={{ marginTop: '15px', display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
            {stats.users.growth_7d.map((day, index) => {
              const maxCount = Math.max(...stats.users.growth_7d.map(d => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 150 : 0;
              
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '30px',
                      background: '#007bff',
                      borderRadius: '4px 4px 0 0',
                      height: `${height}px`
                    }}
                  />
                  <div style={{ marginTop: '5px', fontSize: '12px', textAlign: 'center' }}>
                    {new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
                    {day.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}