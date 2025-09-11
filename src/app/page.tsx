'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
        AI Image Video Generator
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '2rem' }}>
        基于 AI 的图像和视频生成服务，支持订阅模式和积分系统
      </p>
      
      {/* 用户功能入口 */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>
          🚀 用户功能
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>用户仪表盘</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              查看积分、订阅状态、生成记录等
            </p>
          </Link>
          
          <Link
            href="/test-payment"
            target="_blank"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>测试支付</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              订阅服务，获取积分额度
            </p>
          </Link>
          
          <Link
            href="/test-auth"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>测试认证</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              测试登录/退出功能
            </p>
          </Link>
        </div>
      </div>
      
      {/* 其他功能入口 */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>
          💳 支付与订阅
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link
            href="/test-payment"
            target="_blank"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>测试支付</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              订阅服务，获取积分额度
            </p>
          </Link>
          
          <Link
            href="/pricing"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>订阅计划</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              查看可用的订阅计划和价格
            </p>
          </Link>
        </div>
      </div>
      
      {/* 管理功能入口 */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>
          ⚙️ 管理功能
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link
            href="/admin-enhanced"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👮</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>管理后台</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              用户管理、积分调整、订阅管理
            </p>
          </Link>
          
          <Link
            href="/admin"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>基础管理</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              简化版的管理界面
            </p>
          </Link>
        </div>
      </div>
      
      {/* API 文档 */}
      <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem' }}>
        <h2 style={{ color: '#0369a1', marginBottom: '1rem' }}>📚 API 文档</h2>
        <p style={{ marginBottom: '1rem', color: '#0c4a6e' }}>
          本项目提供完整的 RESTful API，支持第三方集成。查看详细的 API 文档：
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/API_DOCS.md"
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#0369a1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            API 接口文档
          </Link>
          <Link
            href="/PAYMENT_FLOW.md"
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#059669',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            支付流程文档
          </Link>
          <Link
            href="/ADMIN_PANEL_PLAN.md"
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            管理后台规划
          </Link>
        </div>
      </div>
      
      {/* 快速开始 */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
        <h2 style={{ color: '#475569', marginBottom: '1rem' }}>🚀 快速开始</h2>
        <ol style={{ color: '#64748b', lineHeight: '1.8' }}>
          <li>使用 Google 账号登录系统</li>
          <li>查看订阅计划并选择合适的套餐</li>
          <li>完成支付获取积分</li>
          <li>开始使用 AI 图像/视频生成功能</li>
        </ol>
      </div>
    </div>
  )
}