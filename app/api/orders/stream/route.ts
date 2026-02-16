import { NextRequest } from "next/server";
import { orderEvents } from "@/lib/order-events";

// This endpoint provides Server-Sent Events for real-time order updates
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(data));
      
      // Subscribe to order events
      const unsubscribe = orderEvents.subscribe((event) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      });
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'ping' })}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds
      
      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
