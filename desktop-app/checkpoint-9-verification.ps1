# Forgrin Desktop App - Checkpoint 9 Verification Script
# This script verifies that core features from tasks 6-8 are working correctly

Write-Host "========================================"
Write-Host "Forgrin Desktop App - Checkpoint 9"
Write-Host "Core Features Verification (Tasks 6-8)"
Write-Host "========================================"
Write-Host ""

$allPassed = $true

Write-Host "This checkpoint verifies:"
Write-Host "  Task 6: Application categorization system"
Write-Host "  Task 7: Focus session management"
Write-Host "  Task 8: Notification system"
Write-Host ""

# Function to check if SQLite database exists
function Test-DatabaseExists {
    $appDataPath = $env:APPDATA
    $dbPath = Join-Path $appDataPath "com.forgrin.desktop\forgrin.db"
    return Test-Path $dbPath
}

# Function to check database tables
function Test-DatabaseTables {
    param($DbPath)
    
    try {
        # Load SQLite assembly
        Add-Type -Path "desktop-app\node_modules\sqlite3\lib\binding\napi-v6-win32-x64\node_sqlite3.node" -ErrorAction SilentlyContinue
        
        # Use sqlite3 CLI if available
        $sqlite3 = Get-Command sqlite3 -ErrorAction SilentlyContinue
        if ($sqlite3) {
            $tables = & sqlite3 $DbPath ".tables"
            return $tables
        } else {
            Write-Host "  [INFO] SQLite CLI not available, skipping table check"
            return $null
        }
    } catch {
        Write-Host "  [INFO] Could not check database tables: $_"
        return $null
    }
}

Write-Host "========================================"
Write-Host "TASK 6: Application Categorization"
Write-Host "========================================"
Write-Host ""

# Check 6.1: Default categories implementation
Write-Host "[6.1] Checking default categories implementation..."
if (Test-Path "src-tauri/src/database/categories.rs") {
    $categoriesCode = Get-Content "src-tauri/src/database/categories.rs" -Raw
    
    if ($categoriesCode -match "init_default_categories|insert_defaults") {
        Write-Host "  [PASS] Default categories function exists"
    } else {
        Write-Host "  [FAIL] Default categories function not found"
        $allPassed = $false
    }
    
    if ($categoriesCode -match "Productive|Neutral|Distracting") {
        Write-Host "  [PASS] Default category types defined"
    } else {
        Write-Host "  [FAIL] Default category types not found"
        $allPassed = $false
    }
} else {
    Write-Host "  [FAIL] categories.rs not found"
    $allPassed = $false
}
Write-Host ""

# Check 6.2: Category management commands
Write-Host "[6.2] Checking category management commands..."
if (Test-Path "src-tauri/src/commands.rs") {
    $commandsCode = Get-Content "src-tauri/src/commands.rs" -Raw
    
    $requiredCommands = @(
        "get_application_category",
        "set_application_category",
        "get_all_categories",
        "create_custom_category",
        "set_session_category_override",
        "get_session_category_override"
    )
    
    $missingCommands = @()
    foreach ($cmd in $requiredCommands) {
        if ($commandsCode -match $cmd) {
            Write-Host "  [PASS] Command '$cmd' exists"
        } else {
            Write-Host "  [FAIL] Command '$cmd' not found"
            $missingCommands += $cmd
            $allPassed = $false
        }
    }
    
    if ($missingCommands.Count -eq 0) {
        Write-Host "  [PASS] All category management commands implemented"
    }
} else {
    Write-Host "  [FAIL] commands.rs not found"
    $allPassed = $false
}
Write-Host ""

Write-Host "========================================"
Write-Host "TASK 7: Focus Session Management"
Write-Host "========================================"
Write-Host ""

# Check 7.1: Focus session data model
Write-Host "[7.1] Checking focus session implementation..."
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    $sessionCode = Get-Content "src-tauri/src/focus/session_manager.rs" -Raw
    
    if ($sessionCode -match "FocusSessionManager") {
        Write-Host "  [PASS] FocusSessionManager struct exists"
    } else {
        Write-Host "  [FAIL] FocusSessionManager not found"
        $allPassed = $false
    }
    
    if ($sessionCode -match "start_session|create_session") {
        Write-Host "  [PASS] Session start functionality exists"
    } else {
        Write-Host "  [FAIL] Session start functionality not found"
        $allPassed = $false
    }
    
    if ($sessionCode -match "pause_session|resume_session") {
        Write-Host "  [PASS] Session pause/resume functionality exists"
    } else {
        Write-Host "  [FAIL] Session pause/resume functionality not found"
        $allPassed = $false
    }
} else {
    Write-Host "  [FAIL] session_manager.rs not found"
    $allPassed = $false
}
Write-Host ""

