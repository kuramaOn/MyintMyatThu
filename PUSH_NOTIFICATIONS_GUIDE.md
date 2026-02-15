# 🔔 Push Notifications Guide

Your QWEN Restaurant app now has **real-time push notifications** for order updates!

---

## 🎉 What's New?

✅ **Real-time Order Updates** - Customers get notified when order status changes  
✅ **Automatic Notifications** - No manual sending required  
✅ **Multiple Status Types** - Pending, Preparing, Ready, Completed, Cancelled  
✅ **Cross-platform Support** - Works on iOS, Android, Desktop  
✅ **Actionable Notifications** - Click to view order details  
✅ **Smart Subscription Management** - Auto-cleanup of expired subscriptions  

---

## 📱 How It Works

### For Customers:

1. **Visit the website** on any device
2. **Wait 5 seconds** - A notification permission prompt appears
3. **Click "Enable Notifications"** - Grant permission
4. **Place an order** - You'll get notifications at each stage!

### Notification Timeline:

| Order Status | Notification | When |
|-------------|-------------|------|
| 🆕 **Pending** | "Order Received!" | Order placed |
| 👨‍🍳 **Preparing** | "Order in Progress" | Admin changes to preparing |
| ✅ **Ready** | "Order Ready!" | Admin marks as ready |
| 🎊 **Completed** | "Order Completed" | Order delivered/picked up |
| ❌ **Cancelled** | "Order Cancelled" | Order cancelled |

---

## 🔧 Technical Details

### Architecture:

```
Customer Device
    ↓ (Subscribe)
Service Worker ← → MongoDB (Subscriptions)
    ↓ (Receive)
Push Notification
    ↓ (Click)
Order Details Page
```

### Components Created:

1. **API Endpoints:**
   - `/api/notifications/subscribe` - Subscribe/unsubscribe to push
   - `/api/notifications/send` - Send notifications to subscribers

2. **Libraries:**
   - `lib/push-notifications.ts` - Client-side push helpers
   - `lib/order-notifications.ts` - Order notification templates

3. **UI Components:**
   - `components/shared/notification-permission.tsx` - Permission prompt

4. **Service Worker:**
   - `public/sw.js` - Handles push events and notification clicks

---

## 🚀 Features

### 1. **Automatic Notifications**

Notifications are sent automatically when:
- New order is created → "Order Received"
- Admin updates status → Status-specific message
- No manual intervention needed!

### 2. **Smart Templates**

Each status has a personalized message:
```typescript
{
  pending: "Thank you John! Your order #A1B2C3 has been received...",
  preparing: "John, your order #A1B2C3 is being prepared...",
  ready: "John, your order #A1B2C3 is ready for pickup!",
  // ... etc
}
```

### 3. **Click Actions**

- **View Order** - Opens order details page
- **Close** - Dismisses notification
- Auto-focus if app already open

### 4. **Subscription Management**

- Stored in MongoDB `push_subscriptions` collection
- Auto-cleanup of invalid/expired subscriptions
- Per-user subscription tracking (future)

---

## 💻 For Developers

### Testing Push Notifications:

#### 1. Subscribe to Notifications:
```typescript
import { subscribeToPushNotifications } from '@/lib/push-notifications';

// Subscribe current user
const subscription = await subscribeToPushNotifications();
```

#### 2. Send Test Notification:
```bash
curl -X POST https://qwen-restaurant.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test!",
    "orderId": "TEST123"
  }'
```

#### 3. Send Order Update Notification:
```typescript
import { sendOrderNotification } from '@/lib/order-notifications';

await sendOrderNotification(
  orderId,      // "A1B2C3"
  status,       // "preparing"
  customerName  // "John Doe"
);
```

### Environment Variables:

```bash
# Public key (visible to clients)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BE2HMT9nYfZTh69zTBDYXbG-h47wBH..."

# Private key (server-side only)
VAPID_PRIVATE_KEY="7AlpRRjSkgsQISSxOgEET-a-AIWwy..."
```

### Generate New VAPID Keys:

```bash
cd qwen-restaurant
node scripts/generate-vapid-keys.js
```

---

## 🌐 Browser Support

| Browser | Push Notifications | Service Worker |
|---------|-------------------|----------------|
| ✅ Chrome 67+ | Yes | Yes |
| ✅ Edge 79+ | Yes | Yes |
| ✅ Firefox 44+ | Yes | Yes |
| ✅ Safari 16+ | Yes (macOS 13+) | Yes |
| ✅ iOS Safari 16.4+ | Yes | Yes |
| ✅ Samsung Internet | Yes | Yes |

---

## 🎯 Notification Workflow

### Customer Side:

```
1. Visit website
   ↓
2. See permission prompt (5s delay)
   ↓
3. Click "Enable Notifications"
   ↓
4. Grant browser permission
   ↓
5. Subscription saved to database
   ↓
6. Ready to receive notifications!
```

