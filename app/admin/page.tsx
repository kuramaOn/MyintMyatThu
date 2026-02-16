"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Clock, 
  Package, 
  CheckCircle, 
  TrendingUp,
  ShoppingBag,
  CreditCard
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats, Order, RestaurantSettings } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { containerVariants, itemVariants } from "@/lib/animations"
import { LoadingSpinner } from "@/components/shared/loading"
import { requestNotificationPermission, showNotification, playNotificationSound } from "@/lib/notifications"
import { useToast } from "@/components/ui/toast"
import { useOrderStream } from "@/lib/use-order-stream"
import { debugNotificationSetup } from "@/lib/debug-notifications"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState({ code: "JPY", symbol: "¥", position: "before" })
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  
  const { addToast } = useToast()

  // Debug notification setup on mount
  useEffect(() => {
    debugNotificationSetup();
  }, []);

  // Real-time order stream
  useOrderStream((event) => {
    if (event.type === 'new-order') {
      // New order received - refresh data and show notification
      fetchData();
      handleNewOrderNotification(event.order);
    } else if (event.type === 'order-update') {
      // Order status updated - refresh data
      fetchData();
    }
  });

  async function fetchData() {
    try {
      const [statsRes, ordersRes, settingsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/orders"),
        fetch("/api/settings"),
      ])

      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()
      const settingsData = await settingsRes.json()

      setStats(statsData)
      setRecentOrders(ordersData.slice(0, 10))
      setCurrency(settingsData.currency)
      setSettings(settingsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Request notification permission
    requestNotificationPermission()
  }, [])
  
  function handleNewOrderNotification(order: Order) {
    if (!settings) return;
    
    const message = `New order from ${order.customer.name}`;
    
    // Show in-app toast notification (always visible)
    addToast({
      title: "🔔 New Order!",
      description: message,
      type: "success",
    })
    
    // Play sound if enabled
    if (settings.notifications.sound) {
      playNotificationSound()
    }
    
    // Show browser notification if enabled
    if (settings.notifications.desktop) {
      showNotification("🔔 New Order!", {
        body: message,
        tag: "new-order-dashboard",
        requireInteraction: false,
      })
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  const statCards = [
    {
      title: "Pending Orders",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Preparing",
      value: stats.preparing,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ready",
      value: stats.ready,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold text-navy mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <motion.span
                      className={`text-3xl font-bold ${stat.color}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    >
                      {stat.value}
                    </motion.span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Today&apos;s Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gold mb-4">
                {formatCurrency(stats.todayRevenue, currency.code as any, currency.position as any)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">PayPay</span>
                  </div>
                  <span className="font-semibold">{stats.paymentBreakdown.paypay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Messenger</span>
                  </div>
                  <span className="font-semibold">{stats.paymentBreakdown.messenger}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items Today</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topSellingItems.length > 0 ? (
                <div className="space-y-4">
                  {stats.topSellingItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-navy">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">
                          {formatCurrency(item.revenue, currency.code as any, currency.position as any)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sales today yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                        Items
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id?.toString()} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{order.orderId}</td>
                        <td className="py-3 px-4">{order.customer.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {order.items.length} items
                        </td>
                        <td className="py-3 px-4 font-semibold text-gold">
                          {formatCurrency(order.total, currency.code as any, currency.position as any)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.orderStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.orderStatus === "preparing"
                                ? "bg-purple-100 text-purple-800"
                                : order.orderStatus === "ready"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
