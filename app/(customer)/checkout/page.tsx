"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, CreditCard, MessageCircle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"
import { fadeInUpVariants, itemVariants } from "@/lib/animations"
import { RestaurantSettings, PaymentMethod } from "@/types"
import { openMessengerWithMessage } from "@/lib/messenger-helper"
import { MessengerPrompt, useMessengerPrompt } from "@/components/shared/messenger-prompt"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { addToast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  // Messenger prompt state
  const [showMessengerPrompt, setShowMessengerPrompt] = useState(false)
  const [pendingMessengerData, setPendingMessengerData] = useState<{ username: string; message: string; orderId?: string } | null>(null)
  const { shouldPrompt } = useMessengerPrompt()

  // Handler for Messenger prompt confirmation
  const handleMessengerPromptConfirm = () => {
    if (pendingMessengerData) {
      openMessengerWithMessage(pendingMessengerData.username, pendingMessengerData.message);
      setPendingMessengerData(null);
      // Now redirect to order page after opening Messenger
      if (pendingMessengerData.orderId) {
        setTimeout(() => {
          router.push(`/orders/${pendingMessengerData.orderId}`);
        }, 500); // Small delay to ensure Messenger opens
      }
    }
  }

  // Handler for Messenger prompt cancel
  const handleMessengerPromptCancel = () => {
    // User cancelled, but order is still created, redirect them anyway
    if (pendingMessengerData?.orderId) {
      router.push(`/orders/${pendingMessengerData.orderId}`);
    }
    setPendingMessengerData(null);
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/menu")
    }

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }
    fetchSettings()
  }, [items, router])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitOrder = async () => {
    setLoading(true)

    try {
      let paymentProofUrl = ""

      // Upload payment screenshot if PayPay
      if (paymentMethod === "paypay" && paymentScreenshot) {
        const formData = new FormData()
        formData.append("file", paymentScreenshot)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload screenshot")
        }

        const uploadData = await uploadRes.json()
        paymentProofUrl = uploadData.url
      }

      // Create order
      const orderData = {
        customer: {
          name: customerName,
          phone: customerPhone,
          specialInstructions: specialInstructions || undefined,
        },
        items: items.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        currency: settings?.currency.code || "JPY",
        paymentMethod,
        paymentProof: paymentProofUrl || undefined,
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        throw new Error("Failed to create order")
      }

      const order = await res.json()

      // Clear cart
      clearCart()

      // Handle Messenger payment differently - show prompt before redirect
      if (paymentMethod === "messenger") {
        // Create message with order details
        const orderSummary = `🍽️ New Order - ${order.orderId}

👤 Customer: ${customerName}
📱 Phone: ${customerPhone}

📋 Order Items:
${items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity, settings?.currency.code || "JPY", settings?.currency.position)}`).join('\n')}

💰 Total: ${formatCurrency(total, settings?.currency.code || "JPY", settings?.currency.position)}

