# QuickStart Guide - BookNow

Get your booking system up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- A Google account (for Firebase)
- Git (optional, for deployment)

---

## Part 1: Local Development Setup (5 minutes)

### 1. Install Dependencies

```bash
yarn install
```

### 2. Set Up Firebase (Backend)

**Go to Firebase Console**: https://console.firebase.google.com/

**Quick Steps:**
1. Create project → Name it "booknow-backend"
2. **SKIP** hosting setup (we use Vercel)
3. Add web app → Name it "BookNow Web"
4. Enable Authentication → Email/Password
5. Create Firestore Database → Test mode → Choose location
6. Add security rules (copy from `FIREBASE_SETUP.md` Step 5)
7. Copy your Firebase config values

**Detailed instructions**: See `FIREBASE_SETUP.md`

### 3. Create Environment File

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_value_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_value_here
```

### 4. Start Development Server

```bash
yarn dev
```

Open http://localhost:3000

### 5. Test Your App

1. Click **"Merchant Login"**
2. Sign up with email/password
3. You'll be redirected to the admin dashboard
4. Try adding:
   - Calendar time slots
   - Pricing tiers

✅ **Local setup complete!**

---

## Part 2: Deploy to Vercel (10 minutes)

### Option A: GitHub + Vercel Dashboard (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/
   - Sign in with GitHub
   - Click **"Add New Project"**
   - Import your repository
   - Add environment variables (same as `.env.local`)
   - Click **"Deploy"**

3. **Done!** Your app is live at `https://your-project.vercel.app`

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add your environment variables when prompted
```

---

## What's Included

### Pages

- `/` - Landing page
- `/login` - Merchant authentication
- `/admin` - Dashboard with statistics
- `/admin/calendar` - Manage availability
- `/admin/pricing` - Manage pricing tiers

### Features

✅ Real-time statistics dashboard
✅ Booking management
✅ Calendar availability management
✅ Pricing tier management
✅ Firebase authentication
✅ Firestore database
✅ Dark mode support
✅ Responsive design

---

## Quick Commands

```bash
# Development
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint
```

---

## Architecture

```
┌─────────────────┐
│   Vercel        │  ← Hosting (Frontend)
│   (Next.js)     │
└────────┬────────┘
         │
         │ API calls
         │
┌────────▼────────┐
│   Firebase      │  ← Backend
│                 │
│  • Auth         │  ← User authentication
│  • Firestore    │  ← Database
└─────────────────┘
```

---

## Firestore Collections

Your database will have 3 collections:

1. **`bookings`** - All booking records
2. **`availableSlots`** - Merchant availability schedules
3. **`pricingTiers`** - Service pricing options

All data is scoped by `merchantId` (user's Firebase UID)

---

## Environment Variables

**Required for both local and production:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

⚠️ **Important**:
- All variables MUST start with `NEXT_PUBLIC_`
- Never commit `.env.local` to Git (already in `.gitignore`)
- Add the same variables to Vercel for production

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

**Fix**:
- Create `.env.local` with Firebase config
- Restart dev server

### "Missing or insufficient permissions"

**Fix**:
- Add Firestore security rules
- Make sure you're logged in

### Environment variables not working

**Fix**:
- Variables must start with `NEXT_PUBLIC_`
- Restart server after changes
- Check `.env.local` is in project root

### Page not loading after deployment

**Fix**:
- Add environment variables in Vercel dashboard
- Redeploy the application

---

## Next Steps

- [ ] Customize landing page with your branding
- [ ] Add your business information
- [ ] Configure your pricing tiers
- [ ] Set your availability schedule
- [ ] Test the booking flow
- [ ] Share your Vercel URL with customers

---

## Need More Help?

- **Detailed Firebase Setup**: See `FIREBASE_SETUP.md`
- **Full Documentation**: See `README.md`
- **Firebase Console**: https://console.firebase.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `FIREBASE_SETUP.md` for detailed steps
3. Check Firebase Console for errors
4. Review Vercel deployment logs

---

**Ready to launch?** Follow the steps above and you'll be live in minutes! 🚀
