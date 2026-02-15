"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/toast"
import { MenuItem, Category } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { containerVariants, itemVariants, cardVariants } from "@/lib/animations"
import { MenuItemSkeleton } from "@/components/shared/loading"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [currency, setCurrency] = useState<{ code: string; symbol: string; position: string }>({
    code: "JPY",
    symbol: "¥",
    position: "before",
  })

  const { addItem } = useCart()
  const { addToast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, categoriesRes, settingsRes] = await Promise.all([
          fetch("/api/menu", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" }),
        ])

        const menuData = await menuRes.json()
        const categoriesData = await categoriesRes.json()
        const settingsData = await settingsRes.json()

        setMenuItems(menuData)
        setCategories(categoriesData)
        setCurrency(settingsData.currency)
      } catch (error) {
        console.error("Error fetching data:", error)
        addToast({
          title: "Error",
          description: "Failed to load menu items",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refetch when page becomes visible (e.g., when navigating back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll for settings updates every 60 seconds
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsRes = await fetch("/api/settings", { cache: "no-store" })
        const settingsData = await settingsRes.json()
        setCurrency(settingsData.currency)
      } catch (error) {
        // Silently fail to avoid disrupting user experience
        console.error("Error polling settings:", error)
      }
    }

    const interval = setInterval(fetchSettings, 60000) // Poll every 60 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item._id!.toString()] || 1
    addItem({ ...item, quantity })
    addToast({
      title: "Added to cart!",
      description: `${item.name} x${quantity}`,
      type: "success",
    })
    setQuantities((prev) => ({ ...prev, [item._id!.toString()]: 1 }))
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }))
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-navy mb-4">
            Our Menu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium dishes and beverages
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          <Button
            variant={selectedCategory === "All" ? "gold" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className="rounded-full"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id?.toString()}
              variant={selectedCategory === category.name ? "gold" : "outline"}
              onClick={() => setSelectedCategory(category.name)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </motion.div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredItems.map((item) => {
                const itemId = item._id!.toString()
                const quantity = quantities[itemId] || 1

                return (
                  <motion.div
                    key={itemId}
                    variants={itemVariants}
                    layout
                    className="h-full"
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      className="h-full"
                    >
                      <Card className="overflow-hidden rounded-2xl border-2 border-gray-200 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden bg-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <Badge className="absolute top-3 right-3 bg-gold text-navy">
                            {item.category}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-serif font-bold text-navy mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Price */}
                          <div className="text-2xl font-bold text-gold mb-4">
                            {formatCurrency(item.price, currency.code as any, currency.position as any)}
                          </div>

                          {/* Quantity & Add to Cart */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-gold rounded-full overflow-hidden">
                              <button
                                onClick={() => updateQuantity(itemId, -1)}
                                className="px-3 py-2 hover:bg-gold/10 transition-colors"
                              >
                                <Minus className="h-4 w-4 text-gold" />
                              </button>
                              <span className="px-4 py-2 font-mono font-bold text-navy min-w-[3rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(itemId, 1)}
                                className="px-3 py-2 hover:bg-gold/10 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-gold" />
                              </button>
                            </div>
                            <Button
                              variant="gold"
                              className="flex-1 rounded-full"
                              onClick={() => handleAddToCart(item)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-gray-600">No items found in this category</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
