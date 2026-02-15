import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { Order, OrderStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    
    // Try to find by orderId first, then by _id
    let order = await db.collection<Order>("orders").findOne({ orderId: id });
    
    if (!order && ObjectId.isValid(id)) {
      order = await db.collection<Order>("orders").findOne({ _id: new ObjectId(id) });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

async function updateOrder(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle status change
    if (body.orderStatus) {
      updateData.orderStatus = body.orderStatus;
      updateData.$push = {
        statusHistory: {
          status: body.orderStatus,
          timestamp: new Date(),
          note: body.statusNote,
        },
      };

      if (body.orderStatus === "completed") {
        updateData.completedAt = new Date();
      }
    }

    // Handle payment status change
    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
    }

    const { $push, ...setData } = updateData;
    const update: any = { $set: setData };
    if ($push) update.$push = $push;

    const result = await db.collection<Order>("orders").updateOne(
      { _id: new ObjectId(id) },
      update
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateOrder(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateOrder(request, params);
}