### Admin Side:

```
1. Customer places order
   ↓
2. Auto-notification sent (Pending)
   ↓
3. Admin updates status in dashboard
   ↓
4. Auto-notification sent (new status)
   ↓
5. Customer receives & clicks notification
   ↓
6. Opens order details page
```

---

## 📊 Database Schema

### Collection: `push_subscriptions`

```json
{
  "_id": ObjectId("..."),
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BG3d...",
      "auth": "xyz..."
    }
  },
  "userId": "customer123",  // Optional - for future
  "createdAt": ISODate("2026-02-15T20:00:00Z"),
  "updatedAt": ISODate("2026-02-15T20:00:00Z")
}
```

---

## 🔐 Security

### VAPID Keys:
- **Public Key** - Safe to expose (sent to clients)
- **Private Key** - Must be kept secret (server-side only)
- Keys are Base64 URL-safe encoded
- Used for authentication with push services

### Best Practices:
- ✅ VAPID keys stored in environment variables
- ✅ HTTPS required for service workers
- ✅ User consent required before subscribing
- ✅ Subscriptions validated before sending
- ✅ Expired subscriptions auto-removed

---

## 🎨 Customization

### Change Notification Templates:

Edit `lib/order-notifications.ts`:

```typescript
const notifications = {
  pending: {
    title: '🎉 Your Custom Title',
    body: `Custom message for ${customerName}`
  },
  // ... add more statuses
};
```

### Change Notification Behavior:

Edit `public/sw.js`:

```javascript
const options = {
  body: data.body,
  icon: '/icons/icon-192x192.svg',
  badge: '/icons/icon-96x96.svg',
  vibrate: [200, 100, 200],  // Vibration pattern
  requireInteraction: true,   // Keep notification visible
  // ... more options
};
```

### Change Permission Prompt Delay:

Edit `components/shared/notification-permission.tsx`:

```typescript
setTimeout(() => {
  setShowPrompt(true)
}, 5000) // Change from 5 seconds to whatever you want
```

---

## 🐛 Troubleshooting

### Notifications not working?

1. **Check browser support:**
   ```javascript
   console.log('Push supported:', 'PushManager' in window);
   console.log('Service Worker supported:', 'serviceWorker' in navigator);
   ```

2. **Check permission:**
   ```javascript
   console.log('Permission:', Notification.permission);
   // Should be "granted"
   ```

3. **Check subscription:**
   ```javascript
   const registration = await navigator.serviceWorker.ready;
   const subscription = await registration.pushManager.getSubscription();
   console.log('Subscription:', subscription);
   ```

4. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Should see registered service worker
   - Check for errors in console

5. **Check VAPID keys:**
   - Verify keys are set in Vercel environment variables
   - Keys should not have newlines or extra whitespace
   - Public key should start with "B" (Base64)

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Permission denied" | User needs to reset site permissions |
| "Service worker not registered" | Check HTTPS and sw.js path |
| "No subscriptions found" | User hasn't enabled notifications yet |
| "Invalid VAPID key" | Regenerate keys and update env vars |
| "Notification not appearing" | Check Do Not Disturb / Focus mode |

---

## 📈 Analytics & Monitoring

### Track Notification Performance:

```typescript
// In /api/notifications/send
const results = await Promise.all(sendPromises);
console.log('Sent:', results.filter(r => r.success).length);
console.log('Failed:', results.filter(r => !r.success).length);
```

### Monitor Subscriptions:

```bash
# Count active subscriptions
db.push_subscriptions.countDocuments()

# View recent subscriptions
db.push_subscriptions.find().sort({ createdAt: -1 }).limit(10)

# Clean up old subscriptions
db.push_subscriptions.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})
```

---

## 🚀 Future Enhancements

Possible improvements:

- [ ] **User-specific notifications** - Only notify the order creator
- [ ] **Admin notifications** - Notify admin of new orders
- [ ] **Notification preferences** - Let users choose which notifications to receive
- [ ] **Rich notifications** - Add images, action buttons
- [ ] **Notification history** - Store notification log in database
- [ ] **A/B testing** - Test different notification messages
- [ ] **Analytics dashboard** - Track notification delivery rates
- [ ] **Email fallback** - Send email if push fails
- [ ] **SMS integration** - Backup notification channel

---

## 🎉 Success!

Your QWEN Restaurant app now has fully functional push notifications!

### Test It:

1. Visit https://qwen-restaurant.vercel.app
2. Enable notifications when prompted
3. Place a test order
4. Watch the notifications arrive! 🔔

---

## 📞 Support

If you need help:
- Check service worker logs in DevTools
- Verify VAPID keys are correct
- Test in incognito mode for fresh start
- Check MongoDB for subscriptions

**Push notifications are live and ready to engage your customers!** 🎊
