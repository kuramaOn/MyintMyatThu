import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order } from "@/types";
import { generateOrderId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");

    const db = await getDb();
    const query: any = {};

    if (status) query.orderStatus = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const orders = await db
      .collection<Order>("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();

    const order: Omit<Order, "_id"> = {
      orderId: generateOrderId(),
      customer: body.customer,
      items: body.items,
      total: body.total,
      currency: body.currency,
      paymentMethod: body.paymentMethod,
      paymentProof: body.paymentProof,
      paymentStatus: "pending",
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Order>("orders").insertOne(order as any);

    return NextResponse.json(
      { id: result.insertedId, ...order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
