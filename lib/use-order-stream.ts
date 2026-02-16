import { useEffect, useRef, useState, useCallback } from 'react';

type OrderEventHandler = (event: any) => void;

export interface OrderStreamStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

export function useOrderStream(onEvent: OrderEventHandler, onStatusChange?: (status: OrderStreamStatus) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<OrderStreamStatus>({
    isConnected: false,
    lastConnected: null,
    reconnectAttempts: 0
  });

  const updateStatus = useCallback((updates: Partial<OrderStreamStatus>) => {
    setStatus(prev => {
      const newStatus = { ...prev, ...updates };
      onStatusChange?.(newStatus);
      return newStatus;
    });
  }, [onStatusChange]);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      try {
        // Create EventSource connection
        const eventSource = new EventSource('/api/orders/stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          if (!isMounted) return;
          console.log('✅ Real-time order stream connected');
          updateStatus({
            isConnected: true,
            lastConnected: new Date(),
            reconnectAttempts: 0
          });
        };

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
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
          if (!isMounted) return;
          console.error('❌ SSE connection error:', error);
          
          setStatus(prev => {
            const newStatus = {
              isConnected: false,
              lastConnected: prev.lastConnected,
              reconnectAttempts: prev.reconnectAttempts + 1
            };
            onStatusChange?.(newStatus);
            return newStatus;
          });

          eventSource.close();
          
          // Reconnect with exponential backoff (max 30 seconds)
          const delay = Math.min(5000 * Math.pow(1.5, status.reconnectAttempts), 30000);
          console.log(`🔄 Reconnecting to order stream in ${delay / 1000}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, delay);
        };
      } catch (error) {
        console.error('Error creating EventSource:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onEvent, updateStatus, status.reconnectAttempts, onStatusChange]);

  return { eventSourceRef, status };
}
