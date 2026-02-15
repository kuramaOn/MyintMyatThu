# QWEN Restaurant - Deployment Guide

## Prerequisites

- Vercel account
- MongoDB Atlas account (already configured)
- Vercel Blob Storage token (optional, for image uploads)

## Environment Variables

You need to set the following environment variables in Vercel:

```bash
MONGODB_URI="mongodb+srv://Vercel-Admin-MyintMyatThu:pvOfnkxgiTK2Tutp@myintmyatthu.jgwhuag.mongodb.net/?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-production-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-domain.vercel.app"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## Deployment Steps

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project directory**:
   ```bash
   cd qwen-restaurant
   ```

4. **Deploy to preview**:
   ```bash
   vercel
   ```
   - Select your scope/team
   - Link to existing project or create new one
   - Answer the setup questions (use defaults)

5. **Set environment variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add BLOB_READ_WRITE_TOKEN
   ```
   
   Or set them in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable for Production, Preview, and Development

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - QWEN Restaurant"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**:
   - In project settings, add all required environment variables
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

## Post-Deployment Steps

### 1. Seed the Database

After first deployment, you need to seed the database with initial data:

```bash
# Option A: Run locally with production database
MONGODB_URI="your-production-mongodb-uri" npm run seed

# Option B: Use Vercel CLI
vercel env pull .env.local
npm run seed
```

This will create:
- Admin user (admin@qwen.com / QwenAdmin123!)
- Default restaurant settings
- Sample menu items (6 items)
- Categories (Coffee, Tea, Bakery, Dessert, Food)

### 2. Configure Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to "Storage" tab
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to your environment variables

### 3. Update Settings

1. Login to admin dashboard: `https://your-domain.vercel.app/admin/login`
2. Go to Settings page
3. Update:
   - Restaurant information (address, phone, hours)
   - Upload PayPay QR code
   - Verify Messenger username
   - Set preferred currency (MMK or JPY)

### 4. Add Menu Items

1. Go to Menu Management
2. Delete sample items or edit them with real data
3. Upload actual menu item images
4. Set correct prices and availability

## Important Security Notes

### Change Default Admin Password

**CRITICAL**: After first login, create a new admin user and delete the default one:

1. Currently, you need to do this via MongoDB:
   ```javascript
   // In MongoDB Compass or Atlas
   db.users.insertOne({
     email: "your-email@example.com",
     password: "$2a$10$yourHashedPassword", // Use bcrypt to hash
     name: "Your Name",
     role: "admin",
     createdAt: new Date()
   })
   ```

2. Then delete the default admin:
   ```javascript
   db.users.deleteOne({ email: "admin@qwen.com" })
   ```

### Generate Strong NEXTAUTH_SECRET

Use this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Verifying Deployment

### 1. Check Customer Site
- Visit: `https://your-domain.vercel.app`
- Test menu browsing
- Add items to cart
- Go through checkout (don't complete payment)

### 2. Check Admin Dashboard
- Visit: `https://your-domain.vercel.app/admin/login`
- Login with default credentials
- Verify dashboard stats
- Check orders page
- Test menu management
- Verify settings page

### 3. Test Full Order Flow

1. **Place Test Order**:
   - Go to customer site
   - Add items to cart
   - Complete checkout
   - Use Messenger payment (easier for testing)

2. **Verify in Admin**:
   - Check if order appears in "Pending" column
   - Try moving it through the workflow:
     - Accept → Preparing
     - Preparing → Ready
     - Ready → Completed

3. **Check Order Confirmation**:
   - Verify customer can see order status
   - Test order tracking page

## Monitoring

### Check Deployment Logs
```bash
vercel logs <deployment-url>
```

### Monitor in Dashboard
- Go to Vercel dashboard
- Select your project
- View "Deployments" tab for build logs
- Check "Logs" tab for runtime logs

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or whitelist Vercel IP addresses
- Check connection string format

### Image Upload Issues
- Verify BLOB_READ_WRITE_TOKEN is set
- Check Vercel Blob storage is created
- Ensure token has read/write permissions

### Authentication Issues
- Verify NEXTAUTH_SECRET is set (min 32 characters)
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## Performance Optimization

### 1. Enable Caching
The API routes automatically use Next.js caching. For better performance:
- Static pages are pre-rendered at build time
- API routes use on-demand revalidation

### 2. Image Optimization
- All images use Next.js Image component
- Automatic optimization and WebP conversion
- Responsive images for different screen sizes

### 3. Database Indexes
Add indexes in MongoDB for better performance:
```javascript
// In MongoDB
db.orders.createIndex({ orderStatus: 1, createdAt: -1 })
db.orders.createIndex({ orderId: 1 })
db.menuItems.createIndex({ category: 1, available: 1 })
db.menuItems.createIndex({ available: 1, category: 1, name: 1 })
```

## Custom Domain

To add a custom domain:

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update NEXTAUTH_URL environment variable to your custom domain
6. Redeploy

## Backup Strategy

### Database Backups
MongoDB Atlas provides automatic backups. Verify:
1. Go to MongoDB Atlas dashboard
2. Check "Backup" section
3. Ensure continuous backups are enabled

### Manual Backup
```bash
# Export collections
mongodump --uri="your-mongodb-uri" --out=./backup

# Import
mongorestore --uri="your-mongodb-uri" ./backup
```

## Support & Maintenance

### Regular Updates
- Update dependencies monthly: `npm update`
- Check for Next.js updates
- Monitor Vercel announcements

### Security Updates
- Update Node.js to latest LTS
- Keep dependencies up to date
- Regularly rotate NEXTAUTH_SECRET

---

## Quick Reference

### Default Credentials
- **Email**: admin@qwen.com
- **Password**: QwenAdmin123!
- **⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN**

### Key URLs
- **Homepage**: `https://your-domain.vercel.app`
- **Admin**: `https://your-domain.vercel.app/admin/login`
- **API**: `https://your-domain.vercel.app/api/*`

### CLI Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls
```

---

**Deployment Complete!** 🎉

Your QWEN Restaurant system is now live and ready to accept orders.
