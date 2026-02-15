import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Category } from "@/types";

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection<Category>("categories")
      .find()
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    // Get the highest order number
    const lastCategory = await db
      .collection<Category>("categories")
      .find()
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const newOrder = lastCategory.length > 0 ? (lastCategory[0].order || 0) + 1 : 1;

    const category: Omit<Category, "_id"> = {
      name: body.name,
      description: body.description || "",
      imageUrl: body.imageUrl || "",
      order: newOrder,
      visible: body.visible !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Category>("categories").insertOne(category as any);

    return NextResponse.json(
      { id: result.insertedId, ...category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
