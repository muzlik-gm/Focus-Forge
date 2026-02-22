import { prisma } from './prisma';

/**
 * Notification Service
 * 
 * Provides functions for creating and managing notifications
 */

export type NotificationType = 
  | 'session_complete' 
  | 'task_complete' 
  | 'streak' 
  | 'reminder' 
  | 'team';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  return await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

/**
 * Create a session complete notification
 */
export async function notifySessionComplete(
  userId: string,
  durationMinutes: number,
  distractionCount: number
) {
  return await createNotification({
    userId,
    type: 'session_complete',
    title: 'Focus Session Complete',
    message: `Great job! You completed a ${durationMinutes}-minute focus session with ${distractionCount} distraction${distractionCount !== 1 ? 's' : ''}.`,
    link: '/analytics',
  });
}

/**
 * Create a task complete notification
 */
export async function notifyTaskComplete(userId: string, taskTitle: string) {
  return await createNotification({
    userId,
    type: 'task_complete',
    title: 'Task Completed',
    message: `You completed "${taskTitle}"`,
    link: '/tasks',
  });
}

/**
 * Create a streak milestone notification
 */
export async function notifyStreakMilestone(userId: string, streakDays: number) {
  return await createNotification({
    userId,
    type: 'streak',
    title: 'Streak Milestone!',
    message: `You've maintained a ${streakDays}-day focus streak!`,
    link: '/analytics',
  });
}

/**
 * Create a team update notification
 */
export async function notifyTeamUpdate(
  userId: string,
  title: string,
  message: string
) {
  return await createNotification({
    userId,
    type: 'team',
    title,
    message,
    link: '/team',
  });
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
      read: true,
    },
  });
}
