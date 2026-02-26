# Checkpoint 9 - IPC Scope Fix

## Issue
When running the desktop app, users encountered the following error:
```
Scope not defined for window `main` and URL `http://localhost:3000/focus`
```

This error occurred because Tauri v1 requires explicit configuration to allow IPC (Inter-Process Communication) calls from remote domains for security reasons.

## Root Cause
The desktop app loads the Next.js frontend from `http://localhost:3000` (a remote domain from Tauri's perspective). By default, Tauri blocks IPC calls from remote domains to prevent security vulnerabilities.

## Solution
Added `dangerousRemoteDomainIpcAccess` configuration to `desktop-app/src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "security": {
      "csp": null,
      "dangerousRemoteDomainIpcAccess": [
        {
          "domain": "localhost:3000",
          "windows": ["main"],
          "enableTauriAPI": true
        },
        {
          "domain": "localhost",
          "windows": ["main"],
          "enableTauriAPI": true
        },
        {
          "domain": "127.0.0.1:3000",
          "windows": ["main"],
          "enableTauriAPI": true
        }
      ]
    }
  }
}
```

This configuration:
1. Allows the `main` window to make IPC calls from `localhost:3000`
2. Enables the Tauri API for these domains
3. Covers multiple localhost variations (localhost, 127.0.0.1)

## Security Considerations
The configuration name includes "dangerous" as a reminder that allowing remote domains to access IPC is a security consideration. In this case, it's safe because:

1. **Development Environment**: The remote domain is `localhost:3000`, which is the local Next.js dev server
2. **Controlled Environment**: The Next.js server is running on the same machine
3. **No External Access**: The domain is not accessible from the internet

For production deployments, you would need to:
1. Add the production server domain to this list
2. Ensure the production server is trusted and secure
3. Use HTTPS for production domains

## Testing
After applying this fix:

1. Stop the desktop app if it's running
2. Restart the desktop app: `cd desktop-app && npm run tauri dev`
3. Navigate to `/focus` or `/tasks` pages
4. Verify that focus sessions can be started without errors
5. Verify that Tauri commands work correctly

## Related Documentation
- [Tauri Security Config](https://tauri.app/v1/api/config/#securityconfig.dangerousremotedomainipcaccess)
- [Tauri IPC Scope](https://docs.rs/tauri/1/tauri/scope/struct.IpcScope.html#method.configure_remote_access)

## Files Modified
- `desktop-app/src-tauri/tauri.conf.json` - Added `dangerousRemoteDomainIpcAccess` configuration

## Status
✅ Fixed - Desktop app can now make IPC calls to Rust backend from Next.js frontend
