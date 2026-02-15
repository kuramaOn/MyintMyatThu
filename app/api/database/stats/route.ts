import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    
    // Get collection statistics
    const [
      ordersCount,
      menuItemsCount,
      categoriesCount,
      orders,
      menuItems,
    ] = await Promise.all([
      db.collection("orders").countDocuments(),
      db.collection("menuItems").countDocuments(),
      db.collection("categories").countDocuments(),
      db.collection("orders").find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection("menuItems").find().sort({ updatedAt: -1 }).limit(5).toArray(),
    ]);

    // Calculate additional statistics
    const availableMenuItems = await db.collection("menuItems").countDocuments({ available: true });
    const unavailableMenuItems = menuItemsCount - availableMenuItems;
    
    const pendingOrders = await db.collection("orders").countDocuments({ orderStatus: "pending" });
    const completedOrders = await db.collection("orders").countDocuments({ orderStatus: "completed" });
    
    // Calculate total revenue from completed orders
    const revenueData = await db.collection("orders").aggregate([
      { $match: { orderStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    const totalRevenue = revenueData[0]?.total || 0;

    // Get database storage statistics
    const dbStats = await db.stats();
    const mongoDbSizeMB = (dbStats.dataSize / (1024 * 1024)).toFixed(2);
    const mongoDbLimitMB = 512; // MongoDB Atlas Free Tier (M0) limit
    const mongoDbUsagePercent = ((dbStats.dataSize / (1024 * 1024)) / mongoDbLimitMB * 100).toFixed(1);

    // Get Vercel Blob storage info (placeholder - would need actual Vercel API call)
    // For now, estimate based on uploaded files
    const blobStorageLimitMB = 1024; // 1GB for Vercel Hobby plan
    const blobStorageSizeMB = 0; // Would calculate from actual blob storage
    const blobStoragePercent = ((blobStorageSizeMB / blobStorageLimitMB) * 100).toFixed(1);

    const stats = {
      collections: {
        orders: {
          total: ordersCount,
          pending: pendingOrders,
          completed: completedOrders,
        },
        menuItems: {
          total: menuItemsCount,
          available: availableMenuItems,
          unavailable: unavailableMenuItems,
        },
        categories: {
          total: categoriesCount,
        },
      },
      revenue: {
        total: totalRevenue,
        completedOrders: completedOrders,
      },
      storage: {
        mongodb: {
          used: parseFloat(mongoDbSizeMB),
          limit: mongoDbLimitMB,
          usagePercent: parseFloat(mongoDbUsagePercent),
          unit: "MB",
        },
        vercelBlob: {
          used: blobStorageSizeMB,
          limit: blobStorageLimitMB,
          usagePercent: parseFloat(blobStoragePercent),
          unit: "MB",
        },
      },
      recentActivity: {
        orders: orders,
        menuItems: menuItems,
      },
      lastUpdated: new Date(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching database stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch database statistics" },
      { status: 500 }
    );
  }
}
