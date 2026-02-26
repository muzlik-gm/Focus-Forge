# Install Build Tools for FocusForge Desktop
# This script helps install the required tools to build the Tauri application on Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FocusForge Build Tools Installer" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator for best results" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check Rust installation
Write-Host "Step 1: Checking Rust installation..." -ForegroundColor Yellow
Write-Host ""

$cargoPath = "$env:USERPROFILE\.cargo\bin\cargo.exe"
if (Test-Path $cargoPath) {
    $rustVersion = & $cargoPath --version
    Write-Host "✓ Rust is installed: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Rust is NOT installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 2: Check for Visual Studio Build Tools
Write-Host "Step 2: Checking for Visual Studio Build Tools..." -ForegroundColor Yellow
Write-Host ""

$vswherePath = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$buildToolsInstalled = $false

if (Test-Path $vswherePath) {
    $vsInstallations = & $vswherePath -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    
    if ($vsInstallations) {
        Write-Host "✓ Visual Studio Build Tools found:" -ForegroundColor Green
        foreach ($installation in $vsInstallations) {
            Write-Host "  - $installation" -ForegroundColor Gray
        }
        $buildToolsInstalled = $true
    }
}

if (-not $buildToolsInstalled) {
    Write-Host "✗ Visual Studio Build Tools with C++ NOT found" -ForegroundColor Red
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "INSTALLATION REQUIRED" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You need to install Visual Studio Build Tools with C++ support." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Automatic Installation (RECOMMENDED)" -ForegroundColor Green
    Write-Host "Run this command to download and install:" -ForegroundColor White
    Write-Host ""
    Write-Host 'winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.22000"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 2: Manual Installation" -ForegroundColor Yellow
    Write-Host "1. Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022" -ForegroundColor White
    Write-Host "2. Run the installer" -ForegroundColor White
    Write-Host "3. Select 'Desktop development with C++' workload" -ForegroundColor White
    Write-Host "4. Click Install" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to install now
    $response = Read-Host "Do you want to install Build Tools now using winget? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host ""
        Write-Host "Installing Visual Studio Build Tools..." -ForegroundColor Yellow
        Write-Host "This may take 10-20 minutes. Please wait..." -ForegroundColor Yellow
        Write-Host ""
        
        try {
            winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.22000"
            Write-Host ""
            Write-Host "✓ Installation complete!" -ForegroundColor Green
            Write-Host "Please restart PowerShell and run this script again to verify." -ForegroundColor Yellow
        } catch {
            Write-Host ""
            Write-Host "✗ Installation failed: $_" -ForegroundColor Red
            Write-Host "Please try manual installation instead." -ForegroundColor Yellow
        }
    }
    
    exit 1
}

Write-Host ""

# Step 3: Check for link.exe
Write-Host "Step 3: Checking for MSVC linker (link.exe)..." -ForegroundColor Yellow
Write-Host ""

$linkExeFound = $false
$vsInstallPath = & $vswherePath -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath

if ($vsInstallPath) {
    $vcToolsPath = Join-Path $vsInstallPath "VC\Tools\MSVC"
    if (Test-Path $vcToolsPath) {
        $latestVersion = Get-ChildItem $vcToolsPath | Sort-Object Name -Descending | Select-Object -First 1
        if ($latestVersion) {
            $linkExePath = Join-Path $latestVersion.FullName "bin\Hostx64\x64\link.exe"
            if (Test-Path $linkExePath) {
                Write-Host "✓ MSVC linker found: $linkExePath" -ForegroundColor Green
                $linkExeFound = $true
            }
        }
    }
}

if (-not $linkExeFound) {
    Write-Host "✗ MSVC linker (link.exe) not found" -ForegroundColor Red
    Write-Host "   This usually means the C++ tools weren't installed correctly." -ForegroundColor Yellow
    Write-Host "   Please reinstall Visual Studio Build Tools with C++ support." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 4: Verify environment
Write-Host "Step 4: Verifying build environment..." -ForegroundColor Yellow
Write-Host ""

# Check if we can find the Visual Studio environment
$vsDevCmd = Join-Path $vsInstallPath "Common7\Tools\VsDevCmd.bat"
if (Test-Path $vsDevCmd) {
    Write-Host "✓ Visual Studio Developer Command Prompt found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Visual Studio Developer Command Prompt not found" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Success!
Write-Host "==================================" -ForegroundColor Green
Write-Host "✓ ALL BUILD TOOLS INSTALLED!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now build the FocusForge desktop app!" -ForegroundColor Green
Write-Host ""
Write-Host "To build the app, run:" -ForegroundColor Yellow
Write-Host "  cd desktop-app" -ForegroundColor White
Write-Host "  npm run tauri build" -ForegroundColor White
Write-Host ""
Write-Host "For development mode, run:" -ForegroundColor Yellow
Write-Host "  cd desktop-app" -ForegroundColor White
Write-Host "  npm run tauri dev" -ForegroundColor White
Write-Host ""
Write-Host "Note: The first build will take 5-10 minutes as it compiles all Rust dependencies." -ForegroundColor Cyan
Write-Host "      Subsequent builds will be much faster." -ForegroundColor Cyan
Write-Host ""
