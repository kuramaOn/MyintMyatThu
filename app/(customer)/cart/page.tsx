"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils"
import { fadeInUpVariants, itemVariants } from "@/lib/animations"
import { useState, useEffect } from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()
  const router = useRouter()
  const [currency, setCurrency] = useState<{ code: string; symbol: string; position: string }>({
    code: "JPY",
    symbol: "¥",
    position: "before",
  })

  useEffect(() => {
    async function fetchCurrency() {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        setCurrency(data.currency)
      } catch (error) {
        console.error("Error fetching currency:", error)
      }
    }
    fetchCurrency()
  }, [])

  // Poll for settings updates every 60 seconds
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsRes = await fetch("/api/settings", { cache: "no-store" })
        const settingsData = await settingsRes.json()
        setCurrency(settingsData.currency)
      } catch (error) {
        console.error("Error polling settings:", error)
      }
    }

    const interval = setInterval(fetchSettings, 60000) // Poll every 60 seconds

    return () => clearInterval(interval)
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-navy mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Start adding some delicious items to your cart!
          </p>
          <Button
            variant="gold"
            size="lg"
            className="rounded-full"
            onClick={() => router.push("/menu")}
          >
            Browse Menu
          </Button>
        </motion.div>
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
            Shopping Cart
          </h1>
          <p className="text-gray-600">{itemCount} items in your cart</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id?.toString()}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                custom={index}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-navy text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item._id!.toString())}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border-2 border-gold rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item._id!.toString(), item.quantity - 1)
                            }
                            className="px-3 py-1 hover:bg-gold/10 transition-colors"
                          >
                            <Minus className="h-4 w-4 text-gold" />
                          </button>
                          <span className="px-4 py-1 font-mono font-bold text-navy min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id!.toString(), item.quantity + 1)
                            }
                            className="px-3 py-1 hover:bg-gold/10 transition-colors"
                          >
                            <Plus className="h-4 w-4 text-gold" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-xl font-bold text-gold">
                          {formatCurrency(
                            item.price * item.quantity,
                            currency.code as any,
                            currency.position as any
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="sticky top-24"
            >
              <Card className="p-6 bg-white">
                <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">
                      {formatCurrency(total, currency.code as any, currency.position as any)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-navy">
                    <span>Total</span>
                    <span className="text-gold text-2xl">
                      {formatCurrency(total, currency.code as any, currency.position as any)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full rounded-full text-lg mb-3"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full"
                  onClick={() => router.push("/menu")}
                >
                  Continue Shopping
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
