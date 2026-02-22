import { prisma } from '@/lib/prisma';
import { Task, TaskStatus, TaskPriority, Prisma } from '@prisma/client';

/**
 * Task Data Access Layer
 * 
 * Provides functions for task management operations:
 * - createTask: Create a new task with automatic ordering
 * - getTasks: Retrieve tasks with filtering by status, priority, and tags
 * - updateTask: Update task properties
 * - deleteTask: Remove a task
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7
 */

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedMinutes?: number;
  tags?: string[];
  userId: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  tags?: string[];
  order?: number;
}

export interface GetTasksFilters {
  userId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
}

/**
 * Create a new task
 * 
 * Automatically assigns the task to the end of its status column by
 * finding the maximum order value for that status and incrementing it.
 * Validates that the userId references an existing user.
 * 
 * @param input - Task creation data
 * @returns The created task
 * 
 * Requirements: 4.1, 11.3
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // Validate foreign key - user must exist
  const userExists = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new Error('Foreign key constraint violation: userId does not exist');
  }

  const status = input.status || TaskStatus.BACKLOG;
  
  // Find the maximum order value for this user and status
  const maxOrderTask = await prisma.task.findFirst({
    where: {
      userId: input.userId,
      status,
    },
    orderBy: {
      order: 'desc',
    },
    select: {
      order: true,
    },
  });

  const nextOrder = (maxOrderTask?.order ?? -1) + 1;

  // Create the task with the calculated order
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      estimatedMinutes: input.estimatedMinutes,
      tags: input.tags || [],
      userId: input.userId,
      status,
      order: nextOrder,
    },
  });

  return task;
}

/**
 * Get tasks with optional filtering
 * 
 * Supports filtering by:
 * - status: Filter by task status (BACKLOG, IN_PROGRESS, DONE)
 * - priority: Filter by priority level (LOW, MEDIUM, HIGH, URGENT)
 * - tags: Filter by tags (returns tasks containing ANY of the specified tags)
 * 
 * Results are ordered by the order field within each status.
 * 
 * @param filters - Filter criteria
 * @returns Array of tasks matching the filters
 * 
 * Requirements: 4.3, 4.4, 4.5
 */
export async function getTasks(filters: GetTasksFilters): Promise<Task[]> {
  const where: Prisma.TaskWhereInput = {
    userId: filters.userId,
  };

  // Apply status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Apply priority filter
  if (filters.priority) {
    where.priority = filters.priority;
  }

  // Apply tags filter (tasks containing ANY of the specified tags)
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags,
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { status: 'asc' },
      { order: 'asc' },
    ],
  });

  return tasks;
}

/**
 * Get a single task by ID
 * 
 * @param taskId - ID of the task
 * @param userId - ID of the user (for authorization)
 * @returns The task, or null if not found or unauthorized
 */
export async function getTaskById(
  taskId: string,
  userId: string
): Promise<Task | null> {
  return await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });
}

/**
 * Update a task
 * 
 * Updates one or more fields of an existing task.
 * All fields are optional - only provided fields will be updated.
 * 
 * @param taskId - ID of the task to update
 * @param userId - ID of the user (for authorization)
 * @param input - Fields to update
 * @returns The updated task, or null if not found or unauthorized
 * 
 * Requirements: 4.6
 */
export async function updateTask(
  taskId: string,
  userId: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  // First verify the task exists and belongs to the user
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existingTask) {
    return null;
  }

  // Build update data object
  const updateData: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.order !== undefined) updateData.order = input.order;

  // Update completedAt timestamp when status changes to DONE
  if (input.status === TaskStatus.DONE && existingTask.status !== TaskStatus.DONE) {
    updateData.completedAt = new Date();
  } else if (input.status && input.status !== TaskStatus.DONE && existingTask.status === TaskStatus.DONE) {
    // Clear completedAt if moving away from DONE
    updateData.completedAt = null;
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: updateData,
  });

  return updatedTask;
}

/**
 * Delete a task
 * 
 * Permanently removes a task from the database.
 * Only the task owner can delete their tasks.
 * 
 * @param taskId - ID of the task to delete
 * @param userId - ID of the user (for authorization)
 * @returns true if deleted, false if not found or unauthorized
 * 
 * Requirements: 4.7
 */
export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  try {
    // Delete only if the task exists and belongs to the user
    const result = await prisma.task.deleteMany({
      where: {
        id: taskId,
        userId,
      },
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}
