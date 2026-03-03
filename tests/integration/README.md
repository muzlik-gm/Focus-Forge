# Integration Tests

Integration tests verify the complete functionality of the application with actual database operations.

## Prerequisites

Before running integration tests, you need:

1. **PostgreSQL Database**: A running PostgreSQL instance
2. **Environment Variables**: Create a `.env.local` file with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/forgrin_test?schema=public"
   NEXTAUTH_SECRET="test-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Schema**: Run migrations to set up the test database:
   ```bash
   npx prisma migrate dev
   ```

## Running Integration Tests

Run all integration tests:
```bash
npm test -- tests/integration --runInBand
```

Run specific integration test:
```bash
npm test -- tests/integration/auth-registration.test.ts --runInBand
```

**Note**: The `--runInBand` flag ensures tests run sequentially to avoid database conflicts.

## Test Database Cleanup

Integration tests automatically clean up test data:
- Before each test: Removes all existing test data
- After all tests: Final cleanup and database disconnect

## Writing Integration Tests

When writing integration tests:

1. Use `@jest-environment node` directive
2. Import `cleanupTestDatabase` from `tests/helpers/test-db`
3. Clean up before each test and after all tests
4. Use the actual Prisma client from `@/lib/prisma`
5. Test complete workflows, not just individual functions

Example:
```typescript
/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { cleanupTestDatabase } from '../helpers/test-db';

describe('My Integration Test', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  it('should test something', async () => {
    // Your test code here
  });
});
```
