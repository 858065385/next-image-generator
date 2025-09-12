'use client'

import { useState } from 'react'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState({
    plan: 'pro_monthly',
    status: 'active',
    currentPeriodEnd: '2024-02-15',
    cancelAtPeriodEnd: false,
    monthlyCredits: 100,
    usedCredits: 42
  })

  const plans = [
    {
      id: 'free',
      name: '免费体验',
      price: 0,
      credits: 10,
      features: [
        '10 个免费积分',
        '基础图像生成',
        '社区支持'
      ]
    },
    {
      id: 'pro_monthly',
      name: '月度专业版',
      price: 15.9,
      credits: 100,
      features: [
        '100 个积分/月',
        '高清图像生成',
        '图像生成视频',
        '优先处理队列',
        '邮件支持'
      ],
      popular: true
    },
    {
      id: 'pro_yearly',
      name: '年度专业版',
      price: 99,
      credits: 1200,
      features: [
        '1200 个积分/年',
        '所有月度功能',
        '节省 50% 费用',
        '专属客服',
        'API 访问'
      ]
    }
  ]

  const handleCancelSubscription = () => {
    // 取消订阅的逻辑
    setSubscription(prev => ({
      ...prev,
      cancelAtPeriodEnd: true
    }))
  }

  const handleReactivateSubscription = () => {
    // 重新激活订阅的逻辑
    setSubscription(prev => ({
      ...prev,
      cancelAtPeriodEnd: false
    }))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">订阅管理</h1>
        <p className="text-gray-600">管理你的订阅计划和账单信息</p>
      </div>

      {/* 当前订阅状态 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">当前订阅</h2>
        <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {subscription.plan === 'pro_monthly' ? '月度专业版' : '年度专业版'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status === 'active' ? '活跃' : '已过期'}
                </span>
                {subscription.cancelAtPeriodEnd && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    将于 {subscription.currentPeriodEnd} 取消
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${subscription.plan === 'pro_monthly' ? '15.90' : '99.00'}
              </div>
              <div className="text-sm text-gray-500">/月</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">本月积分</p>
              <p className="text-xl font-bold text-blue-600">{subscription.monthlyCredits}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">已使用</p>
              <p className="text-xl font-bold text-gray-900">{subscription.usedCredits}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">剩余</p>
              <p className="text-xl font-bold text-green-600">
                {subscription.monthlyCredits - subscription.usedCredits}
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            {subscription.cancelAtPeriodEnd ? (
              <button
                onClick={handleReactivateSubscription}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                重新激活订阅
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                取消订阅
              </button>
            )}
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              更新支付方式
            </button>
          </div>
        </div>
      </div>

      {/* 订阅计划 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">更改订阅计划</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow p-6 border-2 relative ${
                plan.popular && subscription.plan === plan.id
                  ? 'border-blue-500'
                  : plan.id === subscription.plan
                  ? 'border-green-500'
                  : 'border-transparent'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                    当前计划
                  </span>
                </div>
              )}
              
              {plan.id === subscription.id && !plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                    已选择
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-gray-600">/月</span>}
              </div>
              
              <div className="mb-6">
                <span className="text-blue-600 font-semibold">{plan.credits} 积分</span>
                <p className="text-sm text-gray-600">
                  {plan.price === 0 ? '一次性' : '每月'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.id === subscription.plan}
                className={`w-full py-3 rounded-lg font-medium ${
                  plan.id === subscription.plan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.id === subscription.plan ? '当前计划' : 
                 plan.price === 0 ? '降级到免费版' : '立即升级'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 账单历史 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">账单历史</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-15
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  月度专业版订阅
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已支付
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  $15.90
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button className="text-blue-600 hover:underline">
                    查看发票
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2023-12-15
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  月度专业版订阅
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已支付
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  $15.90
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button className="text-blue-600 hover:underline">
                    查看发票
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}