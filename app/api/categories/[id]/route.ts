import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Category } from "@/types";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const category = await db.collection<Category>("categories").findOne({
      _id: new ObjectId(id),
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    const updateData: Partial<Category> = {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      order: body.order,
      visible: body.visible,
      updatedAt: new Date(),
    };

    const result = await db.collection<Category>("categories").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // Check if category is being used by menu items
    const menuItemsUsingCategory = await db
      .collection("menuItems")
      .countDocuments({ category: (await db.collection<Category>("categories").findOne({ _id: new ObjectId(id) }))?.name });

    if (menuItemsUsingCategory > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${menuItemsUsingCategory} menu item(s).` },
        { status: 400 }
      );
    }

    const result = await db.collection<Category>("categories").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
