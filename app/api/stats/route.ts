import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order } from "@/types";

export async function GET() {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get order counts by status
    const pending = await db.collection<Order>("orders").countDocuments({ orderStatus: "pending" });
    const preparing = await db.collection<Order>("orders").countDocuments({ orderStatus: "preparing" });
    const ready = await db.collection<Order>("orders").countDocuments({ orderStatus: "ready" });
    const completedToday = await db.collection<Order>("orders").countDocuments({
      orderStatus: "completed",
      completedAt: { $gte: today },
    });

    // Today's revenue
    const todayOrders = await db
      .collection<Order>("orders")
      .find({
        createdAt: { $gte: today },
        paymentStatus: "verified",
      })
      .toArray();

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Payment breakdown
    const paypayCount = todayOrders.filter(o => o.paymentMethod === "paypay").length;
    const messengerCount = todayOrders.filter(o => o.paymentMethod === "messenger").length;

    // Daily revenue for last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekOrders = await db
      .collection<Order>("orders")
      .find({
        createdAt: { $gte: sevenDaysAgo },
        paymentStatus: "verified",
      })
      .toArray();

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = weekOrders.filter(
        o => o.createdAt >= date && o.createdAt < nextDate
      );
      const amount = dayOrders.reduce((sum, order) => sum + order.total, 0);

      dailyRevenue.push({
        date: date.toISOString().split("T")[0],
        amount,
      });
    }

    // Top selling items
    const allOrders = await db
      .collection<Order>("orders")
      .find({ createdAt: { $gte: today } })
      .toArray();

    const itemStats: Record<string, { name: string; quantity: number; revenue: number; imageUrl: string }> = {};

    for (const order of allOrders) {
      for (const item of order.items) {
        const key = item.name;
        if (!itemStats[key]) {
          itemStats[key] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            imageUrl: "",
          };
        }
        itemStats[key].quantity += item.quantity;
        itemStats[key].revenue += item.price * item.quantity;
      }
    }

    const topSellingItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      pending,
      preparing,
      ready,
      completedToday,
      todayRevenue,
      dailyRevenue,
      paymentBreakdown: {
        paypay: paypayCount,
        messenger: messengerCount,
      },
      topSellingItems,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
