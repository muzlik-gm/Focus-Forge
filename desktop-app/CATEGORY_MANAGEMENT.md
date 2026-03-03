# Category Management System

This document describes the category management system implemented in task 6.2.

## Overview

The category management system allows users to:
1. Categorize applications as Productive, Neutral, or Distracting
2. Create custom categories beyond the three defaults
3. Set temporary category overrides during focus sessions
4. Manage categories through Tauri commands exposed to the Next.js frontend

## Architecture

### Database Layer
- **Table**: `application_categories`
- **Fields**: `application`, `category`, `custom`, `created_at`, `updated_at`
- **Location**: `desktop-app/src-tauri/src/database/categories.rs`

### Focus Session Manager
- **Session-scoped overrides**: Stored in memory (`HashMap<String, String>`)
- **Lifecycle**: Overrides are cleared when a focus session ends
- **Location**: `desktop-app/src-tauri/src/focus/session_manager.rs`

### Tauri Commands
- **Location**: `desktop-app/src-tauri/src/commands.rs`
- **Registration**: `desktop-app/src-tauri/src/main.rs`

### Frontend API
- **Location**: `lib/tauri-api.ts`
- **Namespace**: `tauriApi.categories`

## Available Commands

### Basic Category Management

#### `get_application_category`
Get the category for a specific application.
```typescript
const category = await tauriApi.categories.getCategory("Visual Studio Code");
// Returns: { application: "Visual Studio Code", category: "Productive", custom: false }
```

#### `get_category_with_fallback`
Get category with automatic fallback to "Neutral" if not found.
```typescript
const category = await tauriApi.categories.getCategoryWithFallback("UnknownApp");
// Returns: "Neutral"
```

#### `set_application_category`
Set or update an application's category.
```typescript
await tauriApi.categories.setCategory("Slack", "Neutral", false);
```

#### `get_all_categories`
Get all application categories from the database.
```typescript
const allCategories = await tauriApi.categories.listAll();
// Returns: Array of ApplicationCategory objects
```

### Custom Category Management

#### `create_custom_category`
Create a user-defined custom category.
```typescript
await tauriApi.categories.createCustomCategory("MyApp", "Work Tools");
```

#### `get_custom_categories`
Get only custom (user-defined) categories.
```typescript
const customCategories = await tauriApi.categories.listCustom();
// Returns: Array of ApplicationCategory objects where custom=true
```

#### `delete_application_category`
Remove an application's category.
```typescript
await tauriApi.categories.deleteCategory("MyApp");
```

#### `list_category_names`
Get all unique category names in the database.
```typescript
const categoryNames = await tauriApi.categories.listCategoryNames();
// Returns: ["Productive", "Neutral", "Distracting", "Work Tools", ...]
```

### Session-Scoped Category Overrides

Session-scoped overrides allow temporary category changes during a focus session without modifying the permanent category in the database.

#### `set_session_category_override`
Set a temporary category override for the current session.
```typescript
// During a focus session, temporarily mark Slack as Productive
await tauriApi.categories.session.setOverride("Slack", "Productive");
```

**Requirements**:
- A focus session must be active
- Override is cleared when the session ends

#### `get_session_category_override`
Get the override category for an application.
```typescript
const override = await tauriApi.categories.session.getOverride("Slack");
// Returns: "Productive" or null if no override exists
```

#### `get_all_session_category_overrides`
Get all session-scoped overrides.
```typescript
const overrides = await tauriApi.categories.session.getAllOverrides();
// Returns: { "Slack": "Productive", "Discord": "Neutral" }
```

#### `clear_session_category_override`
Remove a specific override.
```typescript
await tauriApi.categories.session.clearOverride("Slack");
```

#### `clear_all_session_category_overrides`
Remove all overrides for the current session.
```typescript
await tauriApi.categories.session.clearAllOverrides();
```

### Default Categories

#### `init_default_categories`
Initialize the database with default categories for common applications.
```typescript
await tauriApi.categories.initDefaults();
```

This populates the database with ~200 default mappings including:
- **Productive**: IDEs (VS Code, IntelliJ), Development Tools (Terminal, Docker), Design Tools (Figma, Photoshop), Office Apps (Word, Excel, Notion)
- **Neutral**: Browsers (Chrome, Firefox), Communication (Slack, Teams), File Management (Finder, Explorer)
- **Distracting**: Social Media (Facebook, Twitter), Entertainment (YouTube, Netflix, Spotify), Gaming (Steam, Epic Games)

