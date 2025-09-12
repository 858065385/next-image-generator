import Header from "@/components/Header"
import { ReactNode } from 'react'

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  )
}