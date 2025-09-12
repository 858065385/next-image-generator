import Header from "@/components/Header"
import { ReactNode } from 'react'

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}