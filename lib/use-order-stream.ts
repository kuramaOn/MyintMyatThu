import { useEffect, useRef } from 'react';

type OrderEventHandler = (event: any) => void;

export function useOrderStream(onEvent: OrderEventHandler) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource('/api/orders/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Real-time order stream connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ignore ping messages
        if (data.type === 'ping' || data.type === 'connected') {
          return;
        }

        // Handle order events
        onEvent(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      eventSource.close();
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Reconnecting to order stream...');
        const newEventSource = new EventSource('/api/orders/stream');
        eventSourceRef.current = newEventSource;
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [onEvent]);

  return eventSourceRef;
}
