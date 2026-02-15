"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RestaurantSettings } from "@/types"

export function Header() {
  const { itemCount } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" })
        const data = await res.json()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }
    fetchSettings()
  }, [])

  // Poll for settings updates every 60 seconds
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsRes = await fetch("/api/settings", { cache: "no-store" })
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
      } catch (error) {
        console.error("Error polling settings:", error)
      }
    }

    const interval = setInterval(fetchSettings, 60000) // Poll every 60 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/menu" className="flex items-center">
            <h1 className="text-3xl font-serif font-bold text-gold">
              {settings?.restaurant?.name || "QWEN"}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/menu"
              className="text-navy hover:text-gold transition-colors font-medium"
            >
              Menu
            </Link>
            <Button variant="ghost" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-gold text-navy">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </nav>

          {/* Mobile Cart Button - Always Visible */}
          <Link href="/cart" className="md:hidden relative">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="h-6 w-6 text-navy" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-navy text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

      </div>
    </motion.header>
  )
}
