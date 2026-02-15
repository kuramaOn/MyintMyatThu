import { NextResponse } from "next/server";
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
