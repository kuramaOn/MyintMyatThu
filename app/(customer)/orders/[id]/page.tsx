"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle, Clock, Package, Truck, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order, RestaurantSettings } from "@/types"
import { formatCurrency, getStatusColor } from "@/lib/utils"
import { checkmarkVariants } from "@/lib/animations"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch("/api/settings"),
        ])

        if (orderRes.ok) {
          const orderData = await orderRes.json()
          setOrder(orderData)
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-navy mb-4">
            Order Not Found
          </h2>
          <Button variant="gold" onClick={() => router.push("/menu")}>
            Back to Menu
          </Button>
        </Card>
      </div>
    )
  }

  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Clock },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle },
    { status: "preparing", label: "Preparing", icon: Package },
    { status: "ready", label: "Ready for Pickup", icon: Truck },
    { status: "completed", label: "Completed", icon: Home },
  ]

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.orderStatus)

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <motion.path
                d="M30 50 L45 65 L70 35"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-2">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600">Thank you for your order</p>
        </motion.div>

        {/* Order ID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <p className="text-gray-600 mb-2">Order ID</p>
          <p className="text-3xl font-mono font-bold text-gold">{order.orderId}</p>
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold text-navy mb-6 text-center">
              Order Status
            </h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 md:left-0 md:top-6 md:bottom-auto md:right-0 md:h-0.5 md:w-full"></div>

              <div className="space-y-6 md:space-y-0 md:flex md:justify-between md:items-start relative">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex
                  const Icon = step.icon

                  return (
                    <div
                      key={step.status}
                      className="flex items-center gap-4 md:flex-col md:items-center md:gap-2 relative"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors ${
                          isActive
                            ? "bg-gold text-navy"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="md:text-center">
                        <p
                          className={`font-semibold text-sm ${
                            isActive ? "text-navy" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Badge className={getStatusColor(order.orderStatus)}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Customer Info */}
          <Card className="p-6">
            <h3 className="font-serif font-bold text-navy mb-4">Customer Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-semibold">{order.customer.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-semibold">{order.customer.phone}</p>
              </div>
              {order.customer.specialInstructions && (
                <div>
                  <span className="text-gray-600">Special Instructions:</span>
                  <p className="font-semibold">{order.customer.specialInstructions}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pickup Info */}
          <Card className="p-6">
            <h3 className="font-serif font-bold text-navy mb-4">Pickup Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Estimated Time:</span>
                <p className="font-semibold">15-20 minutes</p>
              </div>
              {settings && (
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-semibold">
                    {settings.restaurant.address.line1}
                    <br />
                    {settings.restaurant.address.line2}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-semibold capitalize">{order.paymentMethod}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="font-serif font-bold text-navy mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-semibold text-navy">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gold">
                    {settings && formatCurrency(
                      item.price * item.quantity,
                      settings.currency.code as any,
                      settings.currency.position as any
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-navy">Total</span>
                <span className="text-2xl font-bold text-gold">
                  {settings && formatCurrency(
                    order.total,
                    settings.currency.code as any,
                    settings.currency.position as any
                  )}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="gold"
            size="lg"
            className="rounded-full"
            onClick={() => router.push("/menu")}
          >
            Order Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
