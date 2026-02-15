"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Save, Upload, Copy, Check, Mail, MessageSquare, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { RestaurantSettings } from "@/types"
import { LoadingSpinner } from "@/components/shared/loading"
import { HexColorPicker } from "react-colorful"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToast()

  // Image uploads
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string>("")

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
      setQrCodePreview(data.paypay.qrCodeUrl)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)

    try {
      let qrCodeUrl = settings.paypay.qrCodeUrl

      // Upload QR code if changed
      if (qrCodeFile) {
        console.log("[Settings] Uploading QR code file:", qrCodeFile.name, qrCodeFile.size)
        const formData = new FormData()
        formData.append("file", qrCodeFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          qrCodeUrl = uploadData.url
          console.log("[Settings] QR code uploaded successfully:", qrCodeUrl)
        } else {
          const errorData = await uploadRes.json()
          console.error("[Settings] Upload failed:", errorData)
          throw new Error(errorData.error || "Failed to upload QR code")
        }
      }

      // Update settings
      const updatedSettings = {
        ...settings,
        paypay: {
          ...settings.paypay,
          qrCodeUrl,
        },
        messenger: {
          ...settings.messenger,
          link: `https://m.me/${settings.messenger.username}`,
        },
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Save failed:", errorData)
        throw new Error(errorData.error || "Failed to save settings")
      }

      const result = await res.json()
      console.log("Save result:", result)

      addToast({
        title: "Success",
        description: "Settings saved successfully",
        type: "success",
      })

      setSettings(updatedSettings)
      setQrCodeFile(null)
    } catch (error) {
      console.error("Error saving settings:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast({
      title: "Copied!",
      description: "Link copied to clipboard",
      type: "success",
    })
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  const tabs = [
    { label: "Restaurant Info", icon: "🏪" },
    { label: "Payment Settings", icon: "💳" },
    { label: "Currency", icon: "💰" },
    { label: "Notifications", icon: "🔔" },
    { label: "Email & SMS", icon: "📧" },
    { label: "Theme & Branding", icon: "🎨" },
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold text-navy mb-2">Settings</h1>
        <p className="text-gray-600">Manage your restaurant configuration</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === index
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-navy"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-8">
        {/* Tab 1: Restaurant Info */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-navy mb-6">
              Restaurant Information
            </h2>

            <div>
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={settings.restaurant.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurant: { ...settings.restaurant, name: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={settings.restaurant.address.line1}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurant: {
                      ...settings.restaurant,
                      address: { ...settings.restaurant.address, line1: e.target.value },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={settings.restaurant.address.line2}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurant: {
                      ...settings.restaurant,
                      address: { ...settings.restaurant.address, line2: e.target.value },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={settings.restaurant.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restaurant: { ...settings.restaurant, phone: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="open">Opening Time</Label>
                <Input
                  id="open"
                  type="time"
                  value={settings.restaurant.hours.open}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        hours: { ...settings.restaurant.hours, open: e.target.value },
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="close">Closing Time</Label>
                <Input
                  id="close"
                  type="time"
                  value={settings.restaurant.hours.close}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      restaurant: {
                        ...settings.restaurant,
                        hours: { ...settings.restaurant.hours, close: e.target.value },
                      },
                    })
                  }
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Payment Settings */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                PayPay Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="paypayPhone">PayPay Phone Number</Label>
                  <Input
                    id="paypayPhone"
                    type="tel"
                    value={settings.paypay.phoneNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paypay: { ...settings.paypay, phoneNumber: e.target.value },
                      })
                    }
                    placeholder="+95 9 123 456 789"
                  />
                </div>

                <div>
                  <Label>PayPay QR Code</Label>
                  <div className="mt-2 space-y-4">
                    {qrCodePreview && (
                      <div className="inline-block p-4 bg-white border rounded-lg">
                        <Image
                          src={qrCodePreview}
                          alt="PayPay QR Code"
                          width={200}
                          height={200}
                        />
                      </div>
                    )}
                    <div className="border-2 border-dashed rounded-lg p-6">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrCodeChange}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label htmlFor="qr-upload" className="cursor-pointer block text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {qrCodePreview ? "Change QR Code" : "Upload QR Code"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                Messenger Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="messengerUsername">Messenger Username</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        @
                      </span>
                      <Input
                        id="messengerUsername"
                        value={settings.messenger.username}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            messenger: {
                              ...settings.messenger,
                              username: e.target.value.replace("@", ""),
                            },
                          })
                        }
                        className="pl-7"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Generated Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={`https://m.me/${settings.messenger.username}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(`https://m.me/${settings.messenger.username}`)
                      }
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Currency */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-navy mb-6">
              Currency Settings
            </h2>

            <div>
              <Label className="mb-4 block">Select Currency</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="radio"
                    name="currency"
                    value="JPY"
                    checked={settings.currency.code === "JPY"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, code: "JPY", symbol: "¥" },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold">JPY - Japanese Yen</p>
                    <p className="text-sm text-gray-600">Symbol: ¥</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="radio"
                    name="currency"
                    value="MMK"
                    checked={settings.currency.code === "MMK"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, code: "MMK", symbol: "Ks" },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold">MMK - Myanmar Kyat</p>
                    <p className="text-sm text-gray-600">Symbol: Ks</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <Label className="mb-4 block">Symbol Position</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="radio"
                    name="position"
                    value="before"
                    checked={settings.currency.position === "before"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, position: "before" },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold">Before Amount</p>
                    <p className="text-sm text-gray-600">
                      Example: {settings.currency.symbol}1,500
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="radio"
                    name="position"
                    value="after"
                    checked={settings.currency.position === "after"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, position: "after" },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold">After Amount</p>
                    <p className="text-sm text-gray-600">
                      Example: 1,500{settings.currency.symbol}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> Prices will be displayed as{" "}
                <span className="font-bold text-gold">
                  {settings.currency.position === "before"
                    ? `${settings.currency.symbol}1,500`
                    : `1,500${settings.currency.symbol}`}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-navy mb-6">
              Notification Settings
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-semibold">Sound Alerts</p>
                  <p className="text-sm text-gray-600">
                    Play sound when new orders arrive
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.sound}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        sound: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-semibold">Desktop Notifications</p>
                  <p className="text-sm text-gray-600">
                    Show browser notifications for new orders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.desktop}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        desktop: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive email alerts for important updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5"
                />
              </label>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Email & SMS Settings */}
        {activeTab === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                Email Configuration (SMTP)
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      value={settings.email?.smtpHost || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, smtpHost: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                      value={settings.email?.smtpPort || 587}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPort: parseInt(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      placeholder="your@email.com"
                      value={settings.email?.smtpUser || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, smtpUser: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••"
                      value={settings.email?.smtpPassword || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, smtpPassword: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@qwen.restaurant"
                      value={settings.email?.fromEmail || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, fromEmail: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="QWEN Restaurant"
                      value={settings.email?.fromName || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, fromName: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                SMS Configuration (Twilio)
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={settings.sms?.enabled || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, enabled: e.target.checked },
                      })
                    }
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold">Enable SMS Notifications</p>
                    <p className="text-sm text-gray-600">Send order updates via SMS</p>
                  </div>
                </label>
                <div>
                  <Label htmlFor="twilioSid">Twilio Account SID</Label>
                  <Input
                    id="twilioSid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.sms?.twilioAccountSid || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, twilioAccountSid: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="twilioToken">Twilio Auth Token</Label>
                  <Input
                    id="twilioToken"
                    type="password"
                    placeholder="••••••••"
                    value={settings.sms?.twilioAuthToken || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, twilioAuthToken: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="twilioPhone">Twilio Phone Number</Label>
                  <Input
                    id="twilioPhone"
                    placeholder="+1234567890"
                    value={settings.sms?.twilioPhoneNumber || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sms: { ...settings.sms, twilioPhoneNumber: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-serif font-bold text-navy mb-6">
                Email Templates
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Use placeholders: {"{customerName}"}, {"{orderId}"}, {"{total}"}, {"{paymentMethod}"}, {"{reason}"}
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateConfirm">Order Confirmation</Label>
                  <Textarea
                    id="templateConfirm"
                    rows={4}
                    value={settings.email?.templates?.orderConfirmation || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: {
                          ...settings.email,
                          templates: {
                            ...settings.email?.templates,
                            orderConfirmation: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="templateReady">Order Ready</Label>
                  <Textarea
                    id="templateReady"
                    rows={3}
                    value={settings.email?.templates?.orderReady || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: {
                          ...settings.email,
                          templates: {
                            ...settings.email?.templates,
                            orderReady: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="templateCancelled">Order Cancelled</Label>
                  <Textarea
                    id="templateCancelled"
                    rows={3}
                    value={settings.email?.templates?.orderCancelled || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: {
                          ...settings.email,
                          templates: {
                            ...settings.email?.templates,
                            orderCancelled: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="templateAdmin">Admin Notification</Label>
                  <Textarea
                    id="templateAdmin"
                    rows={3}
                    value={settings.email?.templates?.adminNotification || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: {
                          ...settings.email,
                          templates: {
                            ...settings.email?.templates,
                            adminNotification: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Theme & Branding */}
        {activeTab === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-serif font-bold text-navy mb-6">
              Theme & Branding
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label>Primary Color (Gold)</Label>
                <div className="mt-2">
                  <HexColorPicker
                    color={settings.theme?.primaryColor || "#D4AF37"}
                    onChange={(color) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: color },
                      })
                    }
                  />
                  <Input
                    className="mt-2"
                    value={settings.theme?.primaryColor || "#D4AF37"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, primaryColor: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color (Navy)</Label>
                <div className="mt-2">
                  <HexColorPicker
                    color={settings.theme?.secondaryColor || "#1a1a2e"}
                    onChange={(color) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, secondaryColor: color },
                      })
                    }
                  />
                  <Input
                    className="mt-2"
                    value={settings.theme?.secondaryColor || "#1a1a2e"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, secondaryColor: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Accent Color (Cream)</Label>
                <div className="mt-2">
                  <HexColorPicker
                    color={settings.theme?.accentColor || "#FAF9F6"}
                    onChange={(color) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, accentColor: color },
                      })
                    }
                  />
                  <Input
                    className="mt-2"
                    value={settings.theme?.accentColor || "#FAF9F6"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, accentColor: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                placeholder="© 2025 QWEN Restaurant. All rights reserved."
                value={settings.theme?.footerText || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: { ...settings.theme, footerText: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/qwen"
                    value={settings.theme?.socialLinks?.facebook || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: {
                          ...settings.theme,
                          socialLinks: {
                            ...settings.theme?.socialLinks,
                            facebook: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/qwen"
                    value={settings.theme?.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: {
                          ...settings.theme,
                          socialLinks: {
                            ...settings.theme?.socialLinks,
                            instagram: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/qwen"
                    value={settings.theme?.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: {
                          ...settings.theme,
                          socialLinks: {
                            ...settings.theme?.socialLinks,
                            twitter: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+1234567890"
                    value={settings.theme?.socialLinks?.whatsapp || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: {
                          ...settings.theme,
                          socialLinks: {
                            ...settings.theme?.socialLinks,
                            whatsapp: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* Save Button */}
        <div className="flex justify-end mt-8 pt-8 border-t">
          <Button
            variant="gold"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="px-8"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
