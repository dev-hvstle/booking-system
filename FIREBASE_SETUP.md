# Firebase Setup Guide for BookNow

**Important**: We are using Firebase ONLY for Authentication and Database. The application is hosted on Vercel.

## Quick Overview

- ✅ Firebase Authentication (Email/Password)
- ✅ Firebase Firestore Database
- ❌ NO Firebase Hosting (we use Vercel)
- ❌ NO Firebase Storage
- ❌ NO Firebase Functions

---

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., `booknow-backend`)
4. Click **Continue**
5. **Disable Google Analytics** (not needed for this app)
6. Click **Create project**
7. Wait for the project to be created
8. Click **Continue**

---

### 2. Register Your Web Application

1. On the Firebase project dashboard, click the **Web icon** (`</>`)
2. Register app:
   - App nickname: `BookNow Web App`
   - ⚠️ **IMPORTANT**: **DO NOT** check "Also set up Firebase Hosting"
3. Click **Register app**
4. You'll see your Firebase config - **KEEP THIS PAGE OPEN** (we'll copy values later)
5. Click **Continue to console**

---

### 3. Enable Email/Password Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

✅ Authentication is now enabled!

---

### 4. Create Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **"Start in test mode"** (we'll add security rules in the next step)
4. Click **Next**
5. Choose a Cloud Firestore location:
   - For US users: `us-central1` or `us-east1`
   - For EU users: `europe-west1`
   - Choose the closest region to your users
6. Click **Enable**
7. Wait for database creation to complete

---

### 5. Add Firestore Security Rules

**Important**: Test mode rules expire after 30 days. Add proper security rules now.

1. In Firestore Database, click the **Rules** tab
2. **Delete** the existing test rules
3. **Paste** these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the resource
    function isOwner(merchantId) {
      return request.auth.uid == merchantId;
    }

    // Bookings Collection
    match /bookings/{bookingId} {
      // Merchants can read their own bookings
      allow read: if isAuthenticated() && isOwner(resource.data.merchantId);

      // Merchants can create bookings for themselves
      // Anyone can create a booking (for customer-facing booking form in the future)
      allow create: if isAuthenticated() ||
                    (request.resource.data.merchantId is string &&
                     request.resource.data.customerEmail is string);

      // Only the merchant can update/delete their bookings
      allow update, delete: if isAuthenticated() && isOwner(resource.data.merchantId);
    }

    // Available Slots Collection
    match /availableSlots/{slotId} {
      // Anyone can read slots (for public booking page)
      allow read: if true;

      // Only authenticated merchants can create slots for themselves
      allow create: if isAuthenticated() && isOwner(request.resource.data.merchantId);

      // Only the owner can update/delete slots
      allow update, delete: if isAuthenticated() && isOwner(resource.data.merchantId);
    }

    // Pricing Tiers Collection
    match /pricingTiers/{tierId} {
      // Anyone can read pricing (for public booking page)
      allow read: if true;

      // Only authenticated merchants can create tiers for themselves
      allow create: if isAuthenticated() && isOwner(request.resource.data.merchantId);

      // Only the owner can update/delete tiers
      allow update, delete: if isAuthenticated() && isOwner(resource.data.merchantId);
    }
  }
}
```

4. Click **Publish**

✅ Your database is now secure!

---

### 6. Get Your Firebase Configuration

1. Click the **⚙️ gear icon** next to "Project Overview" in the left sidebar
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. You should see your web app listed
5. Under **"SDK setup and configuration"**, select **Config** (not npm)
6. Copy the configuration object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

### 7. Configure Your Local Environment

1. In your project root directory, copy the example file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in your editor

3. Fill in the values from your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

4. **Save** the file

⚠️ **Important**: The `.env.local` file is already in `.gitignore` and will NOT be committed to Git.

---

### 8. Test Your Setup

1. Start the development server:

```bash
yarn dev
```

2. Open your browser to **http://localhost:3000**

3. Click **"Merchant Login"** in the navigation

4. **Create a test account**:
   - Email: `test@example.com`
   - Password: `test1234` (min 6 characters)
   - Click **Sign Up**

5. If successful, you'll be redirected to the admin dashboard! 🎉

---

### 9. Verify in Firebase Console

**Check Authentication:**
1. Go to Firebase Console → **Authentication** → **Users** tab
2. You should see your test account listed

**Check Firestore:**
1. Go to Firebase Console → **Firestore Database** → **Data** tab
2. Try adding a pricing tier or time slot in your app
3. You should see the data appear in Firestore immediately

---

## For Vercel Deployment

When deploying to Vercel, you need to add the same environment variables:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Make sure to add them for **Production**, **Preview**, and **Development** environments
5. Redeploy your app

---

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

**Solution:**
- Make sure `.env.local` exists in your project root
- Check that all environment variables are correctly spelled
- Restart your development server: Stop it and run `yarn dev` again

---

### Error: "Missing or insufficient permissions"

**Solution:**
- Go to Firestore → Rules tab
- Make sure the security rules are published
- Make sure you're logged in when trying to access data
- Check that `merchantId` in your data matches your user UID

---

### Environment Variables Not Loading

**Solution:**
- All Firebase variables MUST start with `NEXT_PUBLIC_`
- Restart your dev server after creating or modifying `.env.local`
- Make sure `.env.local` is in the root directory (same level as `package.json`)

---

### Can't See Data in Firestore

**Solution:**
- Make sure you're logged in to the app
- Check Firestore security rules are correct
- Look at browser console for errors
- Verify `merchantId` is being set correctly (should be your user UID)

---

## Next Steps

✅ Firebase setup complete!

You can now:
- Create merchant accounts
- Manage bookings, calendar slots, and pricing
- See real-time updates in the admin panel
- Deploy to Vercel with the same configuration

---

## Important Reminders

- 🔒 Never commit `.env.local` to Git (it's already in `.gitignore`)
- 🚀 Firebase is only for backend (Auth + Database)
- 🌐 Vercel handles all hosting
- 📊 All data syncs in real-time via Firestore listeners
- 🔐 Security rules are enforced by Firebase, not your app code

---

Need help? Check the main README.md for more information!
