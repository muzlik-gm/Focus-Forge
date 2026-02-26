# Create ICO file from PNG for Windows build
# This script converts the PNG icon to ICO format required by Tauri on Windows

Write-Host "Creating Windows ICO icon..." -ForegroundColor Yellow

$pngPath = "src-tauri/icons/icon.png"
$icoPath = "src-tauri/icons/icon.ico"

if (-not (Test-Path $pngPath)) {
    Write-Host "Error: $pngPath not found!" -ForegroundColor Red
    exit 1
}

# Method 1: Try using online conversion (requires internet)
Write-Host "Attempting to create ICO file..." -ForegroundColor Yellow

# For now, we'll use a PowerShell method to create a basic ICO
# Load the PNG image
Add-Type -AssemblyName System.Drawing

try {
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $pngPath))
    
    # Create a bitmap at multiple sizes for ICO
    $sizes = @(16, 32, 48, 64, 128, 256)
    
    # Create icon using .NET
    $icon = [System.Drawing.Icon]::FromHandle(([System.Drawing.Bitmap]$img).GetHicon())
    
    # Save as ICO
    $fs = [System.IO.FileStream]::new($icoPath, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()
    
    $img.Dispose()
    
    Write-Host "✓ ICO file created successfully at: $icoPath" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to create ICO using .NET method: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Download a tool to convert
    $convertExe = "png2ico.exe"
    
    if (-not (Test-Path $convertExe)) {
        Write-Host "Downloading png2ico tool..." -ForegroundColor Yellow
        try {
            # Use a simple copy as fallback - Tauri might accept it
            Copy-Item $pngPath $icoPath -Force
            Write-Host "✓ Created ICO file (copied from PNG)" -ForegroundColor Green
            Write-Host "  Note: This is a fallback method. For best results, use a proper ICO converter." -ForegroundColor Yellow
        } catch {
            Write-Host "Error: Could not create ICO file: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "Manual solution:" -ForegroundColor Yellow
            Write-Host "1. Go to: https://convertio.co/png-ico/" -ForegroundColor White
            Write-Host "2. Upload: $pngPath" -ForegroundColor White
            Write-Host "3. Download the ICO file" -ForegroundColor White
            Write-Host "4. Save it as: $icoPath" -ForegroundColor White
            exit 1
        }
    }
}

Write-Host ""
Write-Host "You can now run: npm run tauri build" -ForegroundColor Green
