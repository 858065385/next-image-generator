'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: '仪表盘', href: '/dashboard', icon: '📊' },
  { name: '历史记录', href: '/history', icon: '📚' },
  { name: '积分管理', href: '/credits', icon: '💎' },
  { name: '订阅管理', href: '/subscription', icon: '💳' },
  { name: '账户设置', href: '/settings', icon: '⚙️' },
]

export default function UserSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6">
        <nav>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">需要帮助？</h3>
          <p className="text-sm text-blue-700 mb-3">
            查看文档或联系客服
          </p>
          <a 
            href="/help" 
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            查看帮助 →
          </a>
        </div>
      </div>
    </div>
  )
}