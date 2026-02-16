/**
 * @jest-environment node
 */

import { createTask, getTasks, updateTask, deleteTask } from '@/lib/tasks';
import { prisma } from '@/lib/prisma';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';

/**
 * Unit tests for task data access layer
 * 
 * Tests cover:
 * - Task creation with automatic ordering
 * - Task retrieval with filtering (status, priority, tags)
 * - Task updates
 * - Task deletion
 * - Authorization checks
 */

describe('Task Data Access Layer', () => {
  let testUserId: string;
  let otherUserId: string;

  beforeAll(async () => {
    // Clean up first
    await cleanupTestDatabase();
    
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: generateTestEmail('tasktest'),
        name: 'Task Test User',
        passwordHash: 'hashedpassword',
      },
    });
    testUserId = testUser.id;

    const otherUser = await prisma.user.create({
      data: {
        email: generateTestEmail('other'),
        name: 'Other User',
        passwordHash: 'hashedpassword',
      },
    });
    otherUserId = otherUser.id;
  }, 30000); // Increase timeout for database operations

  afterAll(async () => {
    // Clean up test data
    if (testUserId && otherUserId) {
      await prisma.task.deleteMany({
        where: {
          userId: {
            in: [testUserId, otherUserId],
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [testUserId, otherUserId],
          },
        },
      });
    }
    await prisma.$disconnect();
  }, 30000);

  beforeEach(async () => {
    // Clean up tasks before each test
    await prisma.task.deleteMany({
      where: {
        userId: {
          in: [testUserId, otherUserId],
        },
      },
    });
  });

  describe('createTask', () => {
    it('should create a task with all fields', async () => {
      const input = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.HIGH,
        estimatedMinutes: 60,
        tags: ['urgent', 'backend'],
        userId: testUserId,
      };

      const task = await createTask(input);

      expect(task).toBeDefined();
      expect(task.title).toBe(input.title);
      expect(task.description).toBe(input.description);
      expect(task.priority).toBe(input.priority);
      expect(task.estimatedMinutes).toBe(input.estimatedMinutes);
      expect(task.tags).toEqual(input.tags);
      expect(task.userId).toBe(input.userId);
      expect(task.status).toBe(TaskStatus.BACKLOG);
      expect(task.order).toBe(0);
    });

    it('should create a task with minimal fields', async () => {
      const input = {
        title: 'Minimal Task',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
      };

      const task = await createTask(input);

      expect(task).toBeDefined();
      expect(task.title).toBe(input.title);
      expect(task.description).toBeNull();
      expect(task.priority).toBe(input.priority);
      expect(task.estimatedMinutes).toBeNull();
      expect(task.tags).toEqual([]);
      expect(task.status).toBe(TaskStatus.BACKLOG);
    });

    it('should assign correct order when creating multiple tasks', async () => {
      const task1 = await createTask({
        title: 'Task 1',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
      });

      const task2 = await createTask({
        title: 'Task 2',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
      });

      const task3 = await createTask({
        title: 'Task 3',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
      });

      expect(task1.order).toBe(0);
      expect(task2.order).toBe(1);
      expect(task3.order).toBe(2);
    });

    it('should assign correct order per status column', async () => {
      const backlogTask = await createTask({
        title: 'Backlog Task',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
        status: TaskStatus.BACKLOG,
      });

      const inProgressTask = await createTask({
        title: 'In Progress Task',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
        status: TaskStatus.IN_PROGRESS,
      });

      const backlogTask2 = await createTask({
        title: 'Backlog Task 2',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
        status: TaskStatus.BACKLOG,
      });

      expect(backlogTask.order).toBe(0);
      expect(inProgressTask.order).toBe(0);
      expect(backlogTask2.order).toBe(1);
    });

    it('should handle empty tags array', async () => {
      const task = await createTask({
        title: 'No Tags Task',
        priority: TaskPriority.LOW,
        userId: testUserId,
        tags: [],
      });

      expect(task.tags).toEqual([]);
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks with various properties
      await createTask({
        title: 'Backlog High Priority',
        priority: TaskPriority.HIGH,
        userId: testUserId,
        status: TaskStatus.BACKLOG,
        tags: ['urgent', 'backend'],
      });

      await createTask({
        title: 'Backlog Medium Priority',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
        status: TaskStatus.BACKLOG,
        tags: ['frontend'],
      });

      await createTask({
        title: 'In Progress Task',
        priority: TaskPriority.HIGH,
        userId: testUserId,
        status: TaskStatus.IN_PROGRESS,
        tags: ['backend'],
      });

      await createTask({
        title: 'Done Task',
        priority: TaskPriority.LOW,
        userId: testUserId,
        status: TaskStatus.DONE,
        tags: ['documentation'],
      });

      // Create task for other user
      await createTask({
        title: 'Other User Task',
        priority: TaskPriority.HIGH,
        userId: otherUserId,
        status: TaskStatus.BACKLOG,
      });
    });

    it('should get all tasks for a user', async () => {
      const tasks = await getTasks({ userId: testUserId });

      expect(tasks).toHaveLength(4);
      expect(tasks.every(task => task.userId === testUserId)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const backlogTasks = await getTasks({
        userId: testUserId,
        status: TaskStatus.BACKLOG,
      });

      expect(backlogTasks).toHaveLength(2);
      expect(backlogTasks.every(task => task.status === TaskStatus.BACKLOG)).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const highPriorityTasks = await getTasks({
        userId: testUserId,
        priority: TaskPriority.HIGH,
      });

      expect(highPriorityTasks).toHaveLength(2);
      expect(highPriorityTasks.every(task => task.priority === TaskPriority.HIGH)).toBe(true);
    });

    it('should filter tasks by tags', async () => {
      const backendTasks = await getTasks({
        userId: testUserId,
        tags: ['backend'],
      });

      expect(backendTasks).toHaveLength(2);
      expect(backendTasks.every(task => task.tags.includes('backend'))).toBe(true);
    });

    it('should filter tasks by multiple tags (OR logic)', async () => {
      const tasks = await getTasks({
        userId: testUserId,
        tags: ['backend', 'frontend'],
      });

      expect(tasks).toHaveLength(3);
      expect(
        tasks.every(task => 
          task.tags.includes('backend') || task.tags.includes('frontend')
        )
      ).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const tasks = await getTasks({
        userId: testUserId,
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Backlog High Priority');
    });

    it('should return tasks ordered by status and order', async () => {
      const tasks = await getTasks({ userId: testUserId });

      // Check that tasks are ordered by status first, then by order
      for (let i = 0; i < tasks.length - 1; i++) {
        const current = tasks[i];
        const next = tasks[i + 1];
        
        if (current.status === next.status) {
          expect(current.order).toBeLessThanOrEqual(next.order);
        }
      }
    });

    it('should return empty array when no tasks match filters', async () => {
      const tasks = await getTasks({
        userId: testUserId,
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.URGENT,
      });

      expect(tasks).toEqual([]);
    });

    it('should not return tasks from other users', async () => {
      const tasks = await getTasks({ userId: testUserId });

      expect(tasks.every(task => task.userId === testUserId)).toBe(true);
      expect(tasks.some(task => task.title === 'Other User Task')).toBe(false);
    });
  });

  describe('updateTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await createTask({
        title: 'Original Title',
        description: 'Original Description',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
        status: TaskStatus.BACKLOG,
        tags: ['original'],
        estimatedMinutes: 30,
      });
      taskId = task.id;
    });

    it('should update task title', async () => {
      const updated = await updateTask(taskId, testUserId, {
        title: 'Updated Title',
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.description).toBe('Original Description');
    });

    it('should update task description', async () => {
      const updated = await updateTask(taskId, testUserId, {
        description: 'Updated Description',
      });

      expect(updated).not.toBeNull();
      expect(updated!.description).toBe('Updated Description');
    });

    it('should update task status', async () => {
      const updated = await updateTask(taskId, testUserId, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task priority', async () => {
      const updated = await updateTask(taskId, testUserId, {
        priority: TaskPriority.URGENT,
      });

      expect(updated).not.toBeNull();
      expect(updated!.priority).toBe(TaskPriority.URGENT);
    });

    it('should update task tags', async () => {
      const updated = await updateTask(taskId, testUserId, {
        tags: ['new', 'tags'],
      });

      expect(updated).not.toBeNull();
      expect(updated!.tags).toEqual(['new', 'tags']);
    });

    it('should update task order', async () => {
      const updated = await updateTask(taskId, testUserId, {
        order: 5,
      });

      expect(updated).not.toBeNull();
      expect(updated!.order).toBe(5);
    });

    it('should update multiple fields at once', async () => {
      const updated = await updateTask(taskId, testUserId, {
        title: 'New Title',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('New Title');
      expect(updated!.priority).toBe(TaskPriority.HIGH);
      expect(updated!.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should set completedAt when status changes to DONE', async () => {
      const updated = await updateTask(taskId, testUserId, {
        status: TaskStatus.DONE,
      });

      expect(updated).not.toBeNull();
      expect(updated!.completedAt).not.toBeNull();
      expect(updated!.completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when status changes from DONE', async () => {
      // First mark as done
      await updateTask(taskId, testUserId, {
        status: TaskStatus.DONE,
      });

      // Then move back to in progress
      const updated = await updateTask(taskId, testUserId, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(updated).not.toBeNull();
      expect(updated!.completedAt).toBeNull();
    });

    it('should return null when task does not exist', async () => {
      // Use a valid MongoDB ObjectID format that doesn't exist
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updated = await updateTask(nonExistentId, testUserId, {
        title: 'New Title',
      });

      expect(updated).toBeNull();
    });

    it('should return null when user does not own the task', async () => {
      const updated = await updateTask(taskId, otherUserId, {
        title: 'Unauthorized Update',
      });

      expect(updated).toBeNull();

      // Verify task was not updated
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      expect(task!.title).toBe('Original Title');
    });
  });

  describe('deleteTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await createTask({
        title: 'Task to Delete',
        priority: TaskPriority.MEDIUM,
        userId: testUserId,
      });
      taskId = task.id;
    });

    it('should delete a task', async () => {
      const result = await deleteTask(taskId, testUserId);

      expect(result).toBe(true);

      // Verify task is deleted
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      expect(task).toBeNull();
    });

    it('should return false when task does not exist', async () => {
      // Use a valid MongoDB ObjectID format that doesn't exist
      const nonExistentId = '507f1f77bcf86cd799439011';
      const result = await deleteTask(nonExistentId, testUserId);

      expect(result).toBe(false);
    });

    it('should return false when user does not own the task', async () => {
      const result = await deleteTask(taskId, otherUserId);

      expect(result).toBe(false);

      // Verify task still exists
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      expect(task).not.toBeNull();
    });

    it('should not affect other user tasks', async () => {
      const otherTask = await createTask({
        title: 'Other User Task',
        priority: TaskPriority.LOW,
        userId: otherUserId,
      });

      await deleteTask(taskId, testUserId);

      // Verify other user's task still exists
      const task = await prisma.task.findUnique({ where: { id: otherTask.id } });
      expect(task).not.toBeNull();
    });
  });
});
