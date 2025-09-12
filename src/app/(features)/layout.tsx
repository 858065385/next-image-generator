'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from "@/components/Header"

const features = [
  { name: '文字生成图像', href: '/generate', description: '输入描述，AI 创造图像', icon: '🎨' },
  { name: '图像生成视频', href: '/img-to-video', description: '图片转动态视频', icon: '🎬' },
]

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={session?.user?.name} showUserActions={!!session} />
      
      <div className="flex">
        {/* 功能导航侧边栏 */}
        <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">AI 创作工具</h2>
            <nav className="space-y-2">
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === feature.href
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{feature.icon}</span>
                  <div>
                    <div>{feature.name}</div>
                    <div className="text-xs text-gray-500 font-normal">{feature.description}</div>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">需要更多积分？</h3>
              <p className="text-sm text-blue-700 mb-3">
                购买积分包，解锁更多创作可能
              </p>
              <Link 
                href="/pricing" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                查看定价方案 →
              </Link>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}