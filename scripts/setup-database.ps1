# FocusForge Database Setup Script (PowerShell)
# This script helps set up the database for development

Write-Host "🚀 FocusForge Database Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env.local from .env.local.example:"
    Write-Host "  Copy-Item .env.local.example .env.local" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then update DATABASE_URL with your PostgreSQL connection string."
    exit 1
}

# Check if DATABASE_URL is set
$envContent = Get-Content .env.local -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ Error: DATABASE_URL not found in .env.local" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add DATABASE_URL to your .env.local file:"
    Write-Host '  DATABASE_URL="postgresql://user:password@localhost:5432/focusforge?schema=public"' -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Test database connection
Write-Host "🔍 Testing database connection..." -ForegroundColor Cyan
$testConnection = npx prisma db pull --force 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to database" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:"
    Write-Host "  1. PostgreSQL is running"
    Write-Host "  2. DATABASE_URL in .env.local is correct"
    Write-Host "  3. Database exists (or will be created)"
    Write-Host ""
    Write-Host "Quick start with Docker:"
    Write-Host '  docker run --name focusforge-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres' -ForegroundColor Yellow
    Write-Host '  docker exec -it focusforge-db createdb -U postgres focusforge' -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database connection successful" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. View your database: npx prisma studio" -ForegroundColor Yellow
    Write-Host "  2. Run tests: npm test" -ForegroundColor Yellow
    Write-Host "  3. Start dev server: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "Check the error messages above for details."
    exit 1
}
