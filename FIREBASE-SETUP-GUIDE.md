# Firebase Setup Guide - Quick Start

## Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **elysium-legacy**
3. Click ⚙️ (Settings) > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

## Step 2: Add to Environment Variables

Open `.env.local` and add:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=elysium-legacy
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@elysium-legacy.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

## Step 3: Enable Authentication in Firebase

1. Go to Firebase Console > **Authentication**
2. Click **Get Started** (if not already enabled)
3. Go to **Sign-in method** tab
4. Enable **Google** provider:
   - Click Google
   - Toggle "Enable"
   - Add support email
   - Save
5. Enable **Email/Password** provider:
   - Click Email/Password
   - Toggle "Enable"
   - Save

## Step 4: Add Authorized Domains

1. Still in **Sign-in method** tab
2. Scroll to **Authorized domains**
3. Add:
   - `localhost` (already there)
   - Your production domain (e.g., `Forgrin.app`)

## Step 5: Update Database Schema

Run in terminal:

```bash
npx prisma db push
npx prisma generate
```

This adds:
- `firebaseUid` field
- `emailVerified` field
- `image` field

## Step 6: Test It!

### Test Email Registration:
```bash
npm run dev
# Go to http://localhost:3000/register
# Fill form with password confirmation
# Check email for verification link
```

### Test Google Sign-In:
```bash
npm run dev
# Go to http://localhost:3000/register
# Click "Continue with Google"
# Select Google account
```

---

## Troubleshooting

### "Firebase token verification failed"
- Check `FIREBASE_PRIVATE_KEY` is correct
- Ensure it includes `\n` for newlines
- Wrap in double quotes

### "Email not sent"
- Check Firebase Console > Authentication > Templates
- Verify email provider is enabled
- Check spam folder

### "Google sign-in popup blocked"
- Allow popups in browser
- Check authorized domains in Firebase

### Database error
- Run `npx prisma db push`
- Check `DATABASE_URL` in `.env.local`
- Ensure MongoDB is running

---

## Quick Reference

### Firebase Config (Client-side)
Already configured in `lib/firebase.ts`:
```typescript
apiKey: "AIzaSyCLGCos-TuJGQwEWlXpDV4dhUzT_Lbdk7A"
authDomain: "elysium-legacy.firebaseapp.com"
projectId: "elysium-legacy"
```

### New Database Fields
```prisma
firebaseUid     String?  @unique
emailVerified   Boolean  @default(false)
image           String?
```

### New API Endpoints
- `POST /api/auth/firebase-login` - Handle Firebase OAuth
- `POST /api/auth/register` - Now accepts `firebaseUid`

---

That's it! Firebase is ready to use. 🎉