## How Distraction Detection Works

When a focus session is active, the system checks if an application is distracting:

1. **Check for session-scoped override first**
   - If an override exists for the application, use that category
   
2. **Fall back to permanent category**
   - Query the database for the application's category
   - If not found, default to "Neutral"

3. **Compare against productive categories**
   - Check if the category is in the session's productive categories list
   - If not in the list, it's considered a distraction

**Example**:
```typescript
// Start a focus session with only "Productive" category
await tauriApi.focusSessions.create(
  "session-123",
  Date.now(),
  ["Productive"],
  "Deep work session"
);

// VS Code is Productive → Not a distraction
// Slack is Neutral → Distraction (not in productive list)
// Spotify is Distracting → Distraction

// Temporarily allow Slack for this session
await tauriApi.categories.session.setOverride("Slack", "Productive");
// Now Slack is not a distraction for this session only
```

## Implementation Details

### Session-Scoped Override Storage

Overrides are stored in the `FocusSessionManager`:
```rust
pub struct FocusSessionManager {
    database: Arc<Database>,
    current_session: Arc<RwLock<Option<FocusSession>>>,
    session_category_overrides: Arc<RwLock<HashMap<String, String>>>,
}
```

### Distraction Check Logic

The `check_distraction` method applies overrides:
```rust
pub async fn check_distraction(&self, application_name: &str) -> Result<bool> {
    // ... session checks ...
    
    // Check for session-scoped override first
    let category = {
        let overrides = self.session_category_overrides.read().await;
        if let Some(override_category) = overrides.get(application_name) {
            override_category.clone()
        } else {
            categories::get_category_with_fallback(
                self.database.pool(),
                application_name
            ).await?
        }
    };
    
    // Check if productive
    let is_productive = productive_categories.contains(&category);
    Ok(!is_productive)
}
```

### Cleanup on Session End

Overrides are automatically cleared when a session stops:
```rust
pub async fn stop_session(&self) -> Result<()> {
    // ... update database ...
    
    // Clear session-scoped category overrides
    self.session_category_overrides.write().await.clear();
    
    Ok(())
}
```

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 5.2**: Users can view application categories ✓
- **Requirement 5.3**: Users can change application categories (persisted to database) ✓
- **Requirement 5.4**: Users can create custom categories ✓
- **Requirement 5.5**: Session-scoped category overrides ✓

## Testing

To test the category management system:

1. **Start the desktop app**:
   ```bash
   npm run dev  # Terminal 1
   cd desktop-app && npm run tauri dev  # Terminal 2
   ```

2. **Initialize default categories**:
   ```typescript
   await tauriApi.categories.initDefaults();
   ```

3. **Test basic category operations**:
   ```typescript
   // Get a category
   const cat = await tauriApi.categories.getCategory("VS Code");
   
   // Set a category
   await tauriApi.categories.setCategory("MyApp", "Productive", false);
   
   // Create custom category
   await tauriApi.categories.createCustomCategory("MyApp", "Work Tools");
   ```

4. **Test session-scoped overrides**:
   ```typescript
   // Start a focus session
   const sessionId = await tauriApi.focusSessions.create(
     "test-session",
     Date.now(),
     ["Productive"]
   );
   
   // Set an override
   await tauriApi.categories.session.setOverride("Slack", "Productive");
   
   // Verify override
   const override = await tauriApi.categories.session.getOverride("Slack");
   console.log(override); // "Productive"
   
   // Stop session (clears overrides)
   await tauriApi.focusSessions.complete(sessionId, Date.now());
   ```

## Future Enhancements

Potential improvements for future tasks:

1. **Category Templates**: Pre-defined category sets for different work modes
2. **Smart Categorization**: ML-based automatic categorization suggestions
3. **Category Hierarchies**: Parent-child category relationships
4. **Time-based Categories**: Different categories for the same app at different times
5. **Sync with Cloud**: Sync categories across devices via the Next.js backend

## Related Files

- `desktop-app/src-tauri/src/commands.rs` - Tauri command definitions
- `desktop-app/src-tauri/src/database/categories.rs` - Database operations
- `desktop-app/src-tauri/src/focus/session_manager.rs` - Session-scoped overrides
- `desktop-app/src-tauri/src/main.rs` - Command registration
- `lib/tauri-api.ts` - Frontend TypeScript API
- `.kiro/specs/forgrin-desktop-app/requirements.md` - Requirements 5.2-5.5
- `.kiro/specs/forgrin-desktop-app/design.md` - Design specifications
