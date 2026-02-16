"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Cloud, CloudOff } from "lucide-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Hide the "back online" message after 3 seconds
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
      // Keep showing offline message until back online
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div
            className={`
              flex items-center gap-3 px-6 py-3 rounded-full shadow-lg
              ${isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
              }
            `}
          >
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5" />
                <span className="font-semibold">Back Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <span className="font-semibold">You&apos;re Offline</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ConnectionStatusProps {
  isConnected: boolean
  label?: string
}

export function ConnectionStatus({ isConnected, label = "Server" }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Cloud className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 font-medium">{label} Connected</span>
        </>
      ) : (
        <>
          <CloudOff className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 font-medium">{label} Disconnected</span>
        </>
      )}
    </div>
  )
}