# Check 7.2: Distraction detection
Write-Host "[7.2] Checking distraction detection..."
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    $sessionCode = Get-Content "src-tauri/src/focus/session_manager.rs" -Raw
    
    if ($sessionCode -match "check_distraction") {
        Write-Host "  [PASS] Distraction detection function exists"
    } else {
        Write-Host "  [FAIL] Distraction detection function not found"
        $allPassed = $false
    }
    
    if ($sessionCode -match "productive_categories") {
        Write-Host "  [PASS] Productive categories check implemented"
    } else {
        Write-Host "  [FAIL] Productive categories check not found"
        $allPassed = $false
    }
}
Write-Host ""

# Check 7.3: Session summary
Write-Host "[7.3] Checking session summary generation..."
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    $sessionCode = Get-Content "src-tauri/src/focus/session_manager.rs" -Raw
    
    if ($sessionCode -match "get_session_summary|generate_summary") {
        Write-Host "  [PASS] Session summary function exists"
    } else {
        Write-Host "  [FAIL] Session summary function not found"
        $allPassed = $false
    }
}
Write-Host ""

Write-Host "========================================"
Write-Host "TASK 8: Notification System"
Write-Host "========================================"
Write-Host ""

# Check 8.1: Notification service
Write-Host "[8.1] Checking notification service..."
if (Test-Path "src-tauri/src/notifications/service.rs") {
    $notifCode = Get-Content "src-tauri/src/notifications/service.rs" -Raw
    
    if ($notifCode -match "NotificationService") {
        Write-Host "  [PASS] NotificationService struct exists"
    } else {
        Write-Host "  [FAIL] NotificationService not found"
        $allPassed = $false
    }
    
    if ($notifCode -match "notify-rust|Notification") {
        Write-Host "  [PASS] Cross-platform notification library integrated"
    } else {
        Write-Host "  [FAIL] Notification library not found"
        $allPassed = $false
    }
} else {
    Write-Host "  [FAIL] notifications/service.rs not found"
    $allPassed = $false
}
Write-Host ""

# Check 8.2: Distraction notifications with actions
Write-Host "[8.2] Checking distraction notifications..."
if (Test-Path "src-tauri/src/notifications/service.rs") {
    $notifCode = Get-Content "src-tauri/src/notifications/service.rs" -Raw
    
    if ($notifCode -match "send_distraction_alert") {
        Write-Host "  [PASS] Distraction alert function exists"
    } else {
        Write-Host "  [FAIL] Distraction alert function not found"
        $allPassed = $false
    }
    
    if ($notifCode -match "action.*Return to Work|action.*Take a Break") {
        Write-Host "  [PASS] Notification actions implemented"
    } else {
        Write-Host "  [FAIL] Notification actions not found"
        $allPassed = $false
    }
    
    if ($notifCode -match "send_extended_distraction_reminder") {
        Write-Host "  [PASS] Extended distraction reminder exists"
    } else {
        Write-Host "  [FAIL] Extended distraction reminder not found"
        $allPassed = $false
    }
}
Write-Host ""

# Check 8.3: Notification history
Write-Host "[8.3] Checking notification history..."
if (Test-Path "src-tauri/src/notifications/service.rs") {
    $notifCode = Get-Content "src-tauri/src/notifications/service.rs" -Raw
    
    if ($notifCode -match "notification_history|history") {
        Write-Host "  [PASS] Notification history tracking exists"
    } else {
        Write-Host "  [INFO] Notification history may be in-memory only"
    }
}
Write-Host ""

Write-Host "========================================"
Write-Host "Integration Checks"
Write-Host "========================================"
Write-Host ""

# Check: Database migrations
Write-Host "[DB] Checking database migrations..."
if (Test-Path "src-tauri/migrations") {
    $migrations = Get-ChildItem "src-tauri/migrations" -Filter "*.sql"
    Write-Host "  [PASS] Found $($migrations.Count) migration files"
    
    $requiredTables = @("application_categories", "focus_sessions", "distraction_events")
    foreach ($table in $requiredTables) {
        $found = $false
        foreach ($migration in $migrations) {
            $content = Get-Content $migration.FullName -Raw
            if ($content -match "CREATE TABLE.*$table") {
                Write-Host "  [PASS] Migration for '$table' table exists"
                $found = $true
                break
            }
        }
        if (-not $found) {
            Write-Host "  [FAIL] Migration for '$table' table not found"
            $allPassed = $false
        }
    }
} else {
    Write-Host "  [FAIL] Migrations directory not found"
    $allPassed = $false
}
Write-Host ""

