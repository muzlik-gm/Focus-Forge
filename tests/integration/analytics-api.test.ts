/**
 * @jest-environment node
 */

// Mock NextAuth session BEFORE imports
jest.mock('@/lib/auth', () => ({
  authOptions: {},
  getServerSession: jest.fn(),
}));

import { GET as GetDashboard } from '@/app/api/analytics/dashboard/route';
import { GET as GetWeekly } from '@/app/api/analytics/weekly/route';
import { GET as GetMonthly } from '@/app/api/analytics/monthly/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';
import { getServerSession } from '@/lib/auth';

/**
 * Integration tests for analytics API endpoints
 * 
 * Tests the analytics endpoints with actual database operations
 * 
 * Requirements: 5.6, 5.7
 */

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Analytics API Integration', () => {
  let testUserId: string;
  let testEmail: string;

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestDatabase();

    // Generate unique email for this test
    testEmail = generateTestEmail('analyticstest');

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Analytics Test User',
        passwordHash: await bcrypt.hash('TestPassword123', 12),
      },
    });
    testUserId = user.id;

    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: {
        id: testUserId,
        email: testEmail,
        name: 'Analytics Test User',
        subscriptionTier: 'FREE',
        workspaceId: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }, 30000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  }, 30000);

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard metrics with no sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        todayFocusMinutes: 0,
        todayTasksCompleted: 0,
        activeStreakDays: 0,
        todayDistractions: 0,
        weeklyFocusData: expect.any(Array),
      });
      expect(data.weeklyFocusData).toHaveLength(7);
    });

    it('should calculate today\'s focus minutes correctly', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      // Create completed sessions for today
      await prisma.focusSession.createMany({
        data: [
          {
            userId: testUserId,
            startTime: today,
            durationMinutes: 25,
            completed: true,
            distractionCount: 2,
            distractions: [],
          },
          {
            userId: testUserId,
            startTime: new Date(today.getTime() + 60 * 60 * 1000), // 1 hour later
            durationMinutes: 50,
            completed: true,
            distractionCount: 1,
            distractions: [],
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todayFocusMinutes).toBe(75);
      expect(data.todayDistractions).toBe(3);
    });

    it('should calculate today\'s completed tasks correctly', async () => {
      const today = new Date();

      // Create completed tasks for today
      await prisma.task.createMany({
        data: [
          {
            title: 'Task 1',
            status: 'DONE',
            priority: 'MEDIUM',
            userId: testUserId,
            order: 0,
            completedAt: today,
          },
          {
            title: 'Task 2',
            status: 'DONE',
            priority: 'HIGH',
            userId: testUserId,
            order: 1,
            completedAt: today,
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todayTasksCompleted).toBe(2);
    });

    it('should calculate active streak correctly', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      // Create sessions for the last 3 consecutive days
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        await prisma.focusSession.create({
          data: {
            userId: testUserId,
            startTime: date,
            durationMinutes: 25,
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
        });
      }

      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeStreakDays).toBe(3);
    });

    it('should return weekly focus data for last 7 days', async () => {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      // Create sessions for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        await prisma.focusSession.create({
          data: {
            userId: testUserId,
            startTime: date,
            durationMinutes: 25 + i * 5, // Varying durations
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
        });
      }

      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weeklyFocusData).toHaveLength(7);
      expect(data.weeklyFocusData.every((d: any) => d.date && typeof d.minutes === 'number')).toBe(true);
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/analytics/dashboard');

      const response = await GetDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/analytics/weekly', () => {
    it('should return weekly analytics with no sessions', async () => {
      const weekStart = new Date('2024-01-01T00:00:00.000Z'); // Monday
      const request = new NextRequest(
        `http://localhost:3000/api/analytics/weekly?weekStartDate=${weekStart.toISOString()}`
      );

      const response = await GetWeekly(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        totalFocusMinutes: 0,
        dailyBreakdown: expect.any(Array),
        distractionHeatmap: expect.any(Array),
        focusByTimeOfDay: expect.any(Array),
      });
      expect(data.dailyBreakdown).toHaveLength(7);
      expect(data.focusByTimeOfDay).toHaveLength(24);
    });

    it('should calculate weekly analytics correctly', async () => {
      const weekStart = new Date('2024-01-01T00:00:00.000Z'); // Monday

      // Create sessions for the week
      await prisma.focusSession.createMany({
        data: [
          {
            userId: testUserId,
            startTime: new Date('2024-01-01T10:00:00.000Z'),
            durationMinutes: 25,
            completed: true,
            distractionCount: 2,
            distractions: [],
          },
          {
            userId: testUserId,
            startTime: new Date('2024-01-02T14:00:00.000Z'),
            durationMinutes: 50,
            completed: true,
            distractionCount: 1,
            distractions: [],
          },
          {
            userId: testUserId,
            startTime: new Date('2024-01-03T09:00:00.000Z'),
            durationMinutes: 30,
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
        ],
      });

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/weekly?weekStartDate=${weekStart.toISOString()}`
      );

      const response = await GetWeekly(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalFocusMinutes).toBe(105);
      expect(data.dailyBreakdown).toHaveLength(7);
      expect(data.distractionHeatmap.length).toBeGreaterThan(0);
      expect(data.focusByTimeOfDay).toHaveLength(24);
    });

    it('should require weekStartDate parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/weekly');

      const response = await GetWeekly(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('weekStartDate');
    });

    it('should reject invalid date format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/weekly?weekStartDate=invalid-date'
      );

      const response = await GetWeekly(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Invalid date');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const weekStart = new Date('2024-01-01T00:00:00.000Z');
      const request = new NextRequest(
        `http://localhost:3000/api/analytics/weekly?weekStartDate=${weekStart.toISOString()}`
      );

      const response = await GetWeekly(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/analytics/monthly', () => {
    it('should return monthly analytics with no sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/monthly?month=2024-01');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        currentMonth: expect.any(Array),
        previousMonth: expect.any(Array),
        totalCurrentMonth: 0,
        totalPreviousMonth: 0,
      });
    });

    it('should calculate monthly analytics correctly', async () => {
      // Create sessions for January 2024
      await prisma.focusSession.createMany({
        data: [
          {
            userId: testUserId,
            startTime: new Date('2024-01-15T10:00:00.000Z'),
            durationMinutes: 25,
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
          {
            userId: testUserId,
            startTime: new Date('2024-01-20T14:00:00.000Z'),
            durationMinutes: 50,
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
        ],
      });

      // Create sessions for December 2023 (previous month)
      await prisma.focusSession.createMany({
        data: [
          {
            userId: testUserId,
            startTime: new Date('2023-12-10T10:00:00.000Z'),
            durationMinutes: 30,
            completed: true,
            distractionCount: 0,
            distractions: [],
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/analytics/monthly?month=2024-01');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalCurrentMonth).toBe(75);
      expect(data.totalPreviousMonth).toBe(30);
      expect(data.currentMonth.length).toBeGreaterThan(0);
      expect(data.previousMonth.length).toBeGreaterThan(0);
    });

    it('should require month parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/monthly');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('month');
    });

    it('should reject invalid month format', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/monthly?month=2024-1');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('format');
    });

    it('should reject invalid month value', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/monthly?month=2024-13');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('month');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/analytics/monthly?month=2024-01');

      const response = await GetMonthly(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
