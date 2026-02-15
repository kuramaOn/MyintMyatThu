import { ObjectId } from "mongodb";

export type Currency = "MMK" | "JPY";
export type PaymentMethod = "paypay" | "messenger";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type UserRole = "admin" | "super_admin";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface RestaurantSettings {
  _id: string;
  restaurant: {
    name: string;
    address: {
      line1: string;
      line2: string;
    };
    phone: string;
    hours: {
      open: string;
      close: string;
    };
  };
  paypay: {
    phoneNumber: string;
    qrCodeUrl: string;
  };
  messenger: {
    username: string;
    link: string;
    botConnected: boolean;
  };
  currency: {
    code: Currency;
    symbol: string;
    position: "before" | "after";
  };
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    templates: {
      orderConfirmation: string;
      orderReady: string;
      orderCancelled: string;
      adminNotification: string;
    };
  };
  sms: {
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;
    enabled: boolean;
  };
  theme: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    footerText: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      twitter: string;
      whatsapp: string;
    };
  };
  updatedAt: Date;
}

export interface MenuItem {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  category: string;
  imageUrl: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: ObjectId | string;
  name: string;
  price: number;
  quantity: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface Order {
  _id?: ObjectId;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    specialInstructions?: string;
  };
  items: OrderItem[];
  total: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentProof?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Category {
  _id?: ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface DashboardStats {
  pending: number;
  preparing: number;
  ready: number;
  completedToday: number;
  todayRevenue: number;
  dailyRevenue: { date: string; amount: number }[];
  paymentBreakdown: { paypay: number; messenger: number };
  topSellingItems: { name: string; quantity: number; revenue: number; imageUrl: string }[];
}
