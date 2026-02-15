import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { RestaurantSettings } from "@/types";

// Disable caching for this route to always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db
      .collection<RestaurantSettings>("settings")
      .findOne({ _id: "restaurant_settings" });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[Settings API] PUT request received");
    
    let body;
    try {
      body = await request.json();
      console.log("[Settings API] Request body parsed successfully");
    } catch (parseError) {
      console.error("[Settings API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    console.log("[Settings API] Body keys:", Object.keys(body || {}));
    
    let db;
    try {
      db = await getDb();
      console.log("[Settings API] Database connection established");
    } catch (dbError) {
      console.error("[Settings API] Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Remove _id and updatedAt from body if present
    const { _id, updatedAt, createdAt, ...updateData } = body;
    
    console.log("[Settings API] Prepared update data with keys:", Object.keys(updateData));

    // Use replaceOne instead of updateOne to replace the entire document
    let result;
    try {
      result = await db
        .collection<RestaurantSettings>("settings")
        .replaceOne(
          { _id: "restaurant_settings" },
          {
            _id: "restaurant_settings",
            ...updateData,
            updatedAt: new Date(),
          } as any
        );
      console.log("[Settings API] Replace operation completed - matched:", result.matchedCount, "modified:", result.modifiedCount);
    } catch (replaceError) {
      console.error("[Settings API] Replace operation failed:", replaceError);
      return NextResponse.json(
        { error: "Database update failed", details: String(replaceError) },
        { status: 500 }
      );
    }

    if (result.matchedCount === 0) {
      console.error("[Settings API] Settings document not found");
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    console.log("[Settings API] Settings updated successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: String(error) },
      { status: 500 }
    );
  }
}
