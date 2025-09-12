'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

interface HeaderProps {
  showUserActions?: boolean
  username?: string
}

export default function Header({ showUserActions = true, username }: HeaderProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('=== Header Session Debug ===')
    console.log('Current Path:', pathname)
    console.log('Session Status:', status)
    console.log('Session Data:', session)
    console.log('Username from props:', username)
    console.log('Session User:', session?.user)
    
    // 查看 cookie 过期时间
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('next-auth.session-token='));
      console.log('Session Cookie:', sessionCookie);
    }
    
    console.log('========================')
  }, [session, status, pathname, username])

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl">
            AI 图像生成器
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/features" 
              className={`hover:text-blue-600 ${pathname === '/features' ? 'text-blue-600 font-medium' : ''}`}
            >
              功能
            </Link>
            <Link 
              href="/pricing" 
              className={`hover:text-blue-600 ${pathname === '/pricing' ? 'text-blue-600 font-medium' : ''}`}
            >
              定价
            </Link>
            <Link 
              href="/generate" 
              className={`hover:text-blue-600 ${pathname.startsWith('/generate') || pathname.startsWith('/img-to-video') ? 'text-blue-600 font-medium' : ''}`}
            >
              开始创作
            </Link>
          </nav>
        </div>
        
        {showUserActions && (
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-600">
                  欢迎, {session.user.name || session.user.email?.split('@')[0]}
                </span>
                <Link 
                  href="/settings" 
                  className="text-gray-600 hover:text-blue-600"
                >
                  设置
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-gray-600 hover:text-blue-600">
                  登录
                </Link>
                <Link 
                  href="/generate" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  免费试用
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}