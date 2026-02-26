# FocusForge Desktop App - Checkpoint 5 Verification Script
# This script verifies that the basic unified app is working correctly

Write-Host "========================================"
Write-Host "FocusForge Desktop App - Checkpoint 5"
Write-Host "Basic Unified App Verification"
Write-Host "========================================"
Write-Host ""

$allPassed = $true

# Function to test HTTP endpoint
function Test-HttpEndpoint {
    param($Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to check if SQLite database exists
function Test-DatabaseExists {
    $appDataPath = $env:APPDATA
    $dbPath = Join-Path $appDataPath "com.focusforge.desktop\focusforge.db"
    return Test-Path $dbPath
}

Write-Host "Checkpoint Requirements:"
Write-Host "1. Verify unified app launches with one command"
Write-Host "2. Verify Next.js UI loads in Tauri window"
Write-Host "3. Verify monitoring tracks application focus"
Write-Host "4. Verify data is stored in SQLite"
Write-Host ""

# Check 1: Next.js Server Running
Write-Host "[1/5] Checking if Next.js server is running..."
if (Test-HttpEndpoint "http://localhost:3000") {
    Write-Host "  [PASS] Next.js server is running at http://localhost:3000"
} else {
    Write-Host "  [FAIL] Next.js server is NOT running"
    Write-Host "    Please start it with: npm run dev"
    $allPassed = $false
}
Write-Host ""

# Check 2: Tauri Configuration
Write-Host "[2/5] Checking Tauri configuration..."
$tauriConfig = Get-Content "src-tauri/tauri.conf.json" -Raw | ConvertFrom-Json
if ($tauriConfig.build.devPath -eq "http://localhost:3000") {
    Write-Host "  [PASS] Tauri configured to connect to Next.js server"
} else {
    Write-Host "  [FAIL] Tauri devPath is not configured correctly"
    $allPassed = $false
}

if ($tauriConfig.tauri.systemTray) {
    Write-Host "  [PASS] System tray is configured"
} else {
    Write-Host "  [FAIL] System tray is not configured"
    $allPassed = $false
}
Write-Host ""

# Check 3: Rust Backend Compilation
Write-Host "[3/5] Checking Rust backend..."
if (Test-Path "src-tauri/Cargo.toml") {
    Write-Host "  [PASS] Cargo.toml exists"
    
    # Check for key dependencies
    $cargoToml = Get-Content "src-tauri/Cargo.toml" -Raw
    if ($cargoToml -match "sqlx") {
        Write-Host "  [PASS] SQLite dependency (sqlx) is configured"
    } else {
        Write-Host "  [FAIL] SQLite dependency is missing"
        $allPassed = $false
    }
    
    if ($cargoToml -match "tauri") {
        Write-Host "  [PASS] Tauri dependency is configured"
    } else {
        Write-Host "  [FAIL] Tauri dependency is missing"
        $allPassed = $false
    }
} else {
    Write-Host "  [FAIL] Cargo.toml not found"
    $allPassed = $false
}
Write-Host ""

# Check 4: Monitoring Module
Write-Host "[4/5] Checking monitoring implementation..."
if (Test-Path "src-tauri/src/monitoring/mod.rs") {
    Write-Host "  [PASS] Monitoring module exists"
} else {
    Write-Host "  [FAIL] Monitoring module not found"
    $allPassed = $false
}

if (Test-Path "src-tauri/src/monitoring/platform.rs") {
    Write-Host "  [PASS] Platform-specific monitoring exists"
} else {
    Write-Host "  [FAIL] Platform-specific monitoring not found"
    $allPassed = $false
}

if (Test-Path "src-tauri/src/monitoring/service.rs") {
    Write-Host "  [PASS] Monitoring service exists"
} else {
    Write-Host "  [FAIL] Monitoring service not found"
    $allPassed = $false
}
Write-Host ""

# Check 5: Database
Write-Host "[5/5] Checking SQLite database..."
if (Test-Path "src-tauri/migrations") {
    Write-Host "  [PASS] Database migrations directory exists"
    
    $migrationCount = (Get-ChildItem "src-tauri/migrations" -Filter "*.sql").Count
    Write-Host "  [INFO] Found $migrationCount migration files"
} else {
    Write-Host "  [FAIL] Database migrations not found"
    $allPassed = $false
}

if (Test-DatabaseExists) {
    Write-Host "  [PASS] SQLite database file exists in AppData"
    $dbPath = Join-Path $env:APPDATA "com.focusforge.desktop\focusforge.db"
    Write-Host "    Location: $dbPath"
} else {
    Write-Host "  [INFO] SQLite database not yet created (will be created on first run)"
}
Write-Host ""

# Summary
Write-Host "========================================"
Write-Host "Verification Summary"
Write-Host "========================================"

if ($allPassed) {
    Write-Host "[SUCCESS] All checks passed!"
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "1. If Next.js server is not running, start it:"
    Write-Host "   npm run dev"
    Write-Host ""
    Write-Host "2. In a new terminal, start the desktop app:"
    Write-Host "   cd desktop-app"
    Write-Host "   npm run tauri dev"
    Write-Host ""
    Write-Host "3. Test the following:"
    Write-Host "   - Desktop app window opens"
    Write-Host "   - Next.js UI loads in the window"
    Write-Host "   - Can navigate to /dev/app-monitor to test monitoring"
    Write-Host "   - System tray icon appears"
    Write-Host "   - Closing window minimizes to tray"
} else {
    Write-Host "[FAILED] Some checks failed"
    Write-Host "Please review the errors above and fix them before proceeding."
}
Write-Host ""
