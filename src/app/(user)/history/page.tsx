'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface HistoryItem {
  id: string
  effect_name: string
  prompt: string
  output_url: string
  status: string
  credit: number
  created_at: string
  running_time?: number
}

export default function HistoryPage() {
  const { data: session } = useSession()
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    date: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  useEffect(() => {
    if (session) {
      fetchHistory()
    }
  }, [session, filters, pagination.page])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/effect_result/list_by_user_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: session?.user?.email,
          page: pagination.page,
          limit: pagination.limit
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setHistoryItems(data.data || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total_items || 0
        }))
      }
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = historyItems.filter(item => {
    const typeMatch = filters.type === 'all' || 
      (filters.type === 'image' && item.effect_name.includes('Flux')) ||
      (filters.type === 'video' && item.effect_name.includes('Kling'))
    
    const statusMatch = filters.status === 'all' || item.status === filters.status
    
    return typeMatch && statusMatch
  })

  const handleRetry = async (id: string) => {
    // 实现重试逻辑
    console.log('Retry generation:', id)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-gray-600">查看你的所有创作历史</p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <select 
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="image">图像</option>
            <option value="video">视频</option>
          </select>
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="completed">已完成</option>
            <option value="processing">处理中</option>
            <option value="failed">失败</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="选择日期"
          />
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.effect_name.includes('Flux') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.effect_name.includes('Flux') ? '图像' : '视频'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'completed' ? '已完成' : 
                       item.status === 'processing' ? '处理中' : '失败'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-2">{item.prompt}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>消耗积分: {item.credit}</span>
                    {item.running_time && (
                      <span>耗时: {item.running_time}s</span>
                    )}
                    {item.status === 'failed' && (
                      <button 
                        onClick={() => handleRetry(item.id)}
                        className="text-blue-600 hover:underline"
                      >
                        重新生成
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {item.status === 'completed' && item.output_url && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={item.output_url} 
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              {historyItems.length === 0 ? '还没有创作记录，快去生成你的第一个作品吧！' : '没有符合条件的记录'}
            </p>
            {historyItems.length === 0 && (
              <a href="/generate" className="text-blue-600 hover:underline mt-2 inline-block">
                开始创作 →
              </a>
            )}
          </div>
        )}
      </div>

      {/* 分页 */}
      {pagination.total > pagination.limit && (
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
              .slice(Math.max(0, pagination.page - 2), Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 1))
              .map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.page 
                      ? 'bg-blue-500 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Math.ceil(pagination.total / pagination.limit), prev.page + 1) }))}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}