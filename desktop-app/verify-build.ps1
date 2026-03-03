# Build Verification Script for Forgrin Desktop
# This script checks all prerequisites and verifies the build configuration

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Forgrin Desktop Build Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$allChecks = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    $allChecks = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    $allChecks = $false
}

# Check Rust
Write-Host "Checking Rust..." -ForegroundColor Yellow
try {
    $cargoVersion = cargo --version
    Write-Host "  ✓ Cargo installed: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Rust/Cargo not found. Install from https://rustup.rs/" -ForegroundColor Red
    $allChecks = $false
}

try {
    $rustcVersion = rustc --version
    Write-Host "  ✓ Rustc installed: $rustcVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Rustc not found" -ForegroundColor Red
    $allChecks = $false
}

# Check Visual Studio Build Tools (CRITICAL FOR WINDOWS)
Write-Host "Checking Visual Studio Build Tools..." -ForegroundColor Yellow
$vswherePath = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswherePath) {
    $vsInstallations = & $vswherePath -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    
    if ($vsInstallations) {
        Write-Host "  ✓ Visual Studio Build Tools with C++ found" -ForegroundColor Green
        
        # Check for link.exe
        $vsInstallPath = & $vswherePath -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        $vcToolsPath = Join-Path $vsInstallPath "VC\Tools\MSVC"
        if (Test-Path $vcToolsPath) {
            $latestVersion = Get-ChildItem $vcToolsPath | Sort-Object Name -Descending | Select-Object -First 1
            if ($latestVersion) {
                $linkExePath = Join-Path $latestVersion.FullName "bin\Hostx64\x64\link.exe"
                if (Test-Path $linkExePath) {
                    Write-Host "  ✓ MSVC linker (link.exe) found" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ MSVC linker (link.exe) not found" -ForegroundColor Red
                    Write-Host "    Run: .\install-build-tools.ps1" -ForegroundColor Yellow
                    $allChecks = $false
                }
            }
        }
    } else {
        Write-Host "  ✗ Visual Studio Build Tools with C++ not found" -ForegroundColor Red
        Write-Host "    This is REQUIRED to build Rust apps on Windows" -ForegroundColor Yellow
        Write-Host "    Run: .\install-build-tools.ps1" -ForegroundColor Yellow
        $allChecks = $false
    }
} else {
    Write-Host "  ✗ Visual Studio Build Tools not found" -ForegroundColor Red
    Write-Host "    This is REQUIRED to build Rust apps on Windows" -ForegroundColor Yellow
    Write-Host "    Run: .\install-build-tools.ps1" -ForegroundColor Yellow
    $allChecks = $false
}

# Check if we're in the desktop-app directory
Write-Host "Checking directory..." -ForegroundColor Yellow
if (Test-Path "src-tauri/Cargo.toml") {
    Write-Host "  ✓ In desktop-app directory" -ForegroundColor Green
} else {
    Write-Host "  ✗ Not in desktop-app directory. Run: cd desktop-app" -ForegroundColor Red
    $allChecks = $false
}

# Check configuration files
Write-Host "Checking configuration files..." -ForegroundColor Yellow

if (Test-Path "src-tauri/tauri.conf.json") {
    Write-Host "  ✓ tauri.conf.json exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ tauri.conf.json missing" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path "src-tauri/Cargo.toml") {
    Write-Host "  ✓ Cargo.toml exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Cargo.toml missing" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path "../next.config.mjs") {
    Write-Host "  ✓ next.config.mjs exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ next.config.mjs missing" -ForegroundColor Red
    $allChecks = $false
}

# Check source files
Write-Host "Checking source files..." -ForegroundColor Yellow

if (Test-Path "src-tauri/src/main.rs") {
    Write-Host "  ✓ main.rs exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ main.rs missing" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path "src-tauri/src/commands.rs") {
    Write-Host "  ✓ commands.rs exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ commands.rs missing" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path "src-tauri/src/database/mod.rs") {
    Write-Host "  ✓ database module exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ database module missing" -ForegroundColor Red
    $allChecks = $false
}

if (Test-Path "src-tauri/migrations/20240101000001_initial_schema.sql") {
    Write-Host "  ✓ database migration exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ database migration missing" -ForegroundColor Red
    $allChecks = $false
}

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "  ✓ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Node modules not installed. Run: npm install" -ForegroundColor Yellow
}

if (Test-Path "../node_modules") {
    Write-Host "  ✓ Root node modules installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Root node modules not installed. Run: cd .. && npm install" -ForegroundColor Yellow
}

# Check port 3000
Write-Host "Checking port 3000..." -ForegroundColor Yellow
$port3000InUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000InUse) {
    Write-Host "  ⚠ Port 3000 is in use. Stop other processes or change devPath in tauri.conf.json" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Port 3000 is available" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($allChecks) {
    Write-Host "✓ All critical checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  npm install          # Install dependencies (if needed)" -ForegroundColor White
    Write-Host "  npm run tauri dev    # Start development server" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✗ Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "  1. Install Rust: https://rustup.rs/" -ForegroundColor White
    Write-Host "  2. Install Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "  3. Run: cd desktop-app" -ForegroundColor White
    Write-Host "  4. Run: npm install" -ForegroundColor White
    Write-Host ""
}

Write-Host "For detailed information, see BUILD_VERIFICATION.md" -ForegroundColor Cyan
