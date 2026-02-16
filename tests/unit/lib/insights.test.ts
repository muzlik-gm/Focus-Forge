import { generateInsights } from '@/lib/insights';
import { prisma } from '@/lib/prisma';
import { FocusSession } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    focusSession: {
      findMany: jest.fn(),
    },
  },
}));

describe('Insights Generation', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInsights', () => {
    it('should return insufficient data message when less than 3 sessions', async () => {
      // Mock insufficient sessions
      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue([
        {
          id: '1',
          userId: mockUserId,
          startTime: new Date(),
          durationMinutes: 30,
          distractionCount: 1,
          completed: true,
        },
      ]);

      const insights = await generateInsights(mockUserId, 30);

      expect(insights).toHaveLength(1);
      expect(insights[0].id).toBe('insufficient-data');
      expect(insights[0].message).toContain('Complete more focus sessions');
    });

    it('should generate time of day insight for morning sessions', async () => {
      // Mock morning sessions
      const morningSessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 9, 0, 0), // 9 AM
        durationMinutes: 60,
        distractionCount: 1,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 10, 0, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 9, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(morningSessions);

      const insights = await generateInsights(mockUserId, 30);

      const timeInsight = insights.find((i) => i.type === 'time-of-day');
      expect(timeInsight).toBeDefined();
      expect(timeInsight?.message).toContain('mornings');
    });

    it('should generate low distraction insight when average is below 1', async () => {
      // Mock sessions with low distractions
      const lowDistractionSessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 50,
        distractionCount: 0,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 11, 0, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(lowDistractionSessions);

      const insights = await generateInsights(mockUserId, 30);

      const distractionInsight = insights.find((i) => i.type === 'distraction');
      expect(distractionInsight).toBeDefined();
      expect(distractionInsight?.id).toBe('low-distractions');
      expect(distractionInsight?.message).toContain('great focus');
    });

    it('should generate high distraction insight when average is 3 or more', async () => {
      // Mock sessions with high distractions
      const highDistractionSessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 50,
        distractionCount: 4,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 11, 0, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(highDistractionSessions);

      const insights = await generateInsights(mockUserId, 30);

      const distractionInsight = insights.find((i) => i.type === 'distraction');
      expect(distractionInsight).toBeDefined();
      expect(distractionInsight?.id).toBe('high-distractions');
      expect(distractionInsight?.message).toContain('silencing notifications');
    });

    it('should generate short session insight when average is below 25 minutes', async () => {
      // Mock short sessions
      const shortSessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 15,
        distractionCount: 1,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 10, 15, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(shortSessions);

      const insights = await generateInsights(mockUserId, 30);

      const sessionLengthInsight = insights.find((i) => i.id === 'short-sessions');
      expect(sessionLengthInsight).toBeDefined();
      expect(sessionLengthInsight?.message).toContain('gradually increasing');
    });

    it('should generate optimal session insight when average is between 25-90 minutes', async () => {
      // Mock optimal sessions
      const optimalSessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 50,
        distractionCount: 1,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 11, 0, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(optimalSessions);

      const insights = await generateInsights(mockUserId, 30);

      const sessionLengthInsight = insights.find((i) => i.id === 'optimal-sessions');
      expect(sessionLengthInsight).toBeDefined();
      expect(sessionLengthInsight?.message).toContain('sweet spot');
    });

    it('should generate high consistency insight when working 70%+ of days', async () => {
      // Mock 21 days of sessions in a 30-day period (70%)
      const consistentSessions: Partial<FocusSession>[] = Array.from({ length: 21 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 50,
        distractionCount: 1,
        completed: true,
        endTime: new Date(2024, 0, i + 1, 11, 0, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(consistentSessions);

      const insights = await generateInsights(mockUserId, 30);

      const consistencyInsight = insights.find((i) => i.id === 'high-consistency');
      expect(consistencyInsight).toBeDefined();
      expect(consistencyInsight?.message).toContain('consistency is building');
    });

    it('should generate actionable insights with actionable flag', async () => {
      // Mock sessions that should generate actionable insights
      const sessions: Partial<FocusSession>[] = Array.from({ length: 5 }, (_, i) => ({
        id: `session-${i}`,
        userId: mockUserId,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0),
        durationMinutes: 15, // Short sessions - actionable
        distractionCount: 4, // High distractions - actionable
        completed: true,
        endTime: new Date(2024, 0, i + 1, 10, 15, 0),
        pausedMinutes: 0,
        distractions: [],
        notes: null,
        createdAt: new Date(2024, 0, i + 1, 10, 0, 0),
      }));

      (prisma.focusSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const insights = await generateInsights(mockUserId, 30);

      const actionableInsights = insights.filter((i) => i.actionable);
      expect(actionableInsights.length).toBeGreaterThan(0);
    });
  });
});
