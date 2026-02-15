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
