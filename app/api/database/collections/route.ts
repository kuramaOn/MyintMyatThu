import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");

    if (!collection) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    // Whitelist allowed collections for safety
    const allowedCollections = ["orders", "menuItems", "categories"];
    if (!allowedCollections.includes(collection)) {
      return NextResponse.json(
        { error: "Invalid collection name" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection(collection).deleteMany({});

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      collection,
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection");

    if (!collection) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const allowedCollections = ["orders", "menuItems", "categories", "settings"];
    if (!allowedCollections.includes(collection)) {
      return NextResponse.json(
        { error: "Invalid collection name" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const data = await db.collection(collection).find({}).toArray();

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${collection}_export_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting collection:", error);
    return NextResponse.json(
      { error: "Failed to export collection data" },
      { status: 500 }
    );
  }
}
