"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Bell, Download, Camera, Check, X } from "lucide-react"

export function AppPermissions() {
  const [showDialog, setShowDialog] = useState(false)
  const [permissions, setPermissions] = useState({
    notifications: false,
    install: false,
    camera: false,
  })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkPermissions()
  }, [])

  async function checkPermissions() {
    const hasAskedBefore = localStorage.getItem("permissions-asked")
    
    if (hasAskedBefore) {
      setChecking(false)
      return
    }

    // Check notification permission
    const notificationPermission = "Notification" in window 
      ? Notification.permission === "granted"
      : false

    // Check if app is installed (runs in standalone mode)
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    setPermissions({
      notifications: notificationPermission,
      install: isInstalled,
      camera: false, // Camera permission is requested on-demand
    })

    // Show dialog if any permission is missing
    if (!notificationPermission || !isInstalled) {
      setShowDialog(true)
    }

    setChecking(false)
  }

  async function requestNotifications() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setPermissions(prev => ({ ...prev, notifications: permission === "granted" }))
    }
  }

  function showInstallInstructions() {
    // Different instructions for different browsers
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      alert("To install:\n1. Tap the Share button (box with arrow)\n2. Scroll and tap 'Add to Home Screen'\n3. Tap 'Add'")
    } else if (isAndroid) {
      alert("To install:\n1. Tap the menu (⋮)\n2. Tap 'Add to Home Screen' or 'Install app'\n3. Tap 'Add' or 'Install'")
    } else {
      alert("To install:\n1. Look for the install icon in your address bar\n2. Click 'Install' or 'Add to Home Screen'")
    }
  }

  function handleContinue() {
    localStorage.setItem("permissions-asked", "true")
    setShowDialog(false)
  }

  async function requestAll() {
    await requestNotifications()
    showInstallInstructions()
  }

  if (checking) return null

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-navy">
            Welcome to QWEN Restaurant! 🍽️
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-gray-600 mb-4">
            For the best experience, we recommend enabling these features:
          </p>

          {/* Notifications */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              permissions.notifications ? "bg-green-100" : "bg-gray-100"
            }`}>
              {permissions.notifications ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Bell className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy">Notifications</h3>
              <p className="text-sm text-gray-600">
                Get instant updates on your order status
              </p>
              {!permissions.notifications && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={requestNotifications}
                >
                  Enable Notifications
                </Button>
              )}
            </div>
          </div>

          {/* Install App */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              permissions.install ? "bg-green-100" : "bg-gray-100"
            }`}>
              {permissions.install ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Download className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy">Install App</h3>
              <p className="text-sm text-gray-600">
                Add to home screen for quick access
              </p>
              {!permissions.install && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={showInstallInstructions}
                >
                  Show Instructions
                </Button>
              )}
            </div>
          </div>

          {/* Camera (info only) */}
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-navy">Camera Access</h3>
              <p className="text-sm text-gray-600">
                Upload payment proof when needed (requested during checkout)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            variant="gold"
            onClick={requestAll}
            className="w-full sm:w-auto"
          >
            Enable All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
