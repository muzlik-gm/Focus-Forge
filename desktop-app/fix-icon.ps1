# Fix Icon Issue - Create proper ICO file for Windows build

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Fixing Icon for Windows Build" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$pngPath = "src-tauri/icons/icon.png"
$icoPath = "src-tauri/icons/icon.ico"

if (-not (Test-Path $pngPath)) {
    Write-Host "Error: $pngPath not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Creating proper ICO file from PNG..." -ForegroundColor Yellow
Write-Host ""

# Load required assemblies
Add-Type -AssemblyName System.Drawing

try {
    # Load the PNG image
    $png = [System.Drawing.Image]::FromFile((Resolve-Path $pngPath).Path)
    
    # Create a 256x256 bitmap
    $bitmap = New-Object System.Drawing.Bitmap 256, 256
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($png, 0, 0, 256, 256)
    $graphics.Dispose()
    
    # Convert to icon
    $memoryStream = New-Object System.IO.MemoryStream
    $bitmap.Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
    $memoryStream.Position = 0
    
    # Create ICO file manually with proper header
    $icoStream = [System.IO.File]::Create($icoPath)
    
    # ICO header (6 bytes)
    $icoStream.WriteByte(0)  # Reserved
    $icoStream.WriteByte(0)  # Reserved
    $icoStream.WriteByte(1)  # Type: 1 = ICO
    $icoStream.WriteByte(0)  # Type high byte
    $icoStream.WriteByte(1)  # Number of images
    $icoStream.WriteByte(0)  # Number high byte
    
    # Image directory entry (16 bytes)
    $pngBytes = $memoryStream.ToArray()
    $icoStream.WriteByte(0)  # Width: 0 = 256
    $icoStream.WriteByte(0)  # Height: 0 = 256
    $icoStream.WriteByte(0)  # Color palette
    $icoStream.WriteByte(0)  # Reserved
    $icoStream.WriteByte(1)  # Color planes
    $icoStream.WriteByte(0)  # Color planes high
    $icoStream.WriteByte(32) # Bits per pixel
    $icoStream.WriteByte(0)  # Bits per pixel high
    
    # Size of image data
    $size = $pngBytes.Length
    $icoStream.WriteByte($size -band 0xFF)
    $icoStream.WriteByte(($size -shr 8) -band 0xFF)
    $icoStream.WriteByte(($size -shr 16) -band 0xFF)
    $icoStream.WriteByte(($size -shr 24) -band 0xFF)
    
    # Offset to image data (22 bytes from start)
    $icoStream.WriteByte(22)
    $icoStream.WriteByte(0)
    $icoStream.WriteByte(0)
    $icoStream.WriteByte(0)
    
    # Write PNG data
    $icoStream.Write($pngBytes, 0, $pngBytes.Length)
    
    $icoStream.Close()
    $memoryStream.Close()
    $bitmap.Dispose()
    $png.Dispose()
    
    Write-Host "Success! Created ICO file!" -ForegroundColor Green
    Write-Host "  Location: $icoPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can now run: npm run tauri build" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to create ICO file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative Solution:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Online Converter" -ForegroundColor Green
    Write-Host "1. Go to: https://convertio.co/png-ico/" -ForegroundColor White
    Write-Host "2. Upload: $pngPath" -ForegroundColor White
    Write-Host "3. Download the converted ICO file" -ForegroundColor White
    Write-Host "4. Save it as: $icoPath" -ForegroundColor White
    Write-Host ""
    
    exit 1
}
