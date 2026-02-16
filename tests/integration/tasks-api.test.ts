/**
 * @jest-environment node
 */

// Mock NextAuth session BEFORE imports
jest.mock('@/lib/auth', () => ({
  authOptions: {},
  getServerSession: jest.fn(),
}));

import { POST as CreateTask, GET as GetTasks } from '@/app/api/tasks/route';
import { PATCH as UpdateTask, DELETE as DeleteTask } from '@/app/api/tasks/[id]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';
import { getServerSession } from '@/lib/auth';

/**
 * Integration tests for task API endpoints
 * 
 * Tests the complete task management flow with actual database operations
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.6, 4.7
 */

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Task API Integration', () => {
  let testUserId: string;
  let testEmail: string;

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestDatabase();

    // Generate unique email for this test
    testEmail = generateTestEmail('tasktest');

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Task Test User',
        passwordHash: await bcrypt.hash('TestPassword123', 12),
      },
    });
    testUserId = user.id;

    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: testUserId,
        email: testEmail,
        name: 'Task Test User',
        subscriptionTier: 'FREE',
        workspaceId: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }, 30000); // Increase timeout for database operations

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up and disconnect after all tests
    await cleanupTestDatabase();
    await prisma.$disconnect();
  }, 30000);

  describe('POST /api/tasks', () => {
    it('should create a task with all fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'HIGH',
          estimatedMinutes: 60,
          tags: ['work', 'urgent'],
        }),
      });

      const response = await CreateTask(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.task).toMatchObject({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'HIGH',
        estimatedMinutes: 60,
        tags: ['work', 'urgent'],
        status: 'BACKLOG',
        userId: testUserId,
      });
      expect(data.task.id).toBeDefined();
      expect(data.task.order).toBe(0);
    });

    it('should create a task with minimal fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Minimal Task',
          priority: 'MEDIUM',
        }),
      });

      const response = await CreateTask(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.task).toMatchObject({
        title: 'Minimal Task',
        priority: 'MEDIUM',
        status: 'BACKLOG',
        userId: testUserId,
      });
      expect(data.task.description).toBeNull();
      expect(data.task.estimatedMinutes).toBeNull();
      expect(data.task.tags).toEqual([]);
    });

    it('should reject task with empty title', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: '',
          priority: 'MEDIUM',
        }),
      });

      const response = await CreateTask(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.title).toBeDefined();
    });

    it('should reject task with invalid priority', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          priority: 'INVALID',
        }),
      });

      const response = await CreateTask(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.priority).toBeDefined();
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          priority: 'MEDIUM',
        }),
      });

      const response = await CreateTask(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should assign correct order to multiple tasks', async () => {
      // Create three tasks
      for (let i = 0; i < 3; i++) {
        const request = new NextRequest('http://localhost:3000/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: `Task ${i + 1}`,
            priority: 'MEDIUM',
          }),
        });

        await CreateTask(request);
      }

      // Verify tasks have sequential order
      const tasks = await prisma.task.findMany({
        where: { userId: testUserId },
        orderBy: { order: 'asc' },
      });

      expect(tasks).toHaveLength(3);
      expect(tasks[0].order).toBe(0);
      expect(tasks[1].order).toBe(1);
      expect(tasks[2].order).toBe(2);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await prisma.task.createMany({
        data: [
          {
            title: 'Backlog Task',
            status: 'BACKLOG',
            priority: 'LOW',
            tags: ['personal'],
            userId: testUserId,
            order: 0,
          },
          {
            title: 'In Progress Task',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            tags: ['work', 'urgent'],
            userId: testUserId,
            order: 0,
          },
          {
            title: 'Done Task',
            status: 'DONE',
            priority: 'MEDIUM',
            tags: ['work'],
            userId: testUserId,
            order: 0,
            completedAt: new Date(),
          },
        ],
      });
    });

    it('should return all tasks without filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(3);
    });

    it('should filter tasks by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?status=IN_PROGRESS');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].status).toBe('IN_PROGRESS');
    });

    it('should filter tasks by priority', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?priority=HIGH');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].priority).toBe('HIGH');
    });

    it('should filter tasks by tags', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?tags=work');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(2);
      expect(data.tasks.every((t: any) => t.tags.includes('work'))).toBe(true);
    });

    it('should filter tasks by multiple tags', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?tags=work,urgent');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(2);
    });

    it('should combine multiple filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?status=IN_PROGRESS&priority=HIGH');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].status).toBe('IN_PROGRESS');
      expect(data.tasks[0].priority).toBe('HIGH');
    });

    it('should reject invalid status filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks?status=INVALID');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tasks');

      const response = await GetTasks(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/tasks/[id]', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Original Task',
          description: 'Original Description',
          status: 'BACKLOG',
          priority: 'MEDIUM',
          tags: ['original'],
          userId: testUserId,
          order: 0,
        },
      });
      taskId = task.id;
    });

    it('should update task title', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated Task',
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task.title).toBe('Updated Task');
      expect(data.task.description).toBe('Original Description');
    });

    it('should update task status', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'IN_PROGRESS',
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task.status).toBe('IN_PROGRESS');
    });

    it('should set completedAt when status changes to DONE', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'DONE',
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task.status).toBe('DONE');
      expect(data.task.completedAt).toBeTruthy();
    });

    it('should update multiple fields at once', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Multi Update',
          priority: 'URGENT',
          tags: ['updated', 'multi'],
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task.title).toBe('Multi Update');
      expect(data.task.priority).toBe('URGENT');
      expect(data.task.tags).toEqual(['updated', 'multi']);
    });

    it('should return 404 for non-existent task', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated',
        }),
      });

      const response = await UpdateTask(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should reject empty title', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: '',
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Updated',
        }),
      });

      const response = await UpdateTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          status: 'BACKLOG',
          priority: 'MEDIUM',
          userId: testUserId,
          order: 0,
        },
      });
      taskId = task.id;
    });

    it('should delete a task', async () => {
      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const response = await DeleteTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify task was deleted from database
      const deletedTask = await prisma.task.findUnique({
        where: { id: taskId },
      });
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
        method: 'DELETE',
      });

      const response = await DeleteTask(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const response = await DeleteTask(request, { params: { id: taskId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should not allow deleting another users task', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@test.com',
          name: 'Other User',
          passwordHash: await bcrypt.hash('Password123', 12),
        },
      });

      // Create task for other user
      const otherTask = await prisma.task.create({
        data: {
          title: 'Other User Task',
          status: 'BACKLOG',
          priority: 'MEDIUM',
          userId: otherUser.id,
          order: 0,
        },
      });

      // Try to delete other user's task
      const request = new NextRequest(`http://localhost:3000/api/tasks/${otherTask.id}`, {
        method: 'DELETE',
      });

      const response = await DeleteTask(request, { params: { id: otherTask.id } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');

      // Verify task still exists
      const stillExists = await prisma.task.findUnique({
        where: { id: otherTask.id },
      });
      expect(stillExists).toBeTruthy();
    });
  });
});
