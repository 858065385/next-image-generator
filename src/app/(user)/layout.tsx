import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Header from "@/components/Header"
import UserSidebar from '@/components/user/UserSidebar'
import { ReactNode } from 'react'

export default async function UserLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={session.user.name} />
      
      <div className="flex">
        {/* 侧边栏 */}
        <UserSidebar />
        
        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}