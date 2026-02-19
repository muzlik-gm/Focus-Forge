/**
 * Property-Based Tests for Data Persistence
 * 
 * These tests verify that data persistence works correctly across all operations.
 * Each test validates a specific property that should hold true for all valid inputs.
 */

import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { createTask } from '@/lib/tasks';
import { startSession } from '@/lib/sessions';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';

/**
 * @jest-environment node
 */
describe('Persistence Properties', () => {
  beforeAll(async () => {
    await cleanupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  }, 30000);

  beforeEach(async () => {
    await cleanupTestDatabase();
  }, 30000);

  afterEach(async () => {
    await cleanupTestDatabase();
  }, 30000);

  /**
   * Property 26: General Persistence Round Trip
   * For any data entity (user, task, session, review) that is created or updated,
   * retrieving it from the database should return the same values that were written.
   * 
   * Validates: Requirements 11.1
   */
  describe('Property 26: General Persistence Round Trip', () => {
    test('user creation round trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          async ({ email, name }) => {
            // Create user
            const user = await prisma.user.create({
              data: {
                email,
                name,
                passwordHash: '$2a$10$exampleHash', // Mock hash
              },
            });

            // Retrieve user
            const retrievedUser = await prisma.user.findUnique({
              where: { id: user.id },
            });

            // Verify round trip
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser?.email).toBe(email);
            expect(retrievedUser?.name).toBe(name);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    test('task creation round trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }),
            description: fc.option(fc.string(), { nil: null }),
            priority: fc.constantFrom<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            estimatedMinutes: fc.option(fc.integer({ min: 1, max: 480 }), { nil: null }),
            tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
          }),
          async ({ title, description, priority, estimatedMinutes, tags }) => {
            // Create user first (required for foreign key)
            const user = await prisma.user.create({
              data: {
                email: generateTestEmail('task'),
                name: 'Test User',
                passwordHash: '$2a$10$exampleHash',
              },
            });

            // Create task
            const task = await prisma.task.create({
              data: {
                title,
                description,
                status: 'BACKLOG',
                priority,
                estimatedMinutes,
                tags,
                userId: user.id,
                order: 0,
              },
            });

            // Retrieve task
            const retrievedTask = await prisma.task.findUnique({
              where: { id: task.id },
            });

            // Verify round trip
            expect(retrievedTask).not.toBeNull();
            expect(retrievedTask?.title).toBe(title);
            expect(retrievedTask?.description).toBe(description);
            expect(retrievedTask?.priority).toBe(priority);
            expect(retrievedTask?.estimatedMinutes).toBe(estimatedMinutes);
            expect(retrievedTask?.tags).toEqual(tags);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    test('focus session creation round trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            durationMinutes: fc.integer({ min: 1, max: 480 }),
            distractionCount: fc.integer({ min: 0, max: 50 }),
            notes: fc.option(fc.string(), { nil: null }),
            completed: fc.boolean(),
          }),
          async ({ durationMinutes, distractionCount, notes, completed }) => {
            // Create user first (required for foreign key)
            const user = await prisma.user.create({
              data: {
                email: generateTestEmail('session'),
                name: 'Test User',
                passwordHash: '$2a$10$exampleHash',
              },
            });

            // Create focus session
            const session = await prisma.focusSession.create({
              data: {
                userId: user.id,
                startTime: new Date(),
                endTime: completed ? new Date() : null,
                durationMinutes,
                distractionCount,
                distractions: [],
                notes,
                completed,
              },
            });

            // Retrieve session
            const retrievedSession = await prisma.focusSession.findUnique({
              where: { id: session.id },
            });

            // Verify round trip
            expect(retrievedSession).not.toBeNull();
            expect(retrievedSession?.durationMinutes).toBe(durationMinutes);
            expect(retrievedSession?.distractionCount).toBe(distractionCount);
            expect(retrievedSession?.notes).toBe(notes);
            expect(retrievedSession?.completed).toBe(completed);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    test('weekly review creation round trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            reflection: fc.option(fc.string(), { nil: null }),
            aiSummary: fc.option(fc.string(), { nil: null }),
          }),
          async ({ reflection, aiSummary }) => {
            // Create user first (required for foreign key)
            const user = await prisma.user.create({
              data: {
                email: generateTestEmail('review'),
                name: 'Test User',
                passwordHash: '$2a$10$exampleHash',
              },
            });

            // Create weekly review
            const weekStart = new Date('2026-01-06T00:00:00.000Z'); // Monday
            const review = await prisma.weeklyReview.create({
              data: {
                userId: user.id,
                weekStartDate: weekStart,
                totalFocusMinutes: 120,
                tasksCompleted: 5,
                averageDistractions: 2.5,
                reflection,
                aiSummary,
              },
            });

            // Retrieve review
            const retrievedReview = await prisma.weeklyReview.findUnique({
              where: { id: review.id },
            });

            // Verify round trip
            expect(retrievedReview).not.toBeNull();
            expect(retrievedReview?.reflection).toBe(reflection);
            expect(retrievedReview?.aiSummary).toBe(aiSummary);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});

/**
 * Property 27: Foreign Key Integrity
 * For any attempt to create a record with a foreign key reference to a non-existent entity
 * (e.g., task with invalid userId), the system should reject the operation with a
 * foreign key constraint error.
 * 
 * Note: MongoDB does not enforce foreign key constraints at the database level.
 * Therefore, the application layer (data access functions) must validate foreign keys.
 * 
 * Validates: Requirements 11.3
 */
describe('Property 27: Foreign Key Integrity', () => {
  /**
   * Helper to generate a valid MongoDB ObjectId format
   */
  function generateInvalidObjectId(): string {
    return '000000000000000000000000';
  }

  test('task creation with invalid userId should fail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.option(fc.string(), { nil: null }),
          priority: fc.constantFrom<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
          estimatedMinutes: fc.option(fc.integer({ min: 1, max: 480 }), { nil: null }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        }),
        async ({ title, description, priority, estimatedMinutes, tags }) => {
          // Try to create task with non-existent userId using the data access layer
          // The data access layer validates foreign keys
          await expect(
            createTask({
              title,
              description,
              priority,
              estimatedMinutes,
              tags,
              userId: generateInvalidObjectId(),
            })
          ).rejects.toThrow('Foreign key constraint violation');
        }
      ),
      { numRuns: 3 }
    );
  }, 30000);

  test('focus session creation with invalid userId should fail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          durationMinutes: fc.integer({ min: 1, max: 480 }),
        }),
        async ({ durationMinutes }) => {
          // Try to create focus session with non-existent userId using the data access layer
          // The data access layer validates foreign keys
          await expect(
            startSession({
              userId: generateInvalidObjectId(),
              durationMinutes,
            })
          ).rejects.toThrow('Foreign key constraint violation');
        }
      ),
      { numRuns: 3 }
    );
  }, 30000);
});

/**
 * Property 28: Schema Validation
 * For any data that violates the schema definition (e.g., missing required field, wrong type),
 * the system should reject the operation before attempting database insertion.
 * 
 * Validates: Requirements 11.4
 */
describe('Property 28: Schema Validation', () => {
  test('user creation with missing required field should fail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          // name is missing - this should cause validation to fail
        }),
        async ({ email }) => {
          // Try to create user without required name field
          await expect(
            prisma.user.create({
              data: {
                email,
                passwordHash: '$2a$10$exampleHash',
              },
            })
          ).rejects.toThrow();
        }
      ),
      { numRuns: 3 }
    );
  }, 30000);

  test('task creation with valid data should succeed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.option(fc.string(), { nil: null }),
          priority: fc.constantFrom<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
          estimatedMinutes: fc.option(fc.integer({ min: 1, max: 480 }), { nil: null }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        }),
        async ({ title, description, priority, estimatedMinutes, tags }) => {
          // Create user first (required for foreign key)
          const user = await prisma.user.create({
            data: {
              email: generateTestEmail('task-valid'),
              name: 'Test User',
              passwordHash: '$2a$10$exampleHash',
            },
          });

          // Create task with valid data - should succeed
          const task = await prisma.task.create({
            data: {
              title,
              description,
              status: 'BACKLOG',
              priority,
              estimatedMinutes,
              tags,
              userId: user.id,
              order: 0,
            },
          });

          // Verify task was created
          expect(task).not.toBeNull();
          expect(task.title).toBe(title);
        }
      ),
      { numRuns: 3 }
    );
  }, 30000);

  test('focus session with valid duration should succeed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          durationMinutes: fc.integer({ min: 1, max: 480 }),
          distractionCount: fc.integer({ min: 0, max: 50 }),
          notes: fc.option(fc.string(), { nil: null }),
          completed: fc.boolean(),
        }),
        async ({ durationMinutes, distractionCount, notes, completed }) => {
          // Create user first (required for foreign key)
          const user = await prisma.user.create({
            data: {
              email: generateTestEmail('session-valid'),
              name: 'Test User',
              passwordHash: '$2a$10$exampleHash',
            },
          });

          // Create focus session with valid duration - should succeed
          const session = await prisma.focusSession.create({
            data: {
              userId: user.id,
              startTime: new Date(),
              endTime: completed ? new Date() : null,
              durationMinutes,
              distractionCount,
              distractions: [],
              notes,
              completed,
            },
          });

          // Verify session was created
          expect(session).not.toBeNull();
          expect(session.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 3 }
    );
  }, 30000);
});
