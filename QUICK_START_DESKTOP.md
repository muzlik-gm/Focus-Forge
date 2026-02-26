# Quick Start: Desktop App

## Prerequisites

- Node.js (v18+)
- Rust (install from [rustup.rs](https://rustup.rs/))
- MongoDB database (cloud or local)

## 1. Install Dependencies

```bash
# Root project
npm install

# Desktop app
cd desktop-app
npm install
cd ..
```

## 2. Configure Environment

Create `.env.local` in project root:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/focusforge"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 3. Start Next.js Server

```bash
npm run dev
```

**IMPORTANT**: Keep this running! The desktop app connects to this server.

## 4. Run Desktop App

In a new terminal:

```bash
cd desktop-app
npm run tauri dev
```

## 5. Test Login

1. Desktop app window opens
2. Click "Sign in" or "Sign up"
3. Use existing web credentials or create new account
4. Should redirect to dashboard after successful login

## Troubleshooting

### "Cannot connect to server"
- Ensure `npm run dev` is running
- Check server is at `http://localhost:3000`

### "Invalid email or password"
- Verify MongoDB connection in `.env.local`
- Check user exists in database

### Redirects to landing page
- Check browser console for errors (right-click → Inspect)
- Verify `NEXTAUTH_SECRET` is set
- Check server logs for authentication errors

## Architecture

```
Desktop App (Tauri) → http://localhost:3000 → Next.js API → MongoDB
```

Both web and desktop use:
- Same MongoDB database
- Same NextAuth authentication
- Same API routes
- Same session management

## Next Steps

- Read `DESKTOP_APP_SETUP.md` for detailed documentation
- Read `DESKTOP_AUTH_FIX.md` for technical details
- Deploy to production: Update `NEXT_PUBLIC_API_URL` to production server
