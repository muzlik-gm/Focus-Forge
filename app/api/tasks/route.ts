import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { createTask, getTasks } from '@/lib/tasks';
import { TaskStatus, TaskPriority } from '@prisma/client';

/**
 * Task API endpoints
 * 
 * POST /api/tasks - Create a new task
 * GET /api/tasks - List tasks with optional filters
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.6, 4.7
 */

// Validation schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  estimatedMinutes: z.number().int().positive('Estimated minutes must be positive').optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'DONE']).optional(),
});

/**
 * POST /api/tasks
 * Create a new task
 * 
 * Requirements: 4.1
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create tasks',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTaskSchema.safeParse(body);

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

    const { title, description, priority, estimatedMinutes, tags, status } = validationResult.data;

    // Create task using data access layer
    const task = await createTask({
      title,
      description,
      priority: priority as TaskPriority,
      estimatedMinutes,
      tags,
      status: status as TaskStatus | undefined,
      userId: session.user.id,
    });

    return NextResponse.json(
      { task },
      { status: 201 }
    );
  } catch (error) {
    console.error('Task creation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating the task',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks
 * List tasks with optional filters
 * 
 * Query parameters:
 * - status: Filter by task status (BACKLOG, IN_PROGRESS, DONE)
 * - priority: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
 * - tags: Comma-separated list of tags to filter by
 * 
 * Requirements: 4.3, 4.4
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view tasks',
          },
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tagsParam = searchParams.get('tags');

    // Validate status if provided
    if (status && !['BACKLOG', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid status value',
            details: { status: ['Must be BACKLOG, IN_PROGRESS, or DONE'] },
          },
        },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid priority value',
            details: { priority: ['Must be LOW, MEDIUM, HIGH, or URGENT'] },
          },
        },
        { status: 400 }
      );
    }

    // Parse tags
    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(t => t.length > 0) : undefined;

    // Get tasks using data access layer
    const tasks = await getTasks({
      userId: session.user.id,
      status: status as TaskStatus | undefined,
      priority: priority as TaskPriority | undefined,
      tags,
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Task retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving tasks',
        },
      },
      { status: 500 }
    );
  }
}
