/**
 * @jest-environment node
 */

import { prisma } from '@/lib/prisma';
import { updateSessionNotes } from '@/lib/sessions';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    focusSession: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Sessions Data Access Layer', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';

  const mockFocusSession = {
    id: mockSessionId,
    userId: mockUserId,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: null,
    durationMinutes: 25,
    pausedMinutes: 0,
    distractionCount: 0,
    distractions: [],
    notes: null,
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSessionNotes', () => {
    it('should update session notes successfully', async () => {
      const updatedSession = { ...mockFocusSession, notes: 'Working on feature X' };
      
      mockPrisma.focusSession.findFirst.mockResolvedValue(mockFocusSession);
      mockPrisma.focusSession.update.mockResolvedValue(updatedSession);

      const result = await updateSessionNotes(
        mockSessionId,
        mockUserId,
        'Working on feature X'
      );

      expect(result).toEqual(updatedSession);
      expect(mockPrisma.focusSession.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockSessionId,
          userId: mockUserId,
        },
      });
      expect(mockPrisma.focusSession.update).toHaveBeenCalledWith({
        where: {
          id: mockSessionId,
        },
        data: {
          notes: 'Working on feature X',
        },
      });
    });

    it('should update session notes with empty string', async () => {
      const updatedSession = { ...mockFocusSession, notes: '' };
      
      mockPrisma.focusSession.findFirst.mockResolvedValue(mockFocusSession);
      mockPrisma.focusSession.update.mockResolvedValue(updatedSession);

      const result = await updateSessionNotes(
        mockSessionId,
        mockUserId,
        ''
      );

      expect(result).toEqual(updatedSession);
      expect(mockPrisma.focusSession.update).toHaveBeenCalledWith({
        where: {
          id: mockSessionId,
        },
        data: {
          notes: '',
        },
      });
    });

    it('should return null if session not found', async () => {
      mockPrisma.focusSession.findFirst.mockResolvedValue(null);

      const result = await updateSessionNotes(
        mockSessionId,
        mockUserId,
        'Test notes'
      );

      expect(result).toBeNull();
      expect(mockPrisma.focusSession.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockSessionId,
          userId: mockUserId,
        },
      });
      expect(mockPrisma.focusSession.update).not.toHaveBeenCalled();
    });

    it('should return null if session belongs to different user', async () => {
      mockPrisma.focusSession.findFirst.mockResolvedValue(null);

      const result = await updateSessionNotes(
        mockSessionId,
        'different-user-id',
        'Test notes'
      );

      expect(result).toBeNull();
      expect(mockPrisma.focusSession.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockSessionId,
          userId: 'different-user-id',
        },
      });
      expect(mockPrisma.focusSession.update).not.toHaveBeenCalled();
    });

    it('should allow updating notes for completed sessions', async () => {
      const completedSession = { ...mockFocusSession, completed: true };
      const updatedSession = { ...completedSession, notes: 'Updated notes' };
      
      mockPrisma.focusSession.findFirst.mockResolvedValue(completedSession);
      mockPrisma.focusSession.update.mockResolvedValue(updatedSession);

      const result = await updateSessionNotes(
        mockSessionId,
        mockUserId,
        'Updated notes'
      );

      expect(result).toEqual(updatedSession);
      expect(mockPrisma.focusSession.update).toHaveBeenCalled();
    });
  });
});
