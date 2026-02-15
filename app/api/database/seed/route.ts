import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// POST - Reset database to seed data
export async function POST() {
  try {
    const db = await getDb();

    // Create admin user
    const hashedPassword = await bcrypt.hash("QwenAdmin123!", 10);
    const adminUser = {
      email: "admin@qwen.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
      createdAt: new Date(),
    };

    // Seed data
    const categories = [
      { 
        name: "Coffee", 
        description: "Premium coffee beverages made from finest beans",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&h=300&auto=format&fit=crop",
        order: 1,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: "Tea", 
        description: "Exquisite tea selection from around the world",
        imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=400&h=300&auto=format&fit=crop",
        order: 2,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: "Bakery", 
        description: "Freshly baked pastries and breads daily",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=300&auto=format&fit=crop",
        order: 3,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: "Dessert", 
        description: "Decadent desserts and sweet treats",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&h=300&auto=format&fit=crop",
        order: 4,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        name: "Food", 
        description: "Gourmet meals and savory dishes",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&h=300&auto=format&fit=crop",
        order: 5,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const menuItems = [
      {
        name: "Espresso",
        description: "Rich and bold espresso shot, perfectly extracted for maximum flavor",
        price: 500,
        currency: "JPY",
        category: "Coffee",
        imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Cappuccino",
        description: "Classic Italian cappuccino with velvety microfoam and a dusting of cocoa",
        price: 600,
        currency: "JPY",
        category: "Coffee",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Matcha Latte",
        description: "Premium ceremonial grade matcha whisked with steamed milk",
        price: 650,
        currency: "JPY",
        category: "Tea",
        imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Croissant",
        description: "Buttery, flaky French croissant baked fresh daily",
        price: 350,
        currency: "JPY",
        category: "Bakery",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Cheesecake",
        description: "Creamy New York-style cheesecake with graham cracker crust",
        price: 450,
        currency: "JPY",
        category: "Dessert",
        imageUrl: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Club Sandwich",
        description: "Triple-decker sandwich with turkey, bacon, lettuce, and tomato",
        price: 800,
        currency: "JPY",
        category: "Food",
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&h=300&auto=format&fit=crop",
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const settings = {
      _id: "restaurant_settings",
      restaurant: {
        name: "QWEN",
        address: {
          line1: "123 Luxury Street",
          line2: "Downtown, City Center",
        },
        phone: "+95 9 123 456 789",
        hours: {
          open: "08:00",
          close: "20:00",
        },
      },
      paypay: {
        phoneNumber: "",
        qrCodeUrl: "",
      },
      messenger: {
        username: "thetminthu5545",
        link: "https://m.me/thetminthu5545",
        botConnected: false,
      },
      currency: {
        code: "JPY" as const,
        symbol: "¥",
        position: "before" as const,
      },
      notifications: {
        sound: true,
        desktop: true,
        email: false,
      },
      email: {
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        fromEmail: "noreply@qwen.restaurant",
        fromName: "QWEN Restaurant",
        templates: {
          orderConfirmation: "Dear {customerName},\n\nYour order {orderId} has been confirmed!\nTotal: {total}\n\nThank you for choosing QWEN.",
          orderReady: "Dear {customerName},\n\nYour order {orderId} is ready for pickup!\n\nPlease collect it at your earliest convenience.",
          orderCancelled: "Dear {customerName},\n\nWe regret to inform you that your order {orderId} has been cancelled.\n\nReason: {reason}",
          adminNotification: "New order received!\n\nOrder ID: {orderId}\nCustomer: {customerName}\nTotal: {total}\nPayment: {paymentMethod}",
        },
      },
      sms: {
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        enabled: false,
      },
      theme: {
        logoUrl: "",
        faviconUrl: "",
        primaryColor: "#D4AF37",
        secondaryColor: "#1a1a2e",
        accentColor: "#FAF9F6",
        fontFamily: "Inter",
        footerText: "© 2025 QWEN Restaurant. All rights reserved.",
        socialLinks: {
          facebook: "",
          instagram: "",
          twitter: "",
          whatsapp: "",
        },
      },
      updatedAt: new Date(),
    };

    // Clear existing data
    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("orders").deleteMany({}),
      db.collection("menuItems").deleteMany({}),
      db.collection("categories").deleteMany({}),
      db.collection("settings").deleteMany({}),
    ]);

    // Insert seed data
    const [userResult, categoriesResult, menuItemsResult, settingsResult] = await Promise.all([
      db.collection("users").insertOne(adminUser),
      db.collection("categories").insertMany(categories),
      db.collection("menuItems").insertMany(menuItems),
      db.collection("settings").insertOne(settings as any),
    ]);

    return NextResponse.json({
      success: true,
      message: "Database reset to seed data successfully",
      results: {
        users: 1,
        categories: categoriesResult.insertedCount,
        menuItems: menuItemsResult.insertedCount,
        settings: 1,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
