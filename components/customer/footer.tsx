"use client"

import { useState, useEffect } from "react"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { RestaurantSettings } from "@/types"

export function Footer() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

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

  // Poll for settings updates every 10 seconds for faster updates
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

    const interval = setInterval(fetchSettings, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Default values while loading
  const restaurantInfo = settings?.restaurant || {
    name: "QWEN",
    phone: "+81 3-1234-5678",
    address: {
      line1: "123 Luxury Street",
      line2: "Tokyo, Shibuya 150-0001"
    },
    hours: {
      open: "8:00 AM",
      close: "8:00 PM"
    }
  }

  const socialLinks = settings?.theme?.socialLinks || {
    facebook: "https://facebook.com/qwenrestaurant",
    instagram: "https://instagram.com/qwenrestaurant",
    twitter: "",
    whatsapp: ""
  }

  return (
    <footer className="bg-navy text-cream py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-gold mb-4">
              {restaurantInfo.name || "QWEN"}
            </h2>
            <p className="text-cream/90">
              {settings?.theme?.footerText || "Experience luxury dining at its finest. Crafted with passion, served with elegance."}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <address className="text-cream/90 not-italic">
                  {restaurantInfo.address.line1}<br />
                  {restaurantInfo.address.line2}
                </address>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`tel:${restaurantInfo.phone.replace(/\s/g, '')}`}
                  className="text-cream/90 hover:text-gold transition-colors focus-visible-ring rounded"
                >
                  {restaurantInfo.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gold">Opening Hours</h3>
            <p className="text-cream/90 mb-6">
              Monday - Sunday<br />
              {restaurantInfo.hours.open} - {restaurantInfo.hours.close}
            </p>
            <div className="flex gap-4">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors focus-visible-ring rounded-full p-1"
                  aria-label="Visit our Facebook page"
                >
                  <Facebook className="h-6 w-6" aria-hidden="true" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors focus-visible-ring rounded-full p-1"
                  aria-label="Visit our Instagram page"
                >
                  <Instagram className="h-6 w-6" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-cream/70 text-sm">
          <p>&copy; {new Date().getFullYear()} {restaurantInfo.name || "QWEN Restaurant"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
