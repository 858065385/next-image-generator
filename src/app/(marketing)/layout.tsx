import Header from "@/components/Header"
import { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* 页面内容 */}
      <main>{children}</main>

      {/* 简洁的页脚 */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 AI 图像生成器. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="/privacy" className="hover:text-gray-900">隐私政策</a>
              <a href="/terms" className="hover:text-gray-900">服务条款</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}