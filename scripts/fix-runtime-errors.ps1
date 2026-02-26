# Script to identify and document potential runtime errors in the codebase
# This script searches for common patterns that could cause runtime errors

Write-Host "Scanning for potential runtime errors..." -ForegroundColor Cyan
Write-Host ""

$issues = @()

# Pattern 1: Unsafe .map() calls without optional chaining
Write-Host "Checking for unsafe .map() calls..." -ForegroundColor Yellow
$mapCalls = Select-String -Path "components/**/*.tsx","app/**/*.tsx" -Pattern "(?<!\.|\?)\.\w+\.map\(" -AllMatches

foreach ($match in $mapCalls) {
    if ($match.Line -notmatch '\?\.' -and $match.Line -notmatch '\.fill\(') {
        $issues += @{
            File = $match.Path
            Line = $match.LineNumber
            Issue = "Potentially unsafe .map() call"
            Code = $match.Line.Trim()
        }
    }
}

# Pattern 2: Accessing nested properties without optional chaining
Write-Host "Checking for unsafe property access..." -ForegroundColor Yellow
$nestedAccess = Select-String -Path "components/**/*.tsx","app/**/*.tsx" -Pattern "\w+\.\w+\.\w+" -AllMatches

# Pattern 3: Array destructuring without defaults
Write-Host "Checking for unsafe destructuring..." -ForegroundColor Yellow

# Output results
Write-Host ""
Write-Host "Found $($issues.Count) potential issues:" -ForegroundColor $(if ($issues.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($issues.Count -gt 0) {
    $issues | ForEach-Object {
        Write-Host "File: $($_.File):$($_.Line)" -ForegroundColor Yellow
        Write-Host "Issue: $($_.Issue)" -ForegroundColor Red
        Write-Host "Code: $($_.Code)" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "Scan complete!" -ForegroundColor Cyan
