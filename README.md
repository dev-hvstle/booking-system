# BookNow - Calendar Booking System

A modern, full-stack calendar booking system built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

**Hosting**: Deployed on Vercel
**Backend**: Firebase (Authentication + Firestore Database only, NO hosting)

## Features

### Landing Page
- Modern, minimalist design
- Responsive layout
- Dark mode support
- Feature showcase
- Statistics display
- Call-to-action sections

### Merchant Admin Panel
- **Authentication**: Secure login/signup with Firebase Auth
- **Dashboard**: Real-time statistics including:
  - Total revenue and monthly revenue
  - Total bookings and monthly bookings
  - Pending, completed, and cancelled bookings
  - Recent bookings table
- **Services Management**:
  - Create and manage services with descriptions, photos, and pricing
  - Set duration and category for each service
  - Activate/deactivate services
  - Service-specific availability tracking
- **Calendar Management**:
  - Configure available time slots by specific date
  - Filter availability by service
  - Assign time slots to specific services or keep general
  - Bulk block date ranges (vacations, holidays, time off)
  - View and manage blocked periods
- **Pricing Management**: Create and manage multiple pricing tiers
- **Profile Settings**:
  - Edit merchant name and business name
  - Upload profile picture and cover picture (Firebase Storage)
  - Add social media links (Facebook, Instagram, Twitter, TikTok, Website)
  - Manage account information
- **Real-time Updates**: All data syncs in real-time with Firestore

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for images)
- **Hosting**: Vercel
- **State Management**: React Context API
- **Real-time Data**: Firebase Realtime Listeners

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Firebase Setup (Backend Only - No Hosting)

