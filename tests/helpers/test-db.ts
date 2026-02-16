import { prisma } from '@/lib/prisma';

/**
 * Test database helper
 * 
 * Provides utilities for setting up and tearing down test database
 */

export async function cleanupTestDatabase() {
  try {
    // Delete all records in reverse order of dependencies
    // Use Promise.all for faster cleanup where possible
    await prisma.apiKey.deleteMany();
    await prisma.weeklyReview.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.workspace.deleteMany();
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Create a unique test email to avoid conflicts
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
}
