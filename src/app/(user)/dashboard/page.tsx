'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserData {
  user: {
    id: string
    email: string
    name: string
  }
  subscription: {
    status: string
    plan_name: string
    current_period_end: string
  }
  credit_usage: {
    credits_total: number
    credits_used: number
    credits_remain: number
  }
}

interface GenerationHistory {
  id: string
  effect_name: string
  prompt: string
  output_url: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentWorks, setRecentWorks] = useState<GenerationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      fetchUserData()
      fetchRecentWorks()
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
      setError('获取用户信息失败')
    }
  }

  const fetchRecentWorks = async () => {
    try {
      const response = await fetch('/api/effect_result/list_by_user_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: session?.user?.email,
          page: 1,
          limit: 4
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecentWorks(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching recent works:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Link href="/signin" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            登录
          </Link>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">仪表盘</h1>
        <p className="text-gray-600">欢迎回来，{userData?.user?.name || session.user?.name}！查看你的创作统计和账户信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">当前积分</p>
              <p className="text-3xl font-bold text-blue-600">
                {userData?.credit_usage?.credits_remain || 0}
              </p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
          <div className="mt-4">
            <Link href="/credits" className="text-blue-600 text-sm hover:underline">
              管理积分 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本月生成</p>
              <p className="text-3xl font-bold text-green-600">
                {userData?.credit_usage?.credits_used || 0}
              </p>
            </div>
            <div className="text-4xl">🎨</div>
          </div>
          <div className="mt-4">
            <Link href="/history" className="text-green-600 text-sm hover:underline">
              查看历史 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">订阅状态</p>
              <p className="text-3xl font-bold text-purple-600">
                {userData?.subscription?.status === 'active' ? '专业版' : '免费版'}
              </p>
            </div>
            <div className="text-4xl">💳</div>
          </div>
          <div className="mt-4">
            <Link href="/subscription" className="text-purple-600 text-sm hover:underline">
              管理订阅 →
            </Link>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/generate"
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">🖼️</div>
            <div>
              <h3 className="font-medium">文字生成图像</h3>
              <p className="text-sm text-gray-600">输入描述，AI 为你创作图像</p>
            </div>
          </Link>
          <Link
            href="/img-to-video"
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">🎬</div>
            <div>
              <h3 className="font-medium">图像生成视频</h3>
              <p className="text-sm text-gray-600">将图片转换为动态视频</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 最近作品 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近作品</h2>
          <Link href="/history" className="text-blue-600 text-sm hover:underline">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentWorks.length > 0 ? (
            recentWorks.map((work) => (
              <div key={work.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden group">
                {work.output_url ? (
                  <img 
                    src={work.output_url} 
                    alt={work.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-4xl opacity-50">🎨</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">还没有生成作品，快去创作吧！</p>
              <Link href="/generate" className="text-blue-600 hover:underline mt-2 inline-block">
                开始创作 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}