"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface MessengerPromptProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  username: string
  message: string
}

export function MessengerPrompt({ isOpen, onClose, onConfirm, username, message }: MessengerPromptProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect if user is on mobile
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('messenger-prompt-dismissed', 'true')
    }
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    if (dontShowAgain) {
      localStorage.setItem('messenger-prompt-dismissed', 'true')
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span>Open in Messenger?</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-4">
            {isMobile 
              ? "Would you like to open the Messenger app to complete your order? This provides a better mobile experience."
              : "Would you like to open Messenger to complete your order?"
            }
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">What happens next?</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {isMobile ? "The Messenger app will open" : "Messenger will open in a new tab"}</li>
                  <li>• Your order details will be pre-filled</li>
                  <li>• Send the message to complete your order</li>
                  <li>• You can return to this page anytime</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="dont-show-again" className="text-gray-600 cursor-pointer">
              Don&apos;t show this again
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Open Messenger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook to check if prompt should be shown
export function useMessengerPrompt() {
  const [shouldPrompt, setShouldPrompt] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem('messenger-prompt-dismissed')
    setShouldPrompt(!dismissed)
  }, [])

  const resetPrompt = () => {
    localStorage.removeItem('messenger-prompt-dismissed')
    setShouldPrompt(true)
  }

  return { shouldPrompt, resetPrompt }
}
