/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST as updateNotes } from '@/app/api/sessions/[id]/notes/route';
import * as sessionsLib from '@/lib/sessions';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/sessions');

import { getServerSession } from 'next-auth';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockUpdateSessionNotes = sessionsLib.updateSessionNotes as jest.MockedFunction<typeof sessionsLib.updateSessionNotes>;

describe('Session Notes API Endpoint', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';
  
  const mockSession = {
    user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    expires: '2024-12-31',
  };

  const mockFocusSession = {
    id: mockSessionId,
    userId: mockUserId,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: null,
    durationMinutes: 25,
    pausedMinutes: 0,
    distractionCount: 0,
    distractions: [],
    notes: 'Working on authentication feature',
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sessions/[id]/notes', () => {
    it('should update session notes with valid input', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockUpdateSessionNotes.mockResolvedValue(mockFocusSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Working on authentication feature' }),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual({
        ...mockFocusSession,
        startTime: mockFocusSession.startTime.toISOString(),
        createdAt: mockFocusSession.createdAt.toISOString(),
      });
      expect(mockUpdateSessionNotes).toHaveBeenCalledWith(
        mockSessionId,
        mockUserId,
        'Working on authentication feature'
      );
    });

    it('should update session notes with empty string', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const sessionWithEmptyNotes = { ...mockFocusSession, notes: '' };
      mockUpdateSessionNotes.mockResolvedValue(sessionWithEmptyNotes);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes: '' }),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session.notes).toBe('');
      expect(mockUpdateSessionNotes).toHaveBeenCalledWith(
        mockSessionId,
        mockUserId,
        ''
      );
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Test notes' }),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(mockUpdateSessionNotes).not.toHaveBeenCalled();
    });

    it('should return 404 if session not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockUpdateSessionNotes.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Test notes' }),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing notes field', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockUpdateSessionNotes).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid notes type', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ notes: 123 }),
      });

      const response = await updateNotes(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockUpdateSessionNotes).not.toHaveBeenCalled();
    });
  });
});
