"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  Package,
  ShoppingCart,
  Utensils,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  HardDrive,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/shared/loading"
import { formatCurrency } from "@/lib/utils"

interface DatabaseStats {
  collections: {
    orders: {
      total: number
      pending: number
      completed: number
    }
    menuItems: {
      total: number
      available: number
      unavailable: number
    }
    categories: {
      total: number
    }
  }
  revenue: {
    total: number
    completedOrders: number
  }
  storage: {
    mongodb: {
      used: number
      limit: number
      usagePercent: number
      unit: string
    }
    vercelBlob: {
      used: number
      limit: number
      usagePercent: number
      unit: string
    }
  }
  recentActivity: {
    orders: any[]
    menuItems: any[]
  }
  lastUpdated: string
}

type ConfirmAction = {
  type: 'clear' | 'backup' | 'restore' | 'seed'
  collection?: string
  title: string
  message: string
  action: () => Promise<void>
}

export default function DatabaseControlPanel() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction | null>(null)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch("/api/database/stats", { cache: "no-store" })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      addToast({
        title: "Error",
        description: "Failed to load database statistics",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function clearCollection(collection: string) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/database/collections?collection=${collection}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to clear collection")

      const data = await res.json()
      addToast({
        title: "Success",
        description: `Cleared ${data.deletedCount} items from ${collection}`,
        type: "success",
      })

      await fetchStats()
    } catch (error) {
      addToast({
        title: "Error",
        description: `Failed to clear ${collection}`,
        type: "error",
      })
    } finally {
      setProcessing(false)
      setConfirmDialog(null)
    }
  }

  async function exportCollection(collection: string) {
    try {
      const res = await fetch(`/api/database/collections?collection=${collection}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collection}_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        title: "Success",
        description: `${collection} exported successfully`,
        type: "success",
      })
    } catch (error) {
      addToast({
        title: "Error",
        description: `Failed to export ${collection}`,
        type: "error",
      })
    }
  }

  async function backupDatabase() {
    setProcessing(true)
    try {
      const res = await fetch("/api/database/backup")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qwen_restaurant_backup_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        title: "Success",
        description: "Full database backup created",
        type: "success",
      })
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to create backup",
        type: "error",
      })
    } finally {
      setProcessing(false)
      setConfirmDialog(null)
    }
  }

  async function exportToExcel() {
    setProcessing(true)
    try {
      const res = await fetch("/api/database/export")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qwen_restaurant_export_${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast({
        title: "Success",
        description: "Database exported to Excel successfully",
        type: "success",
      })
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to export to Excel",
        type: "error",
      })
    } finally {
      setProcessing(false)
    }
  }

  async function restoreDatabase() {
    if (!restoreFile) return

    setProcessing(true)
    try {
      const fileContent = await restoreFile.text()
      const backupData = JSON.parse(fileContent)

      const res = await fetch("/api/database/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupData),
      })

      if (!res.ok) throw new Error("Failed to restore backup")

      const data = await res.json()
      addToast({
        title: "Success",
        description: `Database restored successfully`,
        type: "success",
      })

      await fetchStats()
      setRestoreFile(null)
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to restore backup. Invalid backup file.",
        type: "error",
      })
    } finally {
      setProcessing(false)
      setConfirmDialog(null)
    }
  }

  async function seedDatabase() {
    setProcessing(true)
    try {
      const res = await fetch("/api/database/seed", {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to seed database")

      const data = await res.json()
      addToast({
        title: "Success",
        description: "Database reset to seed data successfully",
        type: "success",
      })

      await fetchStats()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to seed database",
        type: "error",
      })
    } finally {
      setProcessing(false)
      setConfirmDialog(null)
    }
  }

  if (loading || !stats) {
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-navy mb-2">
              Database Control Panel
            </h1>
            <p className="text-gray-600">Manage your restaurant database and data</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={processing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Storage Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <HardDrive className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy">MongoDB Storage</h3>
                  <p className="text-sm text-gray-600">Atlas Free Tier (M0)</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {stats.storage.mongodb.used} {stats.storage.mongodb.unit} / {stats.storage.mongodb.limit} {stats.storage.mongodb.unit}
                </span>
                <span className={`font-bold ${
                  stats.storage.mongodb.usagePercent >= 90 ? 'text-red-600' :
                  stats.storage.mongodb.usagePercent >= 70 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {stats.storage.mongodb.usagePercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.storage.mongodb.usagePercent >= 90 ? 'bg-red-500' :
                    stats.storage.mongodb.usagePercent >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(stats.storage.mongodb.usagePercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Remaining: {(stats.storage.mongodb.limit - stats.storage.mongodb.used).toFixed(2)} {stats.storage.mongodb.unit}
                </span>
                {stats.storage.mongodb.usagePercent >= 90 && (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Critical
                  </span>
                )}
                {stats.storage.mongodb.usagePercent >= 70 && stats.storage.mongodb.usagePercent < 90 && (
                  <span className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Warning
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy">Vercel Blob Storage</h3>
                  <p className="text-sm text-gray-600">Images & Assets</p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {stats.storage.vercelBlob.used} {stats.storage.vercelBlob.unit} / {stats.storage.vercelBlob.limit} {stats.storage.vercelBlob.unit}
                </span>
                <span className={`font-bold ${
                  stats.storage.vercelBlob.usagePercent >= 90 ? 'text-red-600' :
                  stats.storage.vercelBlob.usagePercent >= 70 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {stats.storage.vercelBlob.usagePercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.storage.vercelBlob.usagePercent >= 90 ? 'bg-red-500' :
                    stats.storage.vercelBlob.usagePercent >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(stats.storage.vercelBlob.usagePercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Remaining: {(stats.storage.vercelBlob.limit - stats.storage.vercelBlob.used).toFixed(2)} {stats.storage.vercelBlob.unit}
                </span>
                {stats.storage.vercelBlob.usagePercent >= 90 && (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Critical
                  </span>
                )}
                {stats.storage.vercelBlob.usagePercent >= 70 && stats.storage.vercelBlob.usagePercent < 90 && (
                  <span className="flex items-center text-yellow-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Warning
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">{stats.collections.orders.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>{stats.collections.orders.pending} Pending</span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>{stats.collections.orders.completed} Done</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Utensils className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">{stats.collections.menuItems.total}</p>
                <p className="text-sm text-gray-600">Menu Items</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>{stats.collections.menuItems.available} Available</span>
              </div>
              <div className="flex items-center text-red-600">
                <XCircle className="h-3 w-3 mr-1" />
                <span>{stats.collections.menuItems.unavailable} Hidden</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">{stats.collections.categories.total}</p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold/20 rounded-full">
                <DollarSign className="h-6 w-6 text-gold" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">{formatCurrency(stats.revenue.total, "JPY")}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              From {stats.revenue.completedOrders} completed orders
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Collection Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-serif font-bold text-navy mb-4 flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6" />
              Orders Collection
            </h2>
            <p className="text-gray-600 mb-4">
              Manage customer orders and transaction history
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCollection("orders")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                onClick={() =>
                  setConfirmDialog({
                    type: 'clear',
                    collection: 'orders',
                    title: 'Clear All Orders?',
                    message: 'This will permanently delete all order data. This action cannot be undone.',
                    action: () => clearCollection('orders'),
                  })
                }
                disabled={stats.collections.orders.total === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All ({stats.collections.orders.total})
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-serif font-bold text-navy mb-4 flex items-center">
              <Utensils className="mr-2 h-6 w-6" />
              Menu Items Collection
            </h2>
            <p className="text-gray-600 mb-4">
              Manage menu items and product catalog
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCollection("menuItems")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                onClick={() =>
                  setConfirmDialog({
                    type: 'clear',
                    collection: 'menuItems',
                    title: 'Clear All Menu Items?',
                    message: 'This will permanently delete all menu items. This action cannot be undone.',
                    action: () => clearCollection('menuItems'),
                  })
                }
                disabled={stats.collections.menuItems.total === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All ({stats.collections.menuItems.total})
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-serif font-bold text-navy mb-4 flex items-center">
              <Package className="mr-2 h-6 w-6" />
              Categories Collection
            </h2>
            <p className="text-gray-600 mb-4">
              Manage menu categories and organization
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCollection("categories")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                onClick={() =>
                  setConfirmDialog({
                    type: 'clear',
                    collection: 'categories',
                    title: 'Clear All Categories?',
                    message: 'This will permanently delete all categories. This action cannot be undone.',
                    action: () => clearCollection('categories'),
                  })
                }
                disabled={stats.collections.categories.total === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All ({stats.collections.categories.total})
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-serif font-bold text-navy mb-4 flex items-center">
              <Database className="mr-2 h-6 w-6" />
              Settings Collection
            </h2>
            <p className="text-gray-600 mb-4">
              Restaurant configuration and preferences
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCollection("settings")}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Database Operations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <h2 className="text-2xl font-serif font-bold text-navy mb-4 flex items-center">
            <Database className="mr-2 h-6 w-6" />
            Database Operations
          </h2>
          <p className="text-gray-600 mb-6">
            Full database backup, restore, and reset operations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-bold text-navy mb-2">Backup Database</h3>
              <p className="text-sm text-gray-600 mb-4">
                Export complete database as JSON file
              </p>
              <Button
                variant="gold"
                className="w-full"
                onClick={() =>
                  setConfirmDialog({
                    type: 'backup',
                    title: 'Create Database Backup?',
                    message: 'This will download a complete backup of your database.',
                    action: backupDatabase,
                  })
                }
                disabled={processing}
              >
                <Download className="mr-2 h-4 w-4" />
                Backup (JSON)
              </Button>
            </div>

            <div className="p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
              <h3 className="font-bold text-green-600 mb-2">Export to Excel</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download all data as Excel spreadsheet
              </p>
              <Button
                variant="outline"
                className="w-full text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                onClick={exportToExcel}
                disabled={processing}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-bold text-navy mb-2">Restore Database</h3>
              <p className="text-sm text-gray-600 mb-4">
                Restore from a previous backup file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="hidden"
                id="restore-file"
              />
              <label htmlFor="restore-file">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('restore-file')?.click()}
                  disabled={processing}
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </span>
                </Button>
              </label>
              {restoreFile && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">{restoreFile.name}</p>
                  <Button
                    variant="gold"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setConfirmDialog({
                        type: 'restore',
                        title: 'Restore Database?',
                        message: 'This will replace ALL current data with the backup file. This action cannot be undone.',
                        action: restoreDatabase,
                      })
                    }
                    disabled={processing}
                  >
                    Restore Now
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
              <h3 className="font-bold text-red-600 mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reset to Demo Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Clear all data and restore demo menu items
              </p>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                onClick={() =>
                  setConfirmDialog({
                    type: 'seed',
                    title: 'Reset Database to Demo Data?',
                    message: 'This will DELETE ALL current data and restore demo menu items, categories, and settings. All orders will be lost. This action cannot be undone.',
                    action: seedDatabase,
                  })
                }
                disabled={processing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Database
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {confirmDialog?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{confirmDialog?.message}</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={() => confirmDialog?.action()}
              disabled={processing}
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
