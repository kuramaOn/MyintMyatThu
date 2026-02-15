import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import webpush from "web-push";

// Configure web-push with VAPID keys (trim to remove any whitespace/newlines)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@qwen.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, orderId, userId } = await request.json();
    
    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Get all active subscriptions (or filter by userId if provided)
    const query = userId ? { userId } : {};
    const subscriptions = await db
      .collection("push_subscriptions")
      .find(query)
      .toArray();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions found",
        sent: 0
      });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-96x96.svg',
      data: {
        orderId,
        url: orderId ? `/orders/${orderId}` : '/',
        timestamp: Date.now()
      },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub.subscription,
          notificationPayload
        );
        return { success: true, endpoint: sub.subscription.endpoint };
      } catch (error: any) {
        console.error("Error sending notification:", error);
        
        // Remove invalid subscriptions (410 = Gone)
        if (error.statusCode === 410) {
          await db.collection("push_subscriptions").deleteOne({
            "subscription.endpoint": sub.subscription.endpoint
          });
        }
        
        return { success: false, endpoint: sub.subscription.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length,
      results
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
