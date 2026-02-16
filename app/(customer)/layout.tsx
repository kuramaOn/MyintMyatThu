"use client"

import { CartProvider } from "@/contexts/cart-context"
import { ToastProvider } from "@/components/ui/toast"
import { Header } from "@/components/customer/header"
import { Footer } from "@/components/customer/footer"
import { AppPermissions } from "@/components/shared/app-permissions"
import { NetworkStatus } from "@/components/shared/network-status"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <ToastProvider>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <AppPermissions />
        <NetworkStatus />
      </ToastProvider>
    </CartProvider>
  )
}
