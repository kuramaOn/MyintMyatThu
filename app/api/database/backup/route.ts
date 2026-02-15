import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Export full database backup
export async function GET() {
  try {
    const db = await getDb();
    
    const [orders, menuItems, categories, settings] = await Promise.all([
      db.collection("orders").find({}).toArray(),
      db.collection("menuItems").find({}).toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("settings").find({}).toArray(),
    ]);

    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      collections: {
        orders,
        menuItems,
        categories,
        settings,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="qwen_restaurant_backup_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}

// POST - Restore from backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.collections) {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const results = {
      orders: 0,
      menuItems: 0,
      categories: 0,
      settings: 0,
    };

    // Clear existing data and restore from backup
    if (body.collections.orders && Array.isArray(body.collections.orders)) {
      await db.collection("orders").deleteMany({});
      if (body.collections.orders.length > 0) {
        const insertResult = await db.collection("orders").insertMany(body.collections.orders);
        results.orders = insertResult.insertedCount;
      }
    }

    if (body.collections.menuItems && Array.isArray(body.collections.menuItems)) {
      await db.collection("menuItems").deleteMany({});
      if (body.collections.menuItems.length > 0) {
        const insertResult = await db.collection("menuItems").insertMany(body.collections.menuItems);
        results.menuItems = insertResult.insertedCount;
      }
    }

    if (body.collections.categories && Array.isArray(body.collections.categories)) {
      await db.collection("categories").deleteMany({});
      if (body.collections.categories.length > 0) {
        const insertResult = await db.collection("categories").insertMany(body.collections.categories);
        results.categories = insertResult.insertedCount;
      }
    }

    if (body.collections.settings && Array.isArray(body.collections.settings)) {
      await db.collection("settings").deleteMany({});
      if (body.collections.settings.length > 0) {
        const insertResult = await db.collection("settings").insertMany(body.collections.settings);
        results.settings = insertResult.insertedCount;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      results,
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}
