"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Category } from "@/types"
import { LoadingSpinner } from "@/components/shared/loading"
import { containerVariants, itemVariants } from "@/lib/animations"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { addToast } = useToast()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visible, setVisible] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast({
        title: "Error",
        description: "Failed to load categories",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function openCreateDialog() {
    setEditingCategory(null)
    setName("")
    setDescription("")
    setVisible(true)
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description || "")
    setVisible(category.visible)
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Category name is required",
        type: "error",
      })
      return
    }

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories"
      
      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          visible,
          order: editingCategory?.order || 0,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save category")
      }

      addToast({
        title: "Success",
        description: `Category ${editingCategory ? "updated" : "created"} successfully`,
        type: "success",
      })

      setIsDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      addToast({
        title: "Error",
        description: "Failed to save category",
        type: "error",
      })
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category")
      }

      addToast({
        title: "Success",
        description: "Category deleted successfully",
        type: "success",
      })

      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        type: "error",
      })
    }
  }

  async function toggleVisibility(category: Category) {
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...category,
          visible: !category.visible,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update category")
      }

      addToast({
        title: "Success",
        description: `Category ${!category.visible ? "shown" : "hidden"}`,
        type: "success",
      })

      fetchCategories()
    } catch (error) {
      console.error("Error updating category:", error)
      addToast({
        title: "Error",
        description: "Failed to update category",
        type: "error",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-cream">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-navy mb-2">
              Categories
            </h1>
            <p className="text-gray-600">
              Manage menu categories and their visibility
            </p>
          </div>
          <Button
            variant="gold"
            onClick={openCreateDialog}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">No categories yet</p>
              <Button variant="gold" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
            </Card>
          ) : (
            categories.map((category) => (
              <Card
                key={category._id?.toString()}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-navy mb-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Order: {category.order}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            category.visible
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.visible ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(category)}
                      title={category.visible ? "Hide category" : "Show category"}
                    >
                      {category.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-navy">
                {editingCategory ? "Edit Category" : "Create Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Beverages, Main Course"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <Label htmlFor="visible" className="mb-0">
                  Visible on menu
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold" className="flex-1">
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
