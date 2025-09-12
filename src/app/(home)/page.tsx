'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import HomePageContent from "@/components/HomePageContent"

export default function HomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('=== Session Info ===')
    console.log('Status:', status)
    console.log('Session:', session)
    console.log('User:', session?.user)
    console.log('==================')
  }, [session, status])

  return <HomePageContent />
}