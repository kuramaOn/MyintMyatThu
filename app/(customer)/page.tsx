"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Coffee, Utensils, Clock, MapPin, ArrowRight, ChefHat, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RestaurantSettings } from "@/types"

export default function HomePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" })
        const data = await res.json()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-white">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-gold mb-4">QWEN</h1>
          <p className="text-dark/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">Premium Artisanal Experience</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-dark mb-6"
          >
            Welcome to <span className="text-gold">QWEN</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-dark/70 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Experience luxury dining with the finest artisanal coffee, handcrafted pastries, 
            and gourmet cuisine delivered with elegance.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              onClick={() => router.push("/menu")}
              className="bg-gold hover:bg-gold/90 text-dark font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              View Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push("/cart")}
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-dark font-semibold text-lg px-8 py-6 rounded-xl transition-all"
            >
              Your Cart
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Coffee className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold text-dark mb-2">Artisanal Coffee</h3>
              <p className="text-dark/60 leading-relaxed">
                Expertly crafted beverages from premium beans, prepared by skilled baristas
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ChefHat className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold text-dark mb-2">Gourmet Cuisine</h3>
              <p className="text-dark/60 leading-relaxed">
                Handcrafted pastries and gourmet dishes made fresh daily with love
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Utensils className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold text-dark mb-2">Easy Ordering</h3>
              <p className="text-dark/60 leading-relaxed">
                Simple online ordering with multiple payment options for your convenience
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-gold/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-gold rounded-full"></div>
          </div>
        </motion.div>
      </motion.section>

      {/* Restaurant Info Section */}
      {settings && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl font-bold text-dark mb-6">
                  Visit Us Today
                </h2>
                <p className="text-lg text-dark/70 mb-8 leading-relaxed">
                  Experience the perfect blend of luxury and comfort in our beautifully designed space. 
                  Whether you&apos;re looking for a quick coffee or a leisurely meal, we&apos;re here to serve you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark mb-1">Location</h4>
                      <p className="text-dark/60">{settings.restaurant.address.line1}</p>
                      <p className="text-dark/60">{settings.restaurant.address.line2}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark mb-1">Hours</h4>
                      <p className="text-dark/60">
                        {settings.restaurant.hours.open} - {settings.restaurant.hours.close}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gold/5 to-gold/10 rounded-3xl p-12 text-center"
              >
                <h3 className="font-display text-3xl font-bold text-dark mb-6">
                  Ready to Order?
                </h3>
                <p className="text-dark/70 mb-8 leading-relaxed">
                  Browse our carefully curated menu and place your order in just a few taps. 
                  Quick, easy, and delicious!
                </p>
                <Button
                  onClick={() => router.push("/menu")}
                  className="bg-gold hover:bg-gold/90 text-dark font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Explore Menu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
