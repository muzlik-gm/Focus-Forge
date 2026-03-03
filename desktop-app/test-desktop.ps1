# Forgrin Desktop App Verification Script
# This script tests the desktop app to ensure everything works correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Forgrin Desktop App Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
Write-Host "1. Checking Rust installation..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "   ✓ Rust installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Rust not found. Please install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "2. Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host "3. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Node modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

# Check if Rust dependencies compile
Write-Host "4. Checking Rust compilation..." -ForegroundColor Yellow
Push-Location src-tauri
$compileResult = cargo check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Rust code compiles successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Rust compilation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Check if database migrations exist
Write-Host "5. Checking database migrations..." -ForegroundColor Yellow
$migrations = Get-ChildItem "src-tauri/migrations/*.sql" -ErrorAction SilentlyContinue
if ($migrations.Count -gt 0) {
    Write-Host "   ✓ Found $($migrations.Count) migration(s)" -ForegroundColor Green
    foreach ($migration in $migrations) {
        Write-Host "     - $($migration.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ No migrations found" -ForegroundColor Red
}

# Check if auth module exists
Write-Host "6. Checking authentication module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/auth/mod.rs") {
    Write-Host "   ✓ Auth module found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Auth module not found" -ForegroundColor Red
}

# Check if monitoring module exists
Write-Host "7. Checking monitoring module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/monitoring/service.rs") {
    Write-Host "   ✓ Monitoring service found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Monitoring service not found" -ForegroundColor Red
}

# Check if focus module exists
Write-Host "8. Checking focus session module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    Write-Host "   ✓ Focus session manager found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Focus session manager not found" -ForegroundColor Red
}

# Check if notifications module exists
Write-Host "9. Checking notifications module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/notifications/service.rs") {
    Write-Host "   ✓ Notification service found" -ForegroundColor Green
} else {
    Write-Host "   ✗ Notification service not found" -ForegroundColor Red
}

# Check if build artifacts exist
Write-Host "10. Checking build artifacts..." -ForegroundColor Yellow
if (Test-Path "src-tauri/target/release/Forgrin.exe") {
    $exeSize = (Get-Item "src-tauri/target/release/Forgrin.exe").Length / 1MB
    Write-Host "   ✓ Executable found: $([math]::Round($exeSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Executable not found (run 'npm run build' to create)" -ForegroundColor Yellow
}

if (Test-Path "src-tauri/target/release/bundle/nsis/Forgrin_0.1.0_x64-setup.exe") {
    $installerSize = (Get-Item "src-tauri/target/release/bundle/nsis/Forgrin_0.1.0_x64-setup.exe").Length / 1MB
    Write-Host "   ✓ Installer found: $([math]::Round($installerSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Installer not found (run 'npm run build' to create)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the desktop app in development mode:" -ForegroundColor White
Write-Host "  npm run tauri dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "To build the production executable:" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the app:" -ForegroundColor White
Write-Host "  1. Run 'npm run tauri dev'" -ForegroundColor Cyan
Write-Host "  2. Navigate to /login" -ForegroundColor Cyan
Write-Host "  3. Register a new account" -ForegroundColor Cyan
Write-Host "  4. Login and test features" -ForegroundColor Cyan
Write-Host "  5. Check /dev/app-monitor for monitoring" -ForegroundColor Cyan
Write-Host ""
