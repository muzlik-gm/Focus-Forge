# FocusForge Desktop App

A cloud-based desktop application built with Tauri that connects to the FocusForge Next.js server.

## Architecture

The desktop app is a **lightweight client** that connects to a running Next.js server:

```
Desktop App (Tauri Webview)
  ↓
HTTP Requests
  ↓
Next.js Server (localhost:3000 or production)
  ↓
API Routes (/api/*)
  ↓
MongoDB Cloud Database
```

**Key Points:**
- Desktop app does NOT run standalone
- Requires a running Next.js server
- Uses the same MongoDB database as web version
- Shares authentication (NextAuth) with web version
- All data operations go through API routes

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Rust** (latest stable) - [Install from rustup.rs](https://rustup.rs/)
3. **Running Next.js server** - The desktop app connects to this

## Quick Start

### 1. Install Dependencies

```bash
# From project root
npm install

# From desktop-app directory
cd desktop-app
npm install
```

### 2. Start Next.js Server

**IMPORTANT**: The desktop app requires this server to be running!

```bash
# From project root
npm run dev
```

Keep this terminal open. The server runs at `http://localhost:3000`.

### 3. Run Desktop App

In a new terminal:

```bash
cd desktop-app
npm run tauri dev
```

The desktop app will open and load from the server.

## Development

### Commands

```bash
# Start desktop app in development mode
npm run tauri dev

# Build desktop app for production
npm run tauri build

# Check Rust code
cargo check

# Run Rust tests
cargo test
```

### Development Workflow

1. Start Next.js server: `npm run dev` (from project root)
2. Start desktop app: `npm run tauri dev` (from desktop-app directory)
3. Make changes to code
4. Next.js hot-reloads automatically
5. Tauri app reflects changes immediately

### Debugging

**Frontend (Next.js):**
- Right-click in desktop app → Inspect
- Opens Chrome DevTools
- Check Console for errors
- Check Network tab for API requests

**Backend (Rust):**
- Check terminal where `npm run tauri dev` is running
- Rust logs appear here
- Use `log::info!()`, `log::error!()` in Rust code

## Configuration

### Tauri Configuration

File: `src-tauri/tauri.conf.json`

```json
{
  "build": {
    "devPath": "http://localhost:3000",    // Connects to Next.js server
    "distDir": "../dist",                   // Minimal redirect HTML
    "beforeDevCommand": "",                 // User starts server manually
    "beforeBuildCommand": ""                // No build needed
  }
}
```

### Environment Variables

The desktop app uses the same `.env.local` as the web version:

```env
# MongoDB connection
DATABASE_URL="mongodb+srv://..."

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Desktop app API URL (same as NEXTAUTH_URL for development)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Authentication

The desktop app uses NextAuth for authentication:

1. User enters credentials in desktop app
2. Desktop app calls `signIn()` from NextAuth
3. Request goes to `http://localhost:3000/api/auth/callback/credentials`
4. Server validates credentials against MongoDB
5. Server creates session and returns session cookie
6. Desktop app stores session cookie
7. Subsequent requests include session cookie

**Environment Detection:**

```typescript
// Desktop app is detected via window.__TAURI__ (Tauri v1)
const isDesktop = typeof window !== 'undefined' && !!(window as any).__TAURI__;
```

## Building for Production

### 1. Deploy Next.js Server

Deploy your Next.js app to a cloud provider:
- Vercel (recommended)
- AWS
- DigitalOcean
- etc.

### 2. Update Environment Variables

Update `NEXT_PUBLIC_API_URL` to your production server URL:

```env
NEXT_PUBLIC_API_URL="https://your-production-server.com"
```

### 3. Build Desktop App

```bash
cd desktop-app
npm run tauri build
```

This creates installers in `src-tauri/target/release/bundle/`:
- Windows: `.msi` and `.exe` installers
- macOS: `.dmg` and `.app` bundle
- Linux: `.AppImage`, `.deb`, `.rpm`

### 4. Distribute

Distribute the installer to users. When they run the app, it will connect to your production server.

## Project Structure

```
desktop-app/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs        # Main entry point
│   │   ├── auth/          # Authentication (DEPRECATED - uses cloud)
│   │   ├── monitoring/    # App monitoring (optional)
│   │   └── lib.rs         # Library exports
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── dist/                   # Minimal redirect HTML
│   └── index.html         # Redirects to server
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Troubleshooting

### "Cannot connect to server"

**Cause**: Next.js server is not running.

**Solution**:
```bash
# From project root
npm run dev
```

### "Invalid email or password"

**Cause**: Database connection issue or wrong credentials.

**Solution**:
1. Check `DATABASE_URL` in `.env.local`
2. Verify MongoDB is accessible
3. Test same credentials in web browser
4. Check user exists: `npm run db:studio`

### CORS errors in console

**Cause**: CORS headers not configured properly.

**Solution**:
1. Verify `next.config.mjs` has CORS headers
2. Restart Next.js server
3. Check `Access-Control-Allow-Origin` in Network tab

### Session not persisting

**Cause**: Cookies not being stored properly.

**Solution**:
1. Check `NEXTAUTH_URL` matches server URL
2. Verify cookies are enabled in Tauri
3. Check cookie settings in `lib/auth.ts`

## Features

### Current Features
- ✅ Cloud-based authentication (NextAuth + MongoDB)
- ✅ Session management
- ✅ Data sync with web version
- ✅ System tray integration
- ✅ Window management

### Optional Features (Not Implemented)
- ⚠️ Application monitoring (Rust code exists but not integrated)
- ⚠️ Focus session tracking (Rust code exists but not integrated)
- ⚠️ Distraction detection (Rust code exists but not integrated)
- ⚠️ Native notifications (Rust code exists but not integrated)

These features can be implemented later if needed. The Rust code exists in `src-tauri/src/` but is not currently used.

## Security

### Development Mode
- CSRF validation disabled
- CORS allows localhost
- HTTP cookies (not secure)
- Detailed logging

### Production Mode (TODO)
- Enable CSRF validation
- Restrict CORS to specific origin
- Use HTTPS only
- Secure cookies (`secure: true`)
- Rate limiting

## Documentation

- `../START_HERE.md` - Quick start guide
- `../QUICK_START_DESKTOP.md` - Simple setup
- `../DESKTOP_APP_SETUP.md` - Detailed setup
- `../DESKTOP_AUTH_FIX.md` - Technical details
- `../DESKTOP_TESTING_CHECKLIST.md` - Testing guide
- `../AGENTS.md` - Project overview

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation files
3. Check Next.js server logs
4. Verify MongoDB connection
5. Test in web browser first

## License

Same as main FocusForge project.
