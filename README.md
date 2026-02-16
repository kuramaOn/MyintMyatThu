# QWEN Restaurant - Luxury Ordering System

A premium restaurant ordering system built with Next.js 14, featuring a beautiful UI, real-time order management, and multiple payment options.

## Features

### Customer-Facing
- 🏠 Elegant homepage with hero section
- 🍽️ Menu browsing with category filtering
- 🛒 Shopping cart with quantity controls
- 💳 Checkout with PayPay and Messenger payment options
- 📋 Order confirmation and tracking
- 📱 Fully responsive mobile design

### Admin Dashboard
- 🔐 Secure authentication with NextAuth.js
- 📊 Dashboard with real-time statistics
- 📦 Kanban board for order management
- 🍕 Menu item CRUD operations
- ⚙️ Comprehensive settings (Restaurant info, Payment, Currency, Notifications)
- 💰 Revenue tracking and analytics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Animations:** Framer Motion
- **Database:** MongoDB Atlas
- **Authentication:** NextAuth.js
- **File Storage:** Vercel Blob Storage
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   MONGODB_URI="your-mongodb-uri"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:6001"
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
   VAPID_PRIVATE_KEY="your-vapid-private-key"
   ```
   
   Generate VAPID keys for push notifications:
   ```bash
   node scripts/generate-vapid-keys.js
   ```

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials

- **Email:** admin@qwen.com
- **Password:** QwenAdmin123!

## Project Structure

```
qwen-restaurant/
├── app/
│   ├── (customer)/          # Customer-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── menu/            # Menu page
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout process
│   │   └── orders/[id]/     # Order confirmation
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx         # Dashboard
│   │   ├── login/           # Admin login
│   │   ├── orders/          # Order management
│   │   ├── menu/            # Menu management
│   │   └── settings/        # Settings
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── customer/            # Customer components
│   ├── admin/               # Admin components
│   └── shared/              # Shared components
├── lib/                     # Utilities and configs
├── types/                   # TypeScript types
└── contexts/                # React contexts
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Features Checklist

### Customer Side
- ✅ Homepage with hero section
- ✅ Menu browsing with categories
- ✅ Add to cart functionality
- ✅ Shopping cart management
- ✅ Checkout flow
- ✅ Payment method selection (PayPay/Messenger)
- ✅ PayPay QR display & screenshot upload
- ✅ Messenger redirect flow
- ✅ Order confirmation page
- ✅ Order tracking with status updates
- ✅ Mobile responsive design
- ✅ Smooth animations throughout

### Admin Side
- ✅ Login/authentication
- ✅ Dashboard with statistics
- ✅ Order management (Kanban board)
- ✅ Payment verification
- ✅ Menu item CRUD
- ✅ Image upload for menu items
- ✅ Settings page (4 tabs)
- ✅ Currency switcher (MMK/JPY)
- ✅ Real-time updates (polling)
- ✅ Desktop notifications support
- ✅ Daily analytics

### Technical
- ✅ MongoDB connection
- ✅ API routes (RESTful)
- ✅ Image upload (Vercel Blob)
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ TypeScript strict mode
- ✅ Responsive design
- ✅ SEO optimization

## Color Palette

- **Primary (Gold):** #D4AF37, #F4E4C1
- **Secondary (Navy):** #1a1a2e, #16213e
- **Accent (Cream):** #FAF9F6, #FFFFF0
- **Success:** #2d6a4f
- **Error:** #c1121f

## Typography

- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Monospace:** JetBrains Mono (order IDs)

## Support

For issues or questions, please contact the development team.

## License

Proprietary - All rights reserved.
