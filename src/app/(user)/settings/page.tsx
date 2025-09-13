'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    avatar: session?.user?.image || '',
    language: 'zh-CN',
    notifications: {
      email: true,
      browser: true,
      marketing: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        language: 'zh-CN',
        notifications: {
          email: true,
          browser: true,
          marketing: false
        }
      })
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        language: 'zh-CN',
        notifications: {
          email: true,
          browser: true,
          marketing: false
        }
      })
    }
  }, [session])

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ ...user })

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement actual API call to update user profile
      // await fetch('/api/user/update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      setUser({ ...formData })
      setIsEditing(false)
      setSuccess('设置已保存')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ ...user })
    setIsEditing(false)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">账户设置</h1>
        <p className="text-gray-600">管理你的个人信息和偏好设置</p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧边栏 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <nav className="space-y-1">
              <a href="#profile" className="block px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
                个人资料
              </a>
              <a href="#security" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                安全设置
              </a>
              <a href="#notifications" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                通知设置
              </a>
              <a href="#privacy" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                隐私设置
              </a>
            </nav>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 个人资料 */}
          <div id="profile" className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">个人资料</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  编辑
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </>
                    ) : '保存'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed"
                    title="功能开发中"
                  >
                    更换头像
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  语言偏好
                </label>
                {isEditing ? (
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {user.language === 'zh-CN' ? '简体中文' :
                     user.language === 'zh-TW' ? '繁體中文' :
                     user.language === 'en-US' ? 'English' : '日本語'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div id="security" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">安全设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">密码</h3>
                  <p className="text-sm text-gray-600">上次修改：3个月前</p>
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed"
                  title="功能开发中"
                >
                  修改密码
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">两步验证</h3>
                  <p className="text-sm text-gray-600">使用手机验证码增强安全性</p>
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed"
                  title="功能开发中"
                >
                  启用
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">登录设备</h3>
                  <p className="text-sm text-gray-600">当前登录：3台设备</p>
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed"
                  title="功能开发中"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div id="notifications" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">通知设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">邮件通知</h3>
                  <p className="text-sm text-gray-600">接收重要更新和账单信息</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.notifications.email}
                    onChange={(e) => setUser({
                      ...user,
                      notifications: { ...user.notifications, email: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">浏览器通知</h3>
                  <p className="text-sm text-gray-600">在浏览器中显示实时通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.notifications.browser}
                    onChange={(e) => setUser({
                      ...user,
                      notifications: { ...user.notifications, browser: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">营销邮件</h3>
                  <p className="text-sm text-gray-600">接收产品更新和优惠信息</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.notifications.marketing}
                    onChange={(e) => setUser({
                      ...user,
                      notifications: { ...user.notifications, marketing: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 危险操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 text-red-600">危险操作</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">删除账户</h3>
                  <p className="text-sm text-red-700">永久删除账户和所有数据</p>
                </div>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 opacity-50 cursor-not-allowed"
                  title="功能开发中"
                >
                  删除账户
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium">导出数据</h3>
                  <p className="text-sm text-gray-600">下载你的所有数据</p>
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed"
                  title="功能开发中"
                >
                  导出数据
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}