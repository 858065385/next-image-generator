'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SubscriptionData {
  user: {
    id: string
    email: string
    name: string
  }
  subscription: {
    status: string
    plan_name: string
    current_period_end: string
    cancel_at_period_end?: boolean
  }
  credit_usage: {
    credits_total: number
    credits_used: number
    credits_remain: number
  }
}

interface PaymentHistory {
  id: string
  product_name: string
  amount: number
  status: string
  created_at: string
  invoice_url?: string
}

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<SubscriptionData | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (session) {
      fetchUserData()
      fetchPaymentHistory()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/get_user_subscription_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session?.user?.email })
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('获取订阅信息失败')
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/credit/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: session?.user?.email,
          type: 'purchase' // Only show payment history
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform credit history to payment history format
        const payments = data.data
          ?.filter((item: any) => item.credit > 0 && !item.effect_name)
          ?.map((item: any) => ({
            id: item.id,
            product_name: '积分充值',
            amount: item.credit * 0.15, // Assuming $0.15 per credit
            status: 'paid',
            created_at: item.created_at
          })) || []
        setPaymentHistory(payments)
      }
    } catch (err) {
      console.error('Error fetching payment history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      // TODO: Implement actual cancellation logic via Creem API
      // For now, just refresh the data
      await fetchUserData()
    } catch (err) {
      console.error('Error cancelling subscription:', err)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      // TODO: Implement reactivation logic via Creem API
      // For now, just refresh the data
      await fetchUserData()
    } catch (err) {
      console.error('Error reactivating subscription:', err)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <a href="/signin" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            登录
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
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
          {userData?.subscription?.status === 'active' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {userData.subscription.plan_name || '专业版'}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userData.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData.subscription.status === 'active' ? '活跃' : '已过期'}
                  </span>
                  {userData.subscription.cancel_at_period_end && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      将于 {new Date(userData.subscription.current_period_end).toLocaleDateString('zh-CN')} 取消
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  $15.90
                </div>
                <div className="text-sm text-gray-500">/月</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">本月积分</p>
                <p className="text-xl font-bold text-blue-600">{userData?.credit_usage?.credits_total || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">已使用</p>
                <p className="text-xl font-bold text-gray-900">{userData?.credit_usage?.credits_used || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">剩余</p>
                <p className="text-xl font-bold text-green-600">
                  {userData?.credit_usage?.credits_remain || 0}
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              {userData.subscription.cancel_at_period_end ? (
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
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">你当前没有活跃的订阅</p>
            <a href="/pricing" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block">
              查看订阅计划
            </a>
          </div>
        )}
        </div>
      </div>

      {/* 订阅计划 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">更改订阅计划</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = userData?.subscription?.status === 'active' && (
              (plan.id === 'pro_monthly' && !userData.subscription.plan_name?.includes('yearly')) ||
              (plan.id === 'pro_yearly' && userData.subscription.plan_name?.includes('yearly')) ||
              (plan.id === 'free' && userData.subscription.status !== 'active')
            )
            
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow p-6 border-2 relative ${
                  isCurrentPlan
                    ? 'border-green-500'
                    : plan.popular
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                      当前计划
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

                {plan.id === 'free' && isCurrentPlan && (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    当前计划
                  </button>
                )}
                {plan.id === 'free' && !isCurrentPlan && (
                  <a
                    href="/api/creem/checkout?plan=free"
                    className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 block text-center"
                  >
                    降级到免费版
                  </a>
                )}
                {plan.id !== 'free' && isCurrentPlan && (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    当前计划
                  </button>
                )}
                {plan.id !== 'free' && !isCurrentPlan && (
                  <a
                    href={`/api/creem/checkout?plan=${plan.id}`}
                    className={`w-full py-3 rounded-lg font-medium ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } block text-center`}
                  >
                    立即升级
                  </a>
                )}
              </div>
            )
          })}
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
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'paid' ? '已支付' : '待支付'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {payment.invoice_url ? (
                        <a 
                          href={payment.invoice_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          查看发票
                        </a>
                      ) : (
                        <span className="text-gray-400">暂无发票</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    暂无账单记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}