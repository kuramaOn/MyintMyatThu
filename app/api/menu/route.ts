import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { MenuItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeUnavailable = searchParams.get("includeUnavailable");

    const db = await getDb();
    
    // Build query - only filter by available if includeUnavailable is not set
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    // Only filter by available for customer-facing requests
    if (includeUnavailable !== "true") {
      query.available = true;
    }
    
    const menuItems = await db
      .collection<MenuItem>("menuItems")
      .find(query)
      .sort({ category: 1, name: 1 })
      .toArray();

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const menuItem: Omit<MenuItem, "_id"> = {
      ...body,
      quantitySold: 0, // Initialize to 0
      lowStockThreshold: body.lowStockThreshold || 5, // Default to 5
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<MenuItem>("menuItems").insertOne(menuItem as any);

    return NextResponse.json(
      { id: result.insertedId, ...menuItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
