# 🔥 Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Carnaval"** (or your preference)
4. Disable Google Analytics (optional for MVP)
5. Click **"Create project"**

## Step 2: Add Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app nickname: **"Carnaval Web"**
3. **Do NOT** check "Firebase Hosting" (not needed yet)
4. Click **"Register app"**

## Step 3: Copy Firebase Config

You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "carnaval-xxxxx.firebaseapp.com",
  projectId: "carnaval-xxxxx",
  storageBucket: "carnaval-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Update .env File

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Enable Authentication

1. In Firebase Console, go to **"Build" → "Authentication"**
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Enable **"Email/Password"** (first toggle)
5. Click **"Save"**

## Step 6: Create Firestore Database

1. In Firebase Console, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Choose a location (closest to your users)
5. Click **"Enable"**

## Step 7: Set Firestore Security Rules

1. In Firestore, go to the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Ficadas collection
    match /ficadas/{ficadaId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 8: Set up Firebase Storage

1. In Firebase Console, go to **"Build" → "Storage"**
2. Click **"Get started"**
3. Click **"Next"** (production mode)
4. Choose same location as Firestore
5. Click **"Done"**

## Step 9: Set Storage Security Rules

1. In Storage, go to the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Ficada photos
    match /ficadas/{ficadaId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 10: Restart Dev Server

After updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Verification

1. Open http://localhost:5173/
2. Try registering a new user
3. Upload a profile photo
4. Create a ficada with photo
5. Check Firebase Console:
   - **Authentication** → Should see your user
   - **Firestore** → Should see `users` and `ficadas` collections
   - **Storage** → Should see uploaded images

## 🎉 You're Done!

Your Carnaval app is now using Firebase for:
- ✅ User authentication
- ✅ Cloud database (Firestore)
- ✅ Image storage (Firebase Storage)
- ✅ Real-time sync
- ✅ Secure access rules

## 🆘 Troubleshooting

**"Firebase: Error (auth/...)"**
- Check that Email/Password is enabled in Authentication

**"Missing or insufficient permissions"**
- Verify Firestore and Storage rules are published

**"Failed to get document"**
- Make sure you're logged in
- Check browser console for detailed errors

**Images not uploading**
- Verify Storage is enabled
- Check Storage rules
- Ensure file is under 5MB
