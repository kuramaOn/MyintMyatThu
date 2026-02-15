"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  subscribeToPushNotifications, 
  isPushNotificationSupported,
  isPushNotificationSubscribed 
} from "@/lib/push-notifications"

export function NotificationPermission() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isPushNotificationSupported()
      setIsSupported(supported)

      if (supported) {
        const subscribed = await isPushNotificationSubscribed()
        setIsSubscribed(subscribed)

        // Show prompt if not subscribed and user hasn't dismissed it
        const hasSeenPrompt = localStorage.getItem('notification-prompt-seen')
        if (!subscribed && !hasSeenPrompt) {
          // Show after 5 seconds
          setTimeout(() => {
            setShowPrompt(true)
          }, 5000)
        }
      }
    }

    checkSupport()
  }, [])

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      const subscription = await subscribeToPushNotifications()
      if (subscription) {
        setIsSubscribed(true)
        setShowPrompt(false)
        localStorage.setItem('notification-prompt-seen', 'true')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('notification-prompt-seen', 'true')
  }

  if (!isSupported || isSubscribed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-gold max-w-sm mx-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-dark mb-1">
              Stay Updated! 🔔
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get instant notifications when your order status changes
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="bg-gold hover:bg-gold/90 text-dark font-semibold"
                size="sm"
              >
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="border-gray-300"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
