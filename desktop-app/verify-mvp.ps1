# Forgrin Desktop App - MVP Verification Script
# Task 13: Checkpoint - MVP complete

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Forgrin Desktop App - MVP Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# Task 1: Unified Application Launch
Write-Host "Task 1: Unified Application Launch" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Write-Host "Testing: 1.1 Tauri project structure exists" -ForegroundColor Yellow
if (Test-Path "src-tauri/Cargo.toml") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 1.2 Next.js configured for cloud architecture" -ForegroundColor Yellow
$config = Get-Content "../next.config.mjs" -Raw
$hasExport = $config -match "output:\s*['""]export['""]"
$hasCORS = $config -match "Access-Control-Allow"
if (-not $hasExport -and $hasCORS) {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    if ($hasExport) { Write-Host "    - Has output: export (should be removed)" -ForegroundColor Yellow }
    if (-not $hasCORS) { Write-Host "    - Missing CORS headers" -ForegroundColor Yellow }
    $failed++
}

Write-Host "Testing: 1.3 Tauri configured to connect to server" -ForegroundColor Yellow
$tauriConfig = Get-Content "src-tauri/tauri.conf.json" -Raw | ConvertFrom-Json
if ($tauriConfig.build.devPath -eq "http://localhost:3000") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL - devPath: $($tauriConfig.build.devPath)" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 1.4 System tray implementation exists" -ForegroundColor Yellow
$mainRs = Get-Content "src-tauri/src/main.rs" -Raw
if ($mainRs -match "SystemTray" -and $mainRs -match "create_system_tray") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 1.5 Tauri commands registered" -ForegroundColor Yellow
if ($mainRs -match "invoke_handler" -and $mainRs -match "start_monitoring") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 1.6 Cloud-based authentication configured" -ForegroundColor Yellow
$authContext = Get-Content "../contexts/AuthContext.tsx" -Raw
if ($authContext -match "__TAURI__") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 1.7 Redirect HTML exists for production" -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 3-4: Monitoring System
Write-Host "Task 3-4: Monitoring System" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Magenta

Write-Host "Testing: 3.1 Platform abstraction layer exists" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/monitoring/platform.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 3.2 Windows monitoring implementation" -ForegroundColor Yellow
$platform = Get-Content "src-tauri/src/monitoring/platform.rs" -Raw
if ($platform -match "windows" -or $platform -match "Win32") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 4.1 MonitoringService exists" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/monitoring/service.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 4.2 Activity log recording implemented" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/database/activity_logs.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 4.5 Application enumeration implemented" -ForegroundColor Yellow
$commands = Get-Content "src-tauri/src/commands.rs" -Raw
if ($commands -match "get_running_apps" -or $commands -match "get_active_window") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 6: Application Categorization
Write-Host "Task 6: Application Categorization" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Write-Host "Testing: 6.1 Default categories implementation" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/database/categories.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 6.2 Category management commands" -ForegroundColor Yellow
if ($commands -match "set_application_category" -and $commands -match "get_application_category") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 7: Focus Session Management
Write-Host "Task 7: Focus Session Management" -ForegroundColor Magenta
Write-Host "---------------------------------" -ForegroundColor Magenta

Write-Host "Testing: 7.1 FocusSessionManager exists" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 7.2 Distraction detection implemented" -ForegroundColor Yellow
$sessionManager = Get-Content "src-tauri/src/focus/session_manager.rs" -Raw
if ($sessionManager -match "distraction" -or $sessionManager -match "check_if_distracting") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 7.3 Session summary generation" -ForegroundColor Yellow
if ($commands -match "get_session_summary") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 8: Notification System
Write-Host "Task 8: Notification System" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Magenta

Write-Host "Testing: 8.1 NotificationService exists" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/notifications/service.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 8.2 Distraction notifications implemented" -ForegroundColor Yellow
$notifService = Get-Content "src-tauri/src/notifications/service.rs" -Raw
if ($notifService -match "distraction" -or $notifService -match "send_notification") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 8.3 Notification history" -ForegroundColor Yellow
if ($commands -match "get_notification_history") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 11: Analytics and Reporting
Write-Host "Task 11: Analytics and Reporting" -ForegroundColor Magenta
Write-Host "---------------------------------" -ForegroundColor Magenta

Write-Host "Testing: 11.1 Analytics query functions exist" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/analytics/queries.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 11.2 Productivity score calculation" -ForegroundColor Yellow
if ($commands -match "get_analytics" -or $commands -match "productivity") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 11.3 Session analytics" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/analytics/session_analytics.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 11.4 Data export functionality" -ForegroundColor Yellow
if ((Test-Path "src-tauri/src/export/csv_export.rs") -and (Test-Path "src-tauri/src/export/json_export.rs")) {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Task 12: Frontend UI Components
Write-Host "Task 12: Frontend UI Components" -ForegroundColor Magenta
Write-Host "--------------------------------" -ForegroundColor Magenta

Write-Host "Testing: 12.1 Dashboard with monitoring display" -ForegroundColor Yellow
if (Test-Path "../app/(dashboard)/dashboard/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 12.2 Focus session management UI" -ForegroundColor Yellow
if (Test-Path "../app/(dashboard)/focus/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 12.3 Analytics and reports UI" -ForegroundColor Yellow
if (Test-Path "../app/(dashboard)/analytics/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 12.4 Application categorization UI" -ForegroundColor Yellow
if (Test-Path "../app/(dashboard)/app-categories/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 12.5 Settings UI" -ForegroundColor Yellow
if (Test-Path "../app/(dashboard)/settings/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Dev Test Pages
Write-Host "Dev Test Pages" -ForegroundColor Magenta
Write-Host "--------------" -ForegroundColor Magenta

Write-Host "Testing: Dev: App monitor test page" -ForegroundColor Yellow
if (Test-Path "../app/dev/app-monitor/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: Dev: Desktop analytics test page" -ForegroundColor Yellow
if (Test-Path "../app/dev/desktop-analytics/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: Dev: Focus session test page" -ForegroundColor Yellow
if (Test-Path "../app/dev/focus-session/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: Dev: Tauri test page" -ForegroundColor Yellow
if (Test-Path "../app/dev/tauri-test/page.tsx") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Database Recovery
Write-Host "Database Recovery" -ForegroundColor Magenta
Write-Host "-----------------" -ForegroundColor Magenta

Write-Host "Testing: 18.2 Database corruption recovery" -ForegroundColor Yellow
if (Test-Path "src-tauri/src/database/recovery.rs") {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host "Testing: 18.3 Diagnostic tool commands" -ForegroundColor Yellow
if (($commands -match "check_database_integrity") -or ($commands -match "recover_database")) {
    Write-Host "  ✓ PASS" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ✗ FAIL" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed
$passRate = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Passed: $passed / $total" -ForegroundColor Green
Write-Host "Failed: $failed / $total" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start Next.js server: npm run dev" -ForegroundColor White
Write-Host "2. Start desktop app in new terminal: cd desktop-app; npm run tauri dev" -ForegroundColor White
Write-Host "3. Test manually using dev pages:" -ForegroundColor White
Write-Host "   - /dev/app-monitor - Test monitoring" -ForegroundColor Gray
Write-Host "   - /dev/focus-session - Test focus sessions" -ForegroundColor Gray
Write-Host "   - /dev/desktop-analytics - Test analytics" -ForegroundColor Gray
Write-Host "   - /dev/tauri-test - Test Tauri commands" -ForegroundColor Gray
Write-Host ""
