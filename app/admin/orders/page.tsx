"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Order, RestaurantSettings } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/loading"
import { useToast } from "@/components/ui/toast"
import { Clock, CheckCircle, Package, XCircle } from "lucide-react"
import { requestNotificationPermission, showNotification, playNotificationSound } from "@/lib/notifications"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [currency, setCurrency] = useState({ code: "JPY", symbol: "¥", position: "before" })
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const { addToast } = useToast()
  
  // Track previous order count to detect new orders
  const previousOrderCountRef = useRef<number>(0)
  const isInitialLoadRef = useRef<boolean>(true)

  useEffect(() => {
    fetchOrders()
    fetchSettings()
    
    // Request notification permission on mount
    requestNotificationPermission()

    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      
      // Detect new orders
      const pendingOrders = data.filter((order: Order) => order.orderStatus === "pending")
      const currentPendingCount = pendingOrders.length
      
      if (!isInitialLoadRef.current && currentPendingCount > previousOrderCountRef.current) {
        // New order(s) detected!
        const newOrdersCount = currentPendingCount - previousOrderCountRef.current
        const latestOrder = pendingOrders[0] // Most recent order
        
        handleNewOrderNotification(latestOrder, newOrdersCount)
      }
      
      previousOrderCountRef.current = currentPendingCount
      isInitialLoadRef.current = false
      
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }
  
  function handleNewOrderNotification(order: Order, count: number) {
    if (!settings) return
    
    const message = count === 1 
      ? `New order from ${order.customer.name}` 
      : `${count} new orders received!`
    
    // Play sound if enabled
    if (settings.notifications.sound) {
      playNotificationSound()
    }
    
    // Show desktop notification if enabled
    if (settings.notifications.desktop) {
      showNotification("🔔 New Order!", {
        body: message,
        tag: "new-order",
        requireInteraction: false,
      })
    }
    
    // Always show toast as fallback
    addToast({
      title: "New Order Received!",
      description: message,
      type: "success",
    })
  }

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setCurrency(data.currency)
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status }),
      })

      if (!res.ok) throw new Error("Failed to update order")

      addToast({
        title: "Success",
        description: `Order updated to ${status}`,
        type: "success",
      })

      fetchOrders()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update order",
        type: "error",
      })
    }
  }

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.orderStatus === filter)

  const stats = {
    pending: orders.filter(o => o.orderStatus === "pending").length,
    preparing: orders.filter(o => o.orderStatus === "preparing").length,
    ready: orders.filter(o => o.orderStatus === "ready").length,
    completed: orders.filter(o => o.orderStatus === "completed").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold text-navy mb-2">Orders</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.preparing}</p>
              <p className="text-sm text-gray-600">Preparing</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              <p className="text-sm text-gray-600">Ready</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "preparing", "ready", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "gold" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-gray-500">No orders found</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order._id?.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-1">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    className={`capitalize ${
                      order.orderStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.orderStatus === "preparing"
                        ? "bg-purple-100 text-purple-800"
                        : order.orderStatus === "ready"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.orderStatus}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-sm text-gray-600">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-semibold capitalize">{order.paymentMethod}</p>
                    <p className="text-lg font-bold text-gold">
                      {formatCurrency(order.total, currency.code as any, currency.position as any)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.price * item.quantity, currency.code as any, currency.position as any)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {order.orderStatus === "pending" && (
                    <>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => updateOrderStatus(order._id!.toString(), "preparing")}
                      >
                        Start Preparing
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus(order._id!.toString(), "cancelled")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {order.orderStatus === "preparing" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => updateOrderStatus(order._id!.toString(), "ready")}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.orderStatus === "ready" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => updateOrderStatus(order._id!.toString(), "completed")}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
