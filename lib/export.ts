import { prisma } from '@/lib/prisma';

/**
 * Data Export Functions
 * 
 * Provides functions for exporting user data:
 * - exportUserData: Export all user data as JSON
 * - exportSessionsAsCSV: Export focus sessions as CSV
 * - exportTasksAsCSV: Export tasks as CSV
 * 
 * Requirements: 34
 */

/**
 * Export all user data as JSON
 * 
 * Exports user profile, tasks, focus sessions, and weekly reviews.
 * Excludes sensitive data like password hashes.
 * 
 * @param userId - ID of the user
 * @returns User data object for export
 * 
 * Requirements: 34
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspace: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
      focusSessions: {
        orderBy: { startTime: 'desc' },
      },
      weeklyReviews: {
        orderBy: { weekStartDate: 'desc' },
      },
      apiKeys: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          lastUsed: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Build export data (excluding sensitive fields)
  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    workspace: user.workspace
      ? {
          id: user.workspace.id,
          name: user.workspace.name,
          createdAt: user.workspace.createdAt,
        }
      : null,
    tasks: user.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags,
      order: task.order,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    })),
    focusSessions: user.focusSessions.map((session) => ({
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      pausedMinutes: session.pausedMinutes,
      distractionCount: session.distractionCount,
      distractions: session.distractions,
      notes: session.notes,
      completed: session.completed,
      createdAt: session.createdAt,
    })),
    weeklyReviews: user.weeklyReviews.map((review) => ({
      id: review.id,
      weekStartDate: review.weekStartDate,
      totalFocusMinutes: review.totalFocusMinutes,
      tasksCompleted: review.tasksCompleted,
      averageDistractions: review.averageDistractions,
      reflection: review.reflection,
      aiSummary: review.aiSummary,
      createdAt: review.createdAt,
    })),
    apiKeys: user.apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
    })),
  };

  return exportData;
}

/**
 * Export focus sessions as CSV
 * 
 * @param userId - ID of the user
 * @returns CSV string of focus sessions
 * 
 * Requirements: 34
 */
export async function exportSessionsAsCSV(userId: string): Promise<string> {
  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
  });

  // CSV header
  let csv = 'ID,Start Time,End Time,Duration (min),Paused (min),Distractions,Completed,Notes\n';

  // Add data rows
  sessions.forEach((session) => {
    const row = [
      session.id,
      session.startTime.toISOString(),
      session.endTime?.toISOString() || '',
      session.durationMinutes,
      session.pausedMinutes,
      session.distractionCount,
      session.completed ? 'Yes' : 'No',
      // Escape quotes in notes
      `"${(session.notes || '').replace(/"/g, '""')}"`,
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}

/**
 * Export tasks as CSV
 * 
 * @param userId - ID of the user
 * @returns CSV string of tasks
 * 
 * Requirements: 34
 */
export async function exportTasksAsCSV(userId: string): Promise<string> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // CSV header
  let csv = 'ID,Title,Description,Status,Priority,Estimated (min),Tags,Order,Created At,Completed At\n';

  // Add data rows
  tasks.forEach((task) => {
    const row = [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.status,
      task.priority,
      task.estimatedMinutes || '',
      `"${task.tags.join(', ')}"`,
      task.order,
      task.createdAt.toISOString(),
      task.completedAt?.toISOString() || '',
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}