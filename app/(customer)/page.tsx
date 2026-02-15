"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to menu page immediately
    router.replace("/menu")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-gold mb-4">QWEN</h1>
        <p className="text-cream">Redirecting to menu...</p>
      </div>
    </div>
  )
}
