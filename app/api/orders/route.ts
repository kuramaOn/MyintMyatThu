import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Order } from "@/types";
import { generateOrderId } from "@/lib/utils";
import { sendOrderNotification } from "@/lib/order-notifications";
import { orderEvents } from "@/lib/order-events";

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

    // Check stock availability and update quantities
    const menuItemsCollection = db.collection("menuItems");
    
    for (const item of body.items) {
      const menuItem = await menuItemsCollection.findOne({ 
        _id: typeof item.menuItemId === 'string' 
          ? new (await import('mongodb')).ObjectId(item.menuItemId)
          : item.menuItemId 
      });

      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item not found: ${item.name}` },
          { status: 400 }
        );
      }

      // Check if item has stock tracking enabled
      if (menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
        const remainingStock = (menuItem.stockQuantity || 0) - (menuItem.quantitySold || 0);
        
        if (remainingStock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.name}. Only ${remainingStock} available.` },
            { status: 400 }
          );
        }

        // Update quantity sold
        const newQuantitySold = (menuItem.quantitySold || 0) + item.quantity;
        const newRemainingStock = menuItem.stockQuantity - newQuantitySold;

        // Auto-mark as unavailable if stock reaches 0
        const shouldMarkUnavailable = newRemainingStock <= 0;

        await menuItemsCollection.updateOne(
          { _id: menuItem._id },
          {
            $set: {
              quantitySold: newQuantitySold,
              available: shouldMarkUnavailable ? false : menuItem.available,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

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

    // Emit real-time event for instant notification
    orderEvents.emit({
      type: 'new-order',
      order: { ...order, _id: result.insertedId }
    });

    // Send push notification for new order
    sendOrderNotification(
      order.orderId,
      "pending",
      order.customer.name
    ).catch(error => {
      console.error("Failed to send new order notification:", error);
    });

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
