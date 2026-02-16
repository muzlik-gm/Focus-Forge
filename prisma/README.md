# Database Setup Guide

## Prerequisites

Before running migrations, you need:

1. **PostgreSQL Database Running**
   - Install PostgreSQL locally, or
   - Use a cloud provider (e.g., Supabase, Railway, Neon), or
   - Use Docker: `docker run --name focusforge-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Environment Configuration**
   - Copy `.env.local.example` to `.env.local`
   - Update `DATABASE_URL` with your PostgreSQL connection string

## Database URL Format

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example for local development:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/focusforge?schema=public"
```

## Running Migrations

Once your database is running and `DATABASE_URL` is configured:

```bash
# Create and apply the initial migration
npx prisma migrate dev --name init

# Generate Prisma Client (already done)
npx prisma generate

# View your database in Prisma Studio
npx prisma studio
```

## Migration Commands

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready` or check Docker container
- Check DATABASE_URL format and credentials
- Ensure database exists (create it if needed)

### Migration Errors
- Check Prisma schema syntax: `npx prisma validate`
- View detailed logs: `npx prisma migrate dev --help`

## Next Steps

After successful migration:
1. Verify tables were created: `npx prisma studio`
2. Run tests to ensure database connectivity
3. Start the development server: `npm run dev`
