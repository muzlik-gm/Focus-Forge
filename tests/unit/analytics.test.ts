import {
  calculateDashboardMetrics,
  calculateWeeklyAnalytics,
  calculateMonthlyAnalytics,
  calculateStreak,
} from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    focusSession: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    task: {
      count: jest.fn(),
    },
  },
}));

describe('Analytics Service', () => {
  const mockUserId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('calculateDashboardMetrics', () => {
    it('should calculate today\'s metrics correctly', async () => {
      const now = new Date('2024-01-15T14:30:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const todayStart = new Date('2024-01-15T00:00:00Z');
      const todayEnd = new Date('2024-01-15T23:59:59.999Z');

      // Mock today's sessions
      const todaySessions = [
        {
          id: 'session1',
          userId: mockUserId,
          startTime: new Date('2024-01-15T09:00:00Z'),
          endTime: new Date('2024-01-15T10:00:00Z'),
          durationMinutes: 60,
          pausedMinutes: 0,
          distractionCount: 2,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-15T09:00:00Z'),
        },
        {
          id: 'session2',
          userId: mockUserId,
          startTime: new Date('2024-01-15T11:00:00Z'),
          endTime: new Date('2024-01-15T12:30:00Z'),
          durationMinutes: 90,
          pausedMinutes: 0,
          distractionCount: 1,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-15T11:00:00Z'),
        },
      ];

      // Mock last 7 days sessions
      const last7DaysSessions = [
        ...todaySessions,
        {
          id: 'session3',
          userId: mockUserId,
          startTime: new Date('2024-01-14T10:00:00Z'),
          endTime: new Date('2024-01-14T11:00:00Z'),
          durationMinutes: 60,
          pausedMinutes: 0,
          distractionCount: 0,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-14T10:00:00Z'),
        },
      ];

      (prisma.focusSession.findMany as jest.Mock)
        .mockResolvedValueOnce(todaySessions) // For today's sessions
        .mockResolvedValueOnce(todaySessions) // For streak calculation (today)
        .mockResolvedValueOnce([todaySessions[0]]) // For streak calculation (yesterday)
        .mockResolvedValueOnce([]) // For streak calculation (day before - breaks streak)
        .mockResolvedValueOnce(last7DaysSessions); // For weekly focus data

      (prisma.focusSession.count as jest.Mock)
        .mockResolvedValueOnce(1) // Today has sessions
        .mockResolvedValueOnce(1) // Yesterday has sessions
        .mockResolvedValueOnce(0); // Day before has no sessions

      (prisma.task.count as jest.Mock).mockResolvedValue(3);

      const metrics = await calculateDashboardMetrics(mockUserId);

      expect(metrics.todayFocusMinutes).toBe(150); // 60 + 90
      expect(metrics.todayTasksCompleted).toBe(3);
      expect(metrics.todayDistractions).toBe(3); // 2 + 1
      expect(metrics.activeStreakDays).toBe(2); // Today and yesterday
      expect(metrics.weeklyFocusData).toHaveLength(7);

      jest.useRealTimers();
    });

    it('should return zero metrics when no data exists', async () => {
      jest.clearAllMocks();
      
      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.focusSession.count as jest.Mock).mockResolvedValue(0);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      const metrics = await calculateDashboardMetrics(mockUserId);

      expect(metrics.todayFocusMinutes).toBe(0);
      expect(metrics.todayTasksCompleted).toBe(0);
      expect(metrics.todayDistractions).toBe(0);
      expect(metrics.activeStreakDays).toBe(0);
      expect(metrics.weeklyFocusData).toHaveLength(7);
    });
  });

  describe('calculateWeeklyAnalytics', () => {
    it('should calculate weekly analytics correctly', async () => {
      jest.clearAllMocks();
      
      const weekStartDate = new Date('2024-01-08T00:00:00Z'); // Monday

      const sessions = [
        {
          id: 'session1',
          userId: mockUserId,
          startTime: new Date('2024-01-08T09:00:00Z'),
          endTime: new Date('2024-01-08T10:00:00Z'),
          durationMinutes: 60,
          pausedMinutes: 0,
          distractionCount: 2,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-08T09:00:00Z'),
        },
        {
          id: 'session2',
          userId: mockUserId,
          startTime: new Date('2024-01-09T14:00:00Z'),
          endTime: new Date('2024-01-09T15:30:00Z'),
          durationMinutes: 90,
          pausedMinutes: 0,
          distractionCount: 1,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-09T14:00:00Z'),
        },
      ];

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const analytics = await calculateWeeklyAnalytics(mockUserId, weekStartDate);

      expect(analytics.totalFocusMinutes).toBe(150); // 60 + 90
      expect(analytics.dailyBreakdown).toHaveLength(7);
      expect(analytics.dailyBreakdown[0].date).toBe('2024-01-08');
      expect(analytics.dailyBreakdown[0].minutes).toBe(60);
      expect(analytics.dailyBreakdown[1].minutes).toBe(90);
      expect(analytics.distractionHeatmap.length).toBeGreaterThan(0);
      expect(analytics.focusByTimeOfDay).toHaveLength(24);
    });

    it('should handle empty week correctly', async () => {
      const weekStartDate = new Date('2024-01-08T00:00:00Z');

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue([]);

      const analytics = await calculateWeeklyAnalytics(mockUserId, weekStartDate);

      expect(analytics.totalFocusMinutes).toBe(0);
      expect(analytics.dailyBreakdown).toHaveLength(7);
      expect(analytics.dailyBreakdown.every((day) => day.minutes === 0)).toBe(true);
    });
  });

  describe('calculateMonthlyAnalytics', () => {
    it('should calculate monthly analytics with comparison', async () => {
      const month = '2024-01';

      const currentMonthSessions = [
        {
          id: 'session1',
          userId: mockUserId,
          startTime: new Date('2024-01-15T09:00:00Z'),
          endTime: new Date('2024-01-15T10:00:00Z'),
          durationMinutes: 60,
          pausedMinutes: 0,
          distractionCount: 0,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2024-01-15T09:00:00Z'),
        },
      ];

      const previousMonthSessions = [
        {
          id: 'session2',
          userId: mockUserId,
          startTime: new Date('2023-12-20T09:00:00Z'),
          endTime: new Date('2023-12-20T10:30:00Z'),
          durationMinutes: 90,
          pausedMinutes: 0,
          distractionCount: 0,
          distractions: [],
          notes: null,
          completed: true,
          createdAt: new Date('2023-12-20T09:00:00Z'),
        },
      ];

      (prisma.focusSession.findMany as jest.Mock)
        .mockResolvedValueOnce(currentMonthSessions)
        .mockResolvedValueOnce(previousMonthSessions);

      const analytics = await calculateMonthlyAnalytics(mockUserId, month);

      expect(analytics.totalCurrentMonth).toBe(60);
      expect(analytics.totalPreviousMonth).toBe(90);
      expect(analytics.currentMonth.length).toBeGreaterThan(0);
      expect(analytics.previousMonth.length).toBeGreaterThan(0);
    });
  });

  describe('calculateStreak', () => {
    it('should calculate streak correctly for consecutive days', async () => {
      const now = new Date('2024-01-15T14:30:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      // Mock sessions for today, yesterday, and day before
      (prisma.focusSession.count as jest.Mock)
        .mockResolvedValueOnce(1) // Today
        .mockResolvedValueOnce(1) // Yesterday
        .mockResolvedValueOnce(1) // Day before yesterday
        .mockResolvedValueOnce(0); // 3 days ago - breaks streak

      const streak = await calculateStreak(mockUserId);

      expect(streak).toBe(3);

      jest.useRealTimers();
    });

    it('should return 0 when no sessions today', async () => {
      const now = new Date('2024-01-15T14:30:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      (prisma.focusSession.count as jest.Mock).mockResolvedValue(0);

      const streak = await calculateStreak(mockUserId);

      expect(streak).toBe(0);

      jest.useRealTimers();
    });

    it('should return 1 when only today has sessions', async () => {
      const now = new Date('2024-01-15T14:30:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      (prisma.focusSession.count as jest.Mock)
        .mockResolvedValueOnce(1) // Today
        .mockResolvedValueOnce(0); // Yesterday - breaks streak

      const streak = await calculateStreak(mockUserId);

      expect(streak).toBe(1);

      jest.useRealTimers();
    });
  });
});
