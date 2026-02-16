// Simple in-memory event emitter for order updates
// Note: This works for single-server deployments. For multi-server, use Redis pub/sub.

type OrderEventListener = (data: any) => void;

class OrderEventEmitter {
  private listeners: Set<OrderEventListener> = new Set();

  subscribe(listener: OrderEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(data: any) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in order event listener:', error);
      }
    });
  }

  getListenerCount() {
    return this.listeners.size;
  }
}

export const orderEvents = new OrderEventEmitter();
