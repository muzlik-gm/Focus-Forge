#!/bin/bash

# Forgrin Database Setup Script
# This script helps set up the database for development

echo "🚀 Forgrin Database Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo ""
    echo "Please create .env.local from .env.local.example:"
    echo "  cp .env.local.example .env.local"
    echo ""
    echo "Then update DATABASE_URL with your PostgreSQL connection string."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    echo ""
    echo "Please add DATABASE_URL to your .env.local file:"
    echo '  DATABASE_URL="postgresql://user:password@localhost:5432/forgrin?schema=public"'
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Test database connection
echo "🔍 Testing database connection..."
npx prisma db pull --force 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to database"
    echo ""
    echo "Please ensure:"
    echo "  1. PostgreSQL is running"
    echo "  2. DATABASE_URL in .env.local is correct"
    echo "  3. Database exists (or will be created)"
    echo ""
    echo "Quick start with Docker:"
    echo '  docker run --name forgrin-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres'
    echo '  docker exec -it forgrin-db createdb -U postgres forgrin'
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. View your database: npx prisma studio"
    echo "  2. Run tests: npm test"
    echo "  3. Start dev server: npm run dev"
else
    echo ""
    echo "❌ Migration failed"
    echo "Check the error messages above for details."
    exit 1
fi
