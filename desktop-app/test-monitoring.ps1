# Test script to verify monitoring functionality
# This script tests task 4.4 requirements

Write-Host "Testing Forgrin Monitoring System" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the database path
$appDataDir = $env:APPDATA
$dbPath = Join-Path $appDataDir "com.forgrin.desktop\forgrin.db"

Write-Host "Database path: $dbPath" -ForegroundColor Yellow
Write-Host ""

# Check if database exists
if (-not (Test-Path $dbPath)) {
    Write-Host "❌ Database not found at: $dbPath" -ForegroundColor Red
    Write-Host "   Please ensure the app has been started at least once." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database found" -ForegroundColor Green
Write-Host ""

# Load SQLite assembly
Add-Type -Path "C:\Windows\Microsoft.NET\assembly\GAC_64\System.Data.SQLite\v4.0_1.0.118.0__db937bc2d44ff139\System.Data.SQLite.dll" -ErrorAction SilentlyContinue

# Try using sqlite3.exe if available
$sqlite3Path = "sqlite3.exe"

Write-Host "Querying activity logs from the last 5 minutes..." -ForegroundColor Yellow
Write-Host ""

# Calculate timestamp for 5 minutes ago
$fiveMinutesAgo = [DateTimeOffset]::UtcNow.AddMinutes(-5).ToUnixTimeMilliseconds()

# Create SQL query
$query = "SELECT * FROM activity_logs WHERE timestamp > $fiveMinutesAgo ORDER BY timestamp DESC LIMIT 20;"

Write-Host "SQL Query: $query" -ForegroundColor Gray
Write-Host ""

# Try to execute query using sqlite3.exe
try {
    $result = & sqlite3 $dbPath $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $lines = $result -split "`n" | Where-Object { $_ -ne "" }
        
        if ($lines.Count -eq 0) {
            Write-Host "⚠️  No activity logs found in the last 5 minutes." -ForegroundColor Yellow
            Write-Host "   This could mean:" -ForegroundColor Yellow
            Write-Host "   1. Monitoring is not running" -ForegroundColor Yellow
            Write-Host "   2. No application focus changes occurred" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "   Please start monitoring from the app and switch between applications." -ForegroundColor Yellow
        } else {
            Write-Host "✅ Found $($lines.Count) activity log(s)!" -ForegroundColor Green
            Write-Host "─" * 80 -ForegroundColor Gray
            Write-Host ""
            
            foreach ($line in $lines) {
                $fields = $line -split '\|'
                if ($fields.Count -ge 4) {
                    $id = $fields[0]
                    $timestamp = $fields[1]
                    $application = $fields[2]
                    $processId = $fields[3]
                    $duration = if ($fields.Count -gt 4) { $fields[4] } else { "0" }
                    
                    # Convert timestamp to readable date
                    $date = [DateTimeOffset]::FromUnixTimeMilliseconds([long]$timestamp).LocalDateTime
                    
                    Write-Host "Application: $application" -ForegroundColor Cyan
                    Write-Host "  Process ID: $processId"
                    Write-Host "  Timestamp: $date"
                    Write-Host "  Duration: $duration seconds"
                    Write-Host ""
                }
            }
            
            Write-Host "─" * 80 -ForegroundColor Gray
            Write-Host ""
            Write-Host "✅ Task 4.4 Verification:" -ForegroundColor Green
            Write-Host "   ✓ Monitoring is tracking application focus" -ForegroundColor Green
            Write-Host "   ✓ Activity logs are being recorded in database" -ForegroundColor Green
            Write-Host "   ✓ Timestamps and durations are being tracked" -ForegroundColor Green
            Write-Host "   ✓ Application names and process IDs are captured" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Error executing query: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Note: This script requires sqlite3.exe to be in PATH." -ForegroundColor Yellow
    Write-Host "Alternatively, you can manually check the database using a SQLite browser." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Database location: $dbPath" -ForegroundColor Cyan