# Check: Monitoring integration
Write-Host "[MON] Checking monitoring integration..."
if (Test-Path "src-tauri/src/monitoring/service.rs") {
    $monitorCode = Get-Content "src-tauri/src/monitoring/service.rs" -Raw
    
    if ($monitorCode -match "check_distraction|distraction") {
        Write-Host "  [PASS] Monitoring service integrated with distraction detection"
    } else {
        Write-Host "  [INFO] Monitoring may not be fully integrated with focus sessions"
    }
    
    if ($monitorCode -match "current_distraction") {
        Write-Host "  [PASS] Extended distraction tracking implemented"
    } else {
        Write-Host "  [FAIL] Extended distraction tracking not found"
        $allPassed = $false
    }
}
Write-Host ""

# Check: Tests
Write-Host "[TEST] Checking test coverage..."
if (Test-Path "src-tauri/tests") {
    $testFiles = Get-ChildItem "src-tauri/tests" -Recurse -Filter "*.rs"
    Write-Host "  [INFO] Found $($testFiles.Count) test files"
    
    $testContent = ""
    foreach ($testFile in $testFiles) {
        $testContent += Get-Content $testFile.FullName -Raw
    }
    
    if ($testContent -match "test_.*category|test_.*categorization") {
        Write-Host "  [PASS] Category tests exist"
    } else {
        Write-Host "  [INFO] Category tests may be missing"
    }
    
    if ($testContent -match "test_.*session|test_.*focus") {
        Write-Host "  [PASS] Focus session tests exist"
    } else {
        Write-Host "  [INFO] Focus session tests may be missing"
    }
    
    if ($testContent -match "test_.*notification|test_.*distraction") {
        Write-Host "  [PASS] Notification tests exist"
    } else {
        Write-Host "  [INFO] Notification tests may be missing"
    }
} else {
    Write-Host "  [INFO] Tests directory not found"
}
Write-Host ""

# Summary
Write-Host "========================================"
Write-Host "Verification Summary"
Write-Host "========================================"
Write-Host ""

if ($allPassed) {
    Write-Host "[SUCCESS] All automated checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Manual Testing Required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please perform the following manual tests:"
    Write-Host ""
    Write-Host "1. START THE APPLICATION:"
    Write-Host "   Terminal 1: npm run dev"
    Write-Host "   Terminal 2: cd desktop-app && npm run tauri dev"
    Write-Host ""
    Write-Host "2. TEST FOCUS SESSIONS (Task 7):"
    Write-Host "   a. Start a focus session with 'Productive' category only"
    Write-Host "   b. Switch to a productive app (VS Code, Terminal)"
    Write-Host "      -> Should NOT trigger notification"
    Write-Host "   c. Switch to a distracting app (Spotify, social media)"
    Write-Host "      -> Should trigger distraction notification within 1 second"
    Write-Host "   d. Pause the session"
    Write-Host "   e. Switch to distracting app"
    Write-Host "      -> Should NOT trigger notification (session paused)"
    Write-Host "   f. Resume the session"
    Write-Host "   g. Switch to distracting app again"
    Write-Host "      -> Should trigger notification"
    Write-Host "   h. Stop the session and view summary"
    Write-Host "      -> Should show focus time, distraction count, app breakdown"
    Write-Host ""
    Write-Host "3. TEST DISTRACTION DETECTION (Task 8):"
    Write-Host "   a. Start a focus session"
    Write-Host "   b. Switch to a distracting app"
    Write-Host "      -> Notification should appear with 'Return to Work' and 'Take a Break' buttons"
    Write-Host "   c. Stay in distracting app for 5+ minutes"
    Write-Host "      -> Extended distraction reminder should appear"
    Write-Host "   d. Verify only ONE extended reminder is sent (no duplicates)"
    Write-Host ""
    Write-Host "4. TEST APPLICATION CATEGORIZATION (Task 6):"
    Write-Host "   a. Initialize default categories (if not already done)"
    Write-Host "   b. View category for a known app (e.g., VS Code -> Productive)"
    Write-Host "   c. Change an app's category"
    Write-Host "   d. Create a custom category"
    Write-Host "   e. Set a session-scoped category override"
    Write-Host "   f. Verify override applies during session"
    Write-Host "   g. Stop session and verify override is cleared"
    Write-Host ""
    Write-Host "5. TEST UNIFIED APP INTEGRATION:"
    Write-Host "   a. Verify all features work together seamlessly"
    Write-Host "   b. Check system tray icon and menu"
    Write-Host "   c. Verify database is being updated (check AppData folder)"
    Write-Host "   d. Test closing window (should minimize to tray)"
    Write-Host ""
    Write-Host "After manual testing, report any issues found."
    Write-Host ""
} else {
    Write-Host "[FAILED] Some automated checks failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the errors above and fix them before proceeding to manual testing."
    Write-Host ""
}

Write-Host "========================================"
Write-Host ""

# Return exit code
if ($allPassed) {
    exit 0
} else {
    exit 1
}