**Important**: We're using Firebase for Authentication, Database, and Storage. Hosting is handled by Vercel.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it whatever you like, e.g., "booknow-backend")
3. **SKIP** Firebase Hosting setup - we don't need it
4. Enable Authentication (Email/Password method)
5. Create a Firestore Database
6. Enable Firebase Storage (for profile/cover images)
   - Go to Storage in the Firebase Console
   - Click "Get Started"
   - Choose "Start in production mode" or "Start in test mode" (you'll set rules later)
7. Copy your Firebase configuration

See detailed step-by-step instructions in the [Firebase Setup Guide](#detailed-firebase-setup-guide) section below.

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Database Structure

The application uses the following Firestore collections:

#### `bookings`
```typescript
{
  id: string;
  merchantId: string;        // User UID from Firebase Auth
  customerName: string;
  customerEmail: string;
  date: Timestamp;
  time: string;              // HH:mm format
  duration: number;          // in minutes
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Timestamp;
}
```

#### `availableSlots`
```typescript
{
  id: string;
  merchantId: string;        // User UID from Firebase Auth
  serviceId?: string;        // Optional: if set, slot is only for this service
  date: Timestamp;           // Specific date for this availability
  startTime: string;         // HH:mm format
  endTime: string;           // HH:mm format
  isActive: boolean;
  isRecurring?: boolean;     // If true, repeats weekly on this day
}
```

#### `pricingTiers`
```typescript
{
  id: string;
  merchantId: string;        // User UID from Firebase Auth
  name: string;
  duration: number;          // in minutes
  price: number;
  description: string;
  isActive: boolean;
}
```

#### `blockedPeriods`
```typescript
{
  id: string;
  merchantId: string;        // User UID from Firebase Auth
  startDate: Timestamp;      // Start of blocked period
  endDate: Timestamp;        // End of blocked period
  reason?: string;           // Optional reason (e.g., "Vacation", "Holiday")
  createdAt: Timestamp;
}
```

#### `services`
```typescript
{
  id: string;
  merchantId: string;        // User UID from Firebase Auth
  name: string;              // Service name (e.g., "Premium Haircut")
  description: string;       // Detailed description
  photos: string[];          // Array of image URLs
  price: number;             // Service price
  duration: number;          // Duration in minutes
  category?: string;         // Optional category (e.g., "Hair", "Spa")
  isActive: boolean;
  createdAt: Timestamp;
}
```

#### `merchants`
```typescript
{
  id: string;                // User UID from Firebase Auth (document ID)
  email: string;             // Merchant email
  name: string;              // Merchant/owner name
  businessName: string;      // Business/shop name
  profilePicture?: string;   // Profile picture URL from Firebase Storage (optional)
  coverPicture?: string;     // Cover picture URL from Firebase Storage (optional)
  facebook?: string;         // Facebook page URL (optional)
  instagram?: string;        // Instagram profile URL (optional)
  twitter?: string;          // Twitter/X profile URL (optional)
  tiktok?: string;           // TikTok profile URL (optional)
  website?: string;          // Personal/business website URL (optional)
  createdAt: Timestamp;
  updatedAt?: Timestamp;     // Last update timestamp (optional)
}
```

### 5. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings - merchants can only read/write their own bookings
    match /bookings/{booking} {
      allow read, write: if request.auth != null &&
                         resource.data.merchantId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Available Slots - merchants can only manage their own slots
    match /availableSlots/{slot} {
      allow read, write: if request.auth != null &&
                         resource.data.merchantId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Pricing Tiers - merchants can only manage their own tiers
    match /pricingTiers/{tier} {
      allow read, write: if request.auth != null &&
                         resource.data.merchantId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Blocked Periods - merchants can only manage their own blocked periods
    match /blockedPeriods/{period} {
      allow read, write: if request.auth != null &&
                         resource.data.merchantId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Services - merchants can only manage their own services
    match /services/{service} {
      allow read, write: if request.auth != null &&
                         resource.data.merchantId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Merchants - users can only read/write their own profile
    match /merchants/{userId} {
      allow read, write: if request.auth != null &&
                         request.auth.uid == userId;
    }
  }
}
```

### 6. Firebase Storage Rules

Add these security rules to your Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Merchants folder - users can only upload to their own folder
    match /merchants/{userId}/{allPaths=**} {
      allow read: if true; // Anyone can read (for displaying images)
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Run the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
booking-system/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── calendar/       # Calendar management
│   │   ├── pricing/        # Pricing management
│   │   └── page.tsx        # Dashboard
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── AdminNav.tsx        # Admin navigation
│   └── Providers.tsx       # Context providers
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── hooks/
│   ├── useAvailability.ts  # Calendar management hook
│   ├── useBookings.ts      # Bookings data hook
│   ├── usePricing.ts       # Pricing management hook
│   └── useStats.ts         # Statistics calculation hook
├── lib/
│   └── firebase.ts         # Firebase configuration
└── types/
    └── index.ts            # TypeScript types
```

## Usage

### For Merchants

1. **Sign Up/Login**: Navigate to `/login` to create an account or sign in
2. **Dashboard**: View your booking statistics and recent bookings
3. **Services Management**:
   - Go to the Services tab
   - Add services with name, description, photos (URLs), pricing, and duration
   - Set optional categories for organization
   - Activate/deactivate services as needed
   - Edit or delete services
4. **Calendar Management**:
   - Go to the Calendar tab
   - Filter calendar view by service (or view all services)
   - Add available time slots for specific dates
   - Optionally assign slots to specific services or keep general
   - Activate/deactivate or delete slots as needed
   - Use "Block Dates" to block date ranges (vacations, holidays)
   - View and manage all blocked periods in the sidebar
5. **Pricing Management**:
   - Go to the Pricing tab
   - Create pricing tiers with different durations and prices
   - Edit, activate/deactivate, or delete tiers

### Available Routes

- `/` - Landing page
- `/login` - Merchant login/signup
- `/admin` - Dashboard (protected)
- `/admin/services` - Services management (protected)
- `/admin/calendar` - Calendar management (protected)
- `/admin/pricing` - Pricing management (protected)

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [Vercel](https://vercel.com/)
3. Sign in with GitHub
4. Click **"Add New Project"**
5. Import your repository
6. Vercel will auto-detect Next.js settings
7. Add environment variables:
   - Click **"Environment Variables"**
   - Add each variable from your `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
8. Click **"Deploy"**

Your app will be live at: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add your environment variables when asked
```

### Important Notes for Vercel Deployment

- All environment variables **MUST** start with `NEXT_PUBLIC_` to be accessible in the browser
- Add all Firebase config variables in Vercel's Environment Variables section
- Vercel will automatically detect and optimize your Next.js app
- Environment variables are encrypted and secure in Vercel

## Detailed Firebase Setup Guide

### Step 1: Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "booknow-backend")
4. Click **Continue**
5. Disable Google Analytics (optional, not needed for this app)
6. Click **Create project**
7. Wait for setup to complete, then click **Continue**

### Step 2: Register Web App

1. On the project overview page, click the **Web icon** (`</>`)
2. Enter app nickname (e.g., "BookNow Web")
3. ⚠️ **DO NOT** check "Also set up Firebase Hosting" - we're using Vercel!
4. Click **Register app**
5. Copy the `firebaseConfig` object (keep this page open)
6. Click **Continue to console**

### Step 3: Enable Email/Password Authentication

1. In left sidebar: **Build** → **Authentication**
2. Click **Get started**
3. Click **Sign-in method** tab
4. Click **Email/Password**
5. Enable the first toggle (Email/Password)
6. Click **Save**

### Step 4: Create Firestore Database

1. In left sidebar: **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules next)
4. Click **Next**
5. Choose your location (closest to your users)
6. Click **Enable**

### Step 5: Add Security Rules

1. Click the **Rules** tab in Firestore
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings - merchants can only access their own bookings
    match /bookings/{booking} {
      allow read: if request.auth != null &&
                  (resource.data.merchantId == request.auth.uid ||
                   !exists(/databases/$(database)/documents/bookings/$(booking)));
      allow write: if request.auth != null &&
                   request.resource.data.merchantId == request.auth.uid;
    }

    // Available Slots - merchants can only manage their own slots
    match /availableSlots/{slot} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.resource.data.merchantId == request.auth.uid;
    }

    // Pricing Tiers - merchants can only manage their own tiers
    match /pricingTiers/{tier} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.resource.data.merchantId == request.auth.uid;
    }

    // Blocked Periods - merchants can only manage their own blocked periods
    match /blockedPeriods/{period} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.resource.data.merchantId == request.auth.uid;
    }

    // Services - merchants can only manage their own services
    match /services/{service} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.resource.data.merchantId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

### Step 6: Get Configuration Values

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll to **"Your apps"** section
4. Under **SDK setup and configuration**, select **Config**
5. Copy the values to your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 7: Test Locally

```bash
# Make sure you have .env.local with your Firebase config
yarn dev

# Visit http://localhost:3000
# Click "Merchant Login" and create an account
```

### Common Issues

**"Firebase: Error (auth/configuration-not-found)"**
- Check that `.env.local` exists with correct values
- Restart dev server after creating `.env.local`

**"Missing or insufficient permissions"**
- Verify Firestore security rules are published
- Make sure you're logged in when accessing data

**Environment variables not loading**
- All variables must start with `NEXT_PUBLIC_`
- Restart dev server after changes

## Features to Implement (Future)

- Customer booking interface
- Email notifications
- Payment integration (Stripe)
- Calendar sync (Google Calendar, Outlook)
- Booking confirmation workflow
- Analytics dashboard with charts
- Multi-language support
- Custom domain for booking pages
- Mobile app

## License

MIT
