"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled = (window.navigator as any).standalone || isStandalone
    
    if (isInstalled) {
      return // Don't show install prompt if already installed
    }

    // For iOS Safari, show install button after a delay
    if (ios) {
      const hasSeenPrompt = localStorage.getItem('ios-install-prompt-seen')
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowInstallButton(true)
        }, 3000) // Show after 3 seconds
      }
    }

    // For Chrome/Edge (Android and Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS install instructions
      setShowIOSInstructions(true)
      localStorage.setItem('ios-install-prompt-seen', 'true')
    } else if (deferredPrompt) {
      // Show Chrome/Edge install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowInstallButton(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowInstallButton(false)
    if (isIOS) {
      localStorage.setItem('ios-install-prompt-seen', 'true')
    }
  }

  const handleCloseInstructions = () => {
    setShowIOSInstructions(false)
  }

  if (!showInstallButton) {
    return null
  }

  return (
    <>
      {/* Install Button */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-gold max-w-sm mx-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-cream rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-dark mb-1">Install QWEN App</h3>
              <p className="text-sm text-gray-600 mb-3">
                {isIOS 
                  ? "Add to your home screen for a better experience!" 
                  : "Install our app for quick access and offline ordering!"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  className="bg-gold hover:bg-gold/90 text-dark font-semibold"
                  size="sm"
                >
                  {isIOS ? "Show Instructions" : "Install Now"}
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

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-dark">Install on iOS</h3>
              <button
                onClick={handleCloseInstructions}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    Tap the <strong>Share</strong> button 
                    <svg className="inline w-5 h-5 mx-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                    </svg>
                    at the bottom of your screen
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    Scroll and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    Tap <strong>&ldquo;Add&rdquo;</strong> in the top right corner
                  </p>
                </div>
              </div>

              <div className="bg-cream rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-600 text-center">
                  ✨ The QWEN app will appear on your home screen!
                </p>
              </div>
            </div>

            <Button
              onClick={handleCloseInstructions}
              className="w-full mt-6 bg-gold hover:bg-gold/90 text-dark font-semibold"
            >
              Got It!
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
