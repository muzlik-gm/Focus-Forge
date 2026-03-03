# Forgrin Desktop App Verification Script

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Forgrin Desktop App Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Rust
Write-Host "1. Checking Rust..." -ForegroundColor Yellow
$rustVersion = rustc --version 2>$null
if ($rustVersion) {
    Write-Host "   OK: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Rust not found" -ForegroundColor Red
    exit 1
}

# 2. Check Node.js
Write-Host "2. Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   OK: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}

# 3. Check dependencies
Write-Host "3. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   OK: Node modules installed" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Node modules not found" -ForegroundColor Yellow
}

# 4. Check Rust compilation
Write-Host "4. Checking Rust compilation..." -ForegroundColor Yellow
Push-Location src-tauri
cargo check --quiet 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Rust code compiles" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Rust compilation failed" -ForegroundColor Red
}
Pop-Location

# 5. Check migrations
Write-Host "5. Checking database migrations..." -ForegroundColor Yellow
$migrations = Get-ChildItem "src-tauri/migrations/*.sql" -ErrorAction SilentlyContinue
if ($migrations) {
    Write-Host "   OK: Found $($migrations.Count) migrations" -ForegroundColor Green
} else {
    Write-Host "   ERROR: No migrations found" -ForegroundColor Red
}

# 6. Check auth module
Write-Host "6. Checking auth module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/auth/mod.rs") {
    Write-Host "   OK: Auth module exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Auth module missing" -ForegroundColor Red
}

# 7. Check monitoring
Write-Host "7. Checking monitoring module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/monitoring/service.rs") {
    Write-Host "   OK: Monitoring service exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Monitoring service missing" -ForegroundColor Red
}

# 8. Check focus module
Write-Host "8. Checking focus module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/focus/session_manager.rs") {
    Write-Host "   OK: Focus manager exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Focus manager missing" -ForegroundColor Red
}

# 9. Check notifications
Write-Host "9. Checking notifications module..." -ForegroundColor Yellow
if (Test-Path "src-tauri/src/notifications/service.rs") {
    Write-Host "   OK: Notification service exists" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Notification service missing" -ForegroundColor Red
}

# 10. Check build artifacts
Write-Host "10. Checking build artifacts..." -ForegroundColor Yellow
if (Test-Path "src-tauri/target/release/Forgrin.exe") {
    $size = [math]::Round((Get-Item "src-tauri/target/release/Forgrin.exe").Length / 1MB, 2)
    Write-Host "   OK: Executable found ($size MB)" -ForegroundColor Green
} else {
    Write-Host "   INFO: Executable not built yet" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  Development: npm run tauri dev" -ForegroundColor Cyan
Write-Host "  Production:  npm run build" -ForegroundColor Cyan
Write-Host ""
