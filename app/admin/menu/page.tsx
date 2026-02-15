"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Plus, Edit, Trash2, Upload, AlertTriangle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { MenuItem, Category } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/loading"

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "JPY",
    category: "",
    imageUrl: "",
    available: true,
    stockQuantity: "",
    lowStockThreshold: "5",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        fetch("/api/menu?includeUnavailable=true"),
        fetch("/api/categories"),
      ])

      const menuData = await menuRes.json()
      const categoriesData = await categoriesRes.json()

      setMenuItems(menuData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.imageUrl

      // Upload image if new file selected
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", imageFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadRes.ok) throw new Error("Failed to upload image")

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        imageUrl,
        available: formData.available,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
        lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : 5,
      }

      const url = editingItem
        ? `/api/menu/${editingItem._id}`
        : "/api/menu"

      const method = editingItem ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      })

      if (!res.ok) throw new Error("Failed to save item")

      addToast({
        title: "Success",
        description: editingItem ? "Item updated" : "Item created",
        type: "success",
      })

      fetchData()
      handleCloseDialog()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to save menu item",
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      currency: item.currency,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
      stockQuantity: item.stockQuantity?.toString() || "",
      lowStockThreshold: item.lowStockThreshold?.toString() || "5",
    })
    setImagePreview(item.imageUrl)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" })

      if (!res.ok) throw new Error("Failed to delete item")

      addToast({
        title: "Success",
        description: "Item deleted",
        type: "success",
      })

      fetchData()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete menu item",
        type: "error",
      })
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, available: !item.available }),
      })

      if (!res.ok) throw new Error("Failed to update availability")

      addToast({
        title: "Success",
        description: `Item marked as ${!item.available ? "available" : "unavailable"}`,
        type: "success",
      })

      fetchData()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update availability",
        type: "error",
      })
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "JPY",
      category: "",
      imageUrl: "",
      available: true,
      stockQuantity: "",
      lowStockThreshold: "5",
    })
    setImageFile(null)
    setImagePreview("")
  }

  const filteredItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

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
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-serif font-bold text-navy mb-2">Menu Management</h1>
          <p className="text-gray-600">Add, edit, or remove menu items</p>
        </div>
        <Button
          variant="gold"
          size="lg"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Item
        </Button>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
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
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <motion.div
            key={item._id?.toString()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
          >
            <Card className="overflow-hidden h-full flex flex-col">
              {/* Image */}
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge className="bg-red-500 text-white">Unavailable</Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-navy">{item.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                  {item.description}
                </p>

                <div className="text-xl font-bold text-gold mb-2">
                  {formatCurrency(item.price, item.currency, "before")}
                </div>

                {/* Stock Info */}
                {item.stockQuantity !== null && item.stockQuantity !== undefined && (
                  <div className="mb-3">
                    {(() => {
                      const remainingStock = (item.stockQuantity || 0) - (item.quantitySold || 0);
                      const isLowStock = remainingStock <= (item.lowStockThreshold || 5) && remainingStock > 0;
                      const isOutOfStock = remainingStock <= 0;

                      return (
                        <div className="flex items-center gap-2 text-xs">
                          <Package className="h-3.5 w-3.5" />
                          <span className={`font-semibold ${
                            isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {remainingStock} / {item.stockQuantity} in stock
                          </span>
                          {isLowStock && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          )}
                          {isOutOfStock && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                    <div className="text-xs text-gray-500 mt-1">
                      Sold: {item.quantitySold || 0}
                    </div>
                  </div>
                )}
                {(item.stockQuantity === null || item.stockQuantity === undefined) && (
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                      Unlimited Stock
                    </Badge>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    className="text-xs"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAvailability(item)}
                    className="text-xs"
                  >
                    {item.available ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item._id!.toString())}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Item Image</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Click to upload image</p>
                  </label>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id?.toString()} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="JPY">JPY (¥)</option>
                  <option value="MMK">MMK (Ks)</option>
                </select>
              </div>
            </div>

            {/* Stock Management */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-navy mb-4">Stock Management</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for unlimited stock. Item becomes unavailable when stock reaches 0.
                  </p>
                </div>

                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get warned when stock falls below this number (default: 5)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="available">Available for order</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={uploading}>
                {uploading ? "Saving..." : editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
