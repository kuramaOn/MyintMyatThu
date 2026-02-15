import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://Vercel-Admin-MyintMyatThu:pvOfnkxgiTK2Tutp@myintmyatthu.jgwhuag.mongodb.net/?retryWrites=true&w=majority";

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("qwen_restaurant");

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("settings").deleteMany({});
    await db.collection("menuItems").deleteMany({});
    await db.collection("orders").deleteMany({});
    await db.collection("categories").deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const hashedPassword = await bcrypt.hash("QwenAdmin123!", 10);
    await db.collection("users").insertOne({
      email: "admin@qwen.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Created admin user");

    // Create default settings
    await db.collection("settings").insertOne({
      _id: "restaurant_settings" as any,
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
        code: "JPY",
        symbol: "¥",
        position: "before",
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
    });

    console.log("Created default settings");

    // Create categories
    const categories = [
      { 
        name: "Coffee", 
        description: "Premium coffee beverages made from finest beans",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&h=300&auto=format&fit=crop",
        order: 1,
        visible: true,
      },
      { 
        name: "Tea", 
        description: "Exquisite tea selection from around the world",
        imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=400&h=300&auto=format&fit=crop",
        order: 2,
        visible: true,
      },
      { 
        name: "Bakery", 
        description: "Freshly baked pastries and breads daily",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&h=300&auto=format&fit=crop",
        order: 3,
        visible: true,
      },
      { 
        name: "Dessert", 
        description: "Decadent desserts and sweet treats",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&h=300&auto=format&fit=crop",
        order: 4,
        visible: true,
      },
      { 
        name: "Food", 
        description: "Gourmet meals and savory dishes",
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&h=300&auto=format&fit=crop",
        order: 5,
        visible: true,
      },
    ];

    await db.collection("categories").insertMany(
      categories.map((cat) => ({ ...cat, createdAt: new Date(), updatedAt: new Date() }))
    );

    console.log("Created categories");

    // Create sample menu items with real Unsplash images
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

    await db.collection("menuItems").insertMany(menuItems);

    console.log("Created sample menu items");

    // Create sample orders (mock data)
    const sampleOrders = [
      {
        orderId: "ORD-20250214-001",
        customer: {
          name: "Takeshi Yamamoto",
          phone: "+81 90 1234 5678",
          specialInstructions: "Extra hot please",
        },
        items: [
          {
            menuItemId: null,
            name: "Cappuccino",
            price: 600,
            quantity: 2,
          },
          {
            menuItemId: null,
            name: "Croissant",
            price: 350,
            quantity: 1,
          },
        ],
        total: 1550,
        currency: "JPY",
        paymentMethod: "paypay",
        paymentProof: "",
        paymentStatus: "pending",
        orderStatus: "pending",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        orderId: "ORD-20250214-002",
        customer: {
          name: "Sakura Tanaka",
          phone: "+81 80 9876 5432",
        },
        items: [
          {
            menuItemId: null,
            name: "Matcha Latte",
            price: 650,
            quantity: 1,
          },
          {
            menuItemId: null,
            name: "Cheesecake",
            price: 450,
            quantity: 1,
          },
        ],
        total: 1100,
        currency: "JPY",
        paymentMethod: "messenger",
        paymentStatus: "verified",
        orderStatus: "preparing",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 600000),
          },
          {
            status: "confirmed",
            timestamp: new Date(Date.now() - 300000),
          },
          {
            status: "preparing",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(Date.now() - 600000),
        updatedAt: new Date(),
      },
      {
        orderId: "ORD-20250214-003",
        customer: {
          name: "Hiroshi Nakamura",
          phone: "+81 70 5555 1234",
          specialInstructions: "No sugar",
        },
        items: [
          {
            menuItemId: null,
            name: "Espresso",
            price: 500,
            quantity: 3,
          },
        ],
        total: 1500,
        currency: "JPY",
        paymentMethod: "paypay",
        paymentProof: "",
        paymentStatus: "verified",
        orderStatus: "ready",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 900000),
          },
          {
            status: "confirmed",
            timestamp: new Date(Date.now() - 600000),
          },
          {
            status: "preparing",
            timestamp: new Date(Date.now() - 300000),
          },
          {
            status: "ready",
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(Date.now() - 900000),
        updatedAt: new Date(),
      },
    ];

    await db.collection("orders").insertMany(sampleOrders);

    console.log("Created sample orders");

    console.log("\n=== Seed Complete ===");
    console.log("Admin credentials:");
    console.log("Email: admin@qwen.com");
    console.log("Password: QwenAdmin123!");
    console.log("\nSample menu items: 6");
    console.log("Sample orders: 3");
    console.log("Categories: 5");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();
