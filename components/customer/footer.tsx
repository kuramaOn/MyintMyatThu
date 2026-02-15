"use client"

import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const restaurantInfo = {
    phone: "+81 3-1234-5678",
    email: "hello@qwen.restaurant",
    address: {
      street: "123 Luxury Street",
      city: "Tokyo",
      region: "Shibuya",
      postalCode: "150-0001"
    },
    social: {
      facebook: "https://facebook.com/qwenrestaurant",
      instagram: "https://instagram.com/qwenrestaurant",
    }
  }

  return (
    <footer className="bg-navy text-cream py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-gold mb-4">QWEN</h2>
            <p className="text-cream/90">
              Experience luxury dining at its finest. Crafted with passion,
              served with elegance.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <address className="text-cream/90 not-italic">
                  {restaurantInfo.address.street}<br />
                  {restaurantInfo.address.city}, {restaurantInfo.address.region} {restaurantInfo.address.postalCode}
                </address>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`tel:${restaurantInfo.phone.replace(/\s/g, '')}`}
                  className="text-cream/90 hover:text-gold transition-colors focus-visible-ring rounded"
                >
                  {restaurantInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`mailto:${restaurantInfo.email}`}
                  className="text-cream/90 hover:text-gold transition-colors focus-visible-ring rounded"
                >
                  {restaurantInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gold">Opening Hours</h3>
            <p className="text-cream/90 mb-6">
              Monday - Sunday<br />
              8:00 AM - 8:00 PM
            </p>
            <div className="flex gap-4">
              <a
                href={restaurantInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition-colors focus-visible-ring rounded-full p-1"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-6 w-6" aria-hidden="true" />
              </a>
              <a
                href={restaurantInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition-colors focus-visible-ring rounded-full p-1"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-cream/70 text-sm">
          <p>&copy; {new Date().getFullYear()} QWEN Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
