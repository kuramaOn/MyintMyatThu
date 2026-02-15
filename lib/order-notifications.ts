// Helper function to send order status notifications

export async function sendOrderNotification(
  orderId: string,
  status: string,
  customerName: string
) {
  const notifications = {
    pending: {
      title: '🎉 Order Received!',
      body: `Thank you ${customerName}! Your order #${orderId} has been received and is being prepared.`
    },
    preparing: {
      title: '👨‍🍳 Order in Progress',
      body: `${customerName}, your order #${orderId} is being prepared by our chef!`
    },
    ready: {
      title: '✅ Order Ready!',
      body: `${customerName}, your order #${orderId} is ready for pickup/delivery!`
    },
    completed: {
      title: '🎊 Order Completed',
      body: `Thank you ${customerName}! We hope you enjoyed your meal. Order #${orderId} is complete.`
    },
    cancelled: {
      title: '❌ Order Cancelled',
      body: `${customerName}, your order #${orderId} has been cancelled. Please contact us for assistance.`
    }
  };

  const notification = notifications[status as keyof typeof notifications];
  
  if (!notification) {
    console.warn(`No notification template for status: ${status}`);
    return;
  }

  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        orderId: orderId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
    } else {
      const result = await response.json();
      console.log('Notification sent:', result);
    }
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
}