${specialInstructions ? `📝 Special Instructions:\n${specialInstructions}\n` : ''}
⏰ Order Time: ${new Date().toLocaleString()}`;

        // Open Messenger - show prompt if needed
        if (settings?.messenger.username) {
          if (shouldPrompt) {
            // Show permission prompt first - don't redirect yet
            setPendingMessengerData({
              username: settings.messenger.username,
              message: orderSummary,
              orderId: order.orderId
            });
            setShowMessengerPrompt(true);
            // Success message
            addToast({
              title: "Order placed!",
              description: "Opening Messenger to complete payment...",
              type: "success",
            });
            return; // Don't redirect yet, wait for user to interact with prompt
          } else {
            // User previously dismissed prompt, open directly
            openMessengerWithMessage(settings.messenger.username, orderSummary);
          }
        }
      }

      // Redirect to confirmation (for non-Messenger or after Messenger opened)
      router.push(`/orders/${order.orderId}`)

      addToast({
        title: "Order placed!",
        description: "Your order has been submitted successfully",
        type: "success",
      })
    } catch (error) {
      console.error("Error submitting order:", error)
      addToast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-gold" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-gold text-navy" : "bg-gray-300"}`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">Details</span>
            </div>
            <div className={`h-0.5 w-12 ${step >= 2 ? "bg-gold" : "bg-gray-300"}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-gold" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-gold text-navy" : "bg-gray-300"}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6 md:p-8">
                  <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                    Customer Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-navy mb-2 block">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="border-2 focus:border-gold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-navy mb-2 block">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+95 9 123 456 789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="border-2 focus:border-gold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions" className="text-navy mb-2 block">
                        Special Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder="Any special requests..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="border-2 focus:border-gold min-h-[100px]"
                      />
                    </div>

                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full rounded-full"
                      onClick={() => setStep(2)}
                      disabled={!customerName || !customerPhone}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6 md:p-8">
                  <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                    Select Payment Method
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {/* PayPay Option */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod("paypay")}
                      className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                        paymentMethod === "paypay"
                          ? "border-gold bg-gold/5"
                          : "border-gray-200 hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <CreditCard className="h-8 w-8 text-gold" />
                        {paymentMethod === "paypay" && (
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <Check className="h-4 w-4 text-navy" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-navy mb-2">PayPay</h3>
                      <p className="text-sm text-gray-600">
                        Pay now with QR code and upload screenshot
                      </p>
                    </motion.div>

                    {/* Messenger Option */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod("messenger")}
                      className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                        paymentMethod === "messenger"
                          ? "border-gold bg-gold/5"
                          : "border-gray-200 hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <MessageCircle className="h-8 w-8 text-gold" />
                        {paymentMethod === "messenger" && (
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <Check className="h-4 w-4 text-navy" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-navy mb-2">Messenger</h3>
                      <p className="text-sm text-gray-600">
                        Complete order via Facebook Messenger
                      </p>
                    </motion.div>
                  </div>

                  {/* PayPay Details */}
                  {paymentMethod === "paypay" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t pt-6"
                    >
                      <h3 className="font-bold text-navy mb-4">PayPay Payment</h3>
                      
                      {settings.paypay.qrCodeUrl && (
                        <div className="mb-6 text-center">
                          <p className="text-sm text-gray-600 mb-3">
                            Scan this QR code to pay
                          </p>
                          <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                            <Image
                              src={settings.paypay.qrCodeUrl}
                              alt="PayPay QR Code"
                              width={200}
                              height={200}
                            />
                          </div>
                          <p className="text-lg font-bold text-gold mt-3">
                            Amount: {formatCurrency(total, settings.currency.code as any, settings.currency.position as any)}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label className="text-navy mb-2 block">
                          Upload Payment Screenshot <span className="text-red-500">*</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="screenshot-upload"
                          />
                          <label htmlFor="screenshot-upload" className="cursor-pointer">
                            {screenshotPreview ? (
                              <div className="space-y-3">
                                <Image
                                  src={screenshotPreview}
                                  alt="Screenshot preview"
                                  width={200}
                                  height={200}
                                  className="mx-auto rounded-lg"
                                />
                                <Button type="button" variant="outline" size="sm">
                                  Change Image
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Click to upload screenshot</p>
                                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Messenger Details */}
                  {paymentMethod === "messenger" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t pt-6"
                    >
                      <h3 className="font-bold text-navy mb-4">Messenger Payment</h3>
                      <p className="text-gray-600 mb-4">
                        After placing your order, you&apos;ll be redirected to Messenger to complete payment.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Complete the payment conversation in Messenger to confirm your order.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      className="flex-1 rounded-full"
                      onClick={handleSubmitOrder}
                      disabled={
                        !paymentMethod ||
                        (paymentMethod === "paypay" && !paymentScreenshot) ||
                        loading
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="sticky top-24"
            >
              <Card className="p-6">
                <h2 className="text-xl font-serif font-bold text-navy mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id?.toString()} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity, settings.currency.code as any, settings.currency.position as any)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-navy">
                    <span>Total</span>
                    <span className="text-gold text-2xl">
                      {formatCurrency(total, settings.currency.code as any, settings.currency.position as any)}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Messenger Permission Prompt */}
      <MessengerPrompt
        isOpen={showMessengerPrompt}
        onClose={() => {
          setShowMessengerPrompt(false);
          handleMessengerPromptCancel();
        }}
        onConfirm={handleMessengerPromptConfirm}
        username={pendingMessengerData?.username || ''}
        message={pendingMessengerData?.message || ''}
      />
    </div>
  )
}
