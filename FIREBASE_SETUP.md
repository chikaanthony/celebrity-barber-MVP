# Firebase Integration Guide

## Overview
Your Celebrity Barber app is now integrated with Firebase for:
- ✅ User authentication (Email/Password)
- ✅ Firestore database (Users, notifications, announcements, testimonials, approvals, referrals)
- ✅ Real-time data synchronization
- ✅ Secure backend with authentication rules

## Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"** or select an existing project
3. Enter your project name (e.g., "celebrity-barber")
4. Accept Firebase terms and click **Create Project**
5. Wait for the project to initialize

## Step 2: Get Your Firebase Credentials

1. In Firebase Console, go to **Project Settings** (⚙️ icon top-left)
2. Select the **"Your apps"** section
3. Under **Web app**, click the **</>** icon to register a web app
4. Follow the setup wizard and copy your config object
5. You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```

## Step 3: Update firebase.config.ts

Open `firebase.config.ts` in your project and replace the placeholder values:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // From Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Getting started** or go to **Sign-in method**
3. Enable **Email/Password** provider
4. Click **Save**

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (development) or **Start in production mode**
   - **Test mode**: Allows read/write for 30 days (good for development)
   - **Production mode**: Requires security rules (we'll set these up)
4. Select your region (closest to your users)
5. Click **Enable**

## Step 6: Set Up Firestore Security Rules (Optional but Recommended)

For **production mode**, update your security rules:

1. Go to **Firestore Database** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if true; // Anyone can read user profiles
    }
    
    // Anyone can read public data
    match /announcements/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null; // Only logged-in users
    }
    
    match /testimonials/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
    
    match /notifications/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
    
    match /approvalRequests/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid != null;
    }
    
    match /referrals/{document=**} {
      allow read, write: if request.auth.uid == resource.data.referrerId;
    }
    
    match /conversations/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId || request.auth.uid == 'admin';
    }
  }
}
```

3. Click **Publish**

## Step 7: Install Dependencies

Run in your project directory:

```bash
npm install
```

This will install all required packages including Firebase.

## Step 8: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click **"Join"** or **"Login"** in the app
3. Create a new account with email/password
4. You should see your user added to Firestore

## Project Structure

```
├── firebase.config.ts          # Firebase credentials (keep secret!)
├── services/firebase.ts        # Firebase functions (auth, Firestore)
├── App.tsx                     # Integrated with Firebase
└── components/
    ├── Login.tsx              # Can be updated for password signup
    ├── ClientDashboard.tsx
    ├── AdminPortal.tsx
    └── ...
```

## Available Firebase Functions

**Authentication:**
- `registerUser(email, password, name)` - Sign up new users
- `loginUser(email, password)` - Sign in existing users
- `logoutUser()` - Sign out
- `getCurrentUser()` - Get current Firebase user
- `getUserProfile(userId)` - Fetch user data from Firestore

**Data Operations:**
- `getAllUsers()` - Get all user profiles
- `updateUserProfile(userId, updates)` - Update user data
- `getNotifications()`, `addNotification()` - Manage notifications
- `getAnnouncements()`, `addAnnouncement()` - Manage announcements
- `getTestimonials()`, `addTestimonial()` - Manage testimonials
- `getApprovalRequests()`, `addApprovalRequest()` - Manage approvals
- `getReferrals()`, `addReferral()` - Manage referrals
- `getConversations()`, `addConversation()` - Manage conversations

## Important Security Notes

⚠️ **Never commit your firebase.config.ts to git if it contains real credentials!**

Add to `.gitignore`:
```
firebase.config.ts
.env.local
```

For production, use environment variables:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# etc...
```

Then import from `.env`:
```typescript
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // etc...
};
```

## Troubleshooting

**"Firebase config not valid" error:**
- Make sure you copied all 6 fields from Firebase Console correctly
- Check for trailing spaces or typos

**"Permission denied" on Firestore operations:**
- Check your security rules (if using production mode)
- Make sure user is authenticated (check browser DevTools > Network)
- Create the collection manually if it doesn't exist

**CORS errors:**
- This is normal with Firebase
- Make sure your app domain is allowed in Firebase Console Settings

**Still having issues?**
- Check browser console for detailed error messages
- Verify Firebase project is active and billing is enabled (if needed)
- Try test mode in Firestore first before production rules

## What's Next?

1. **Update Login.tsx** to support email/password registration
2. **Add password reset** functionality
3. **Implement admin authentication** with separate admin accounts
4. **Add file uploads** to Firebase Storage for profile pictures
5. **Set up real-time listeners** for live updates
6. **Deploy to Vercel/Netlify** with environment variables

## Helpful Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Web SDK Docs](https://firebase.google.com/docs/web/setup)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
