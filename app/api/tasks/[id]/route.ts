import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { updateTask, deleteTask, getTaskById } from '@/lib/tasks';
import { notifyTaskComplete } from '@/lib/notifications';
import { TaskPriority } from '@prisma/client';

/**
 * Task Update and Delete API endpoints
 * 
 * PATCH /api/tasks/[id] - Update a task
 * DELETE /api/tasks/[id] - Delete a task
 * 
 * Requirements: 4.2, 4.6, 4.7
 */

// Validation schema for task updates
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  status: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimatedMinutes: z.number().int().positive('Estimated minutes must be positive').optional().nullable(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * PATCH /api/tasks/[id]
 * Update a task
 * 
 * Requirements: 4.2, 4.6
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update tasks',
          },
        },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Get the task before updating to check status change
    const oldTask = await getTaskById(taskId, session.user.id);

    // Update task using data access layer
    const task = await updateTask(taskId, session.user.id, {
      title: updateData.title,
      description: updateData.description === null ? undefined : updateData.description,
      status: updateData.status,
      priority: updateData.priority as TaskPriority | undefined,
      estimatedMinutes: updateData.estimatedMinutes === null ? undefined : updateData.estimatedMinutes,
      tags: updateData.tags,
      order: updateData.order,
    });

    if (!task) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          },
        },
        { status: 404 }
      );
    }

    // Create notification if task was just completed
    if (oldTask && oldTask.status !== 'DONE' && task.status === 'DONE') {
      try {
        await notifyTaskComplete(session.user.id, task.title);
      } catch (error) {
        console.error('Error creating notification:', error);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating the task',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 * 
 * Requirements: 4.7
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete tasks',
          },
        },
        { status: 401 }
      );
    }

    const taskId = params.id;

    // Delete task using data access layer
    const success = await deleteTask(taskId, session.user.id);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to delete it',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task deletion error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while deleting the task',
        },
      },
      { status: 500 }
    );
  }
}
