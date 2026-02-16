/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/sessions/route';
import { POST as startSession } from '@/app/api/sessions/start/route';
import { POST as pauseSession } from '@/app/api/sessions/[id]/pause/route';
import { POST as resumeSession } from '@/app/api/sessions/[id]/resume/route';
import { POST as stopSession } from '@/app/api/sessions/[id]/stop/route';
import { POST as logDistraction } from '@/app/api/sessions/[id]/distraction/route';
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
const mockStartSession = sessionsLib.startSession as jest.MockedFunction<typeof sessionsLib.startSession>;
const mockPauseSession = sessionsLib.pauseSession as jest.MockedFunction<typeof sessionsLib.pauseSession>;
const mockResumeSession = sessionsLib.resumeSession as jest.MockedFunction<typeof sessionsLib.resumeSession>;
const mockStopSession = sessionsLib.stopSession as jest.MockedFunction<typeof sessionsLib.stopSession>;
const mockLogDistraction = sessionsLib.logDistraction as jest.MockedFunction<typeof sessionsLib.logDistraction>;
const mockGetSessions = sessionsLib.getSessions as jest.MockedFunction<typeof sessionsLib.getSessions>;

describe('Focus Session API Endpoints', () => {
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
    notes: null,
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sessions/start', () => {
    it('should start a new focus session with valid input', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockStartSession.mockResolvedValue(mockFocusSession);

      const request = new NextRequest('http://localhost:3000/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes: 25 }),
      });

      const response = await startSession(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.session).toEqual({
        ...mockFocusSession,
        startTime: mockFocusSession.startTime.toISOString(),
        createdAt: mockFocusSession.createdAt.toISOString(),
      });
      expect(mockStartSession).toHaveBeenCalledWith({
        userId: mockUserId,
        durationMinutes: 25,
      });
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes: 25 }),
      });

      const response = await startSession(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid duration', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes: 0 }),
      });

      const response = await startSession(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for duration exceeding maximum', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ durationMinutes: 500 }),
      });

      const response = await startSession(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/sessions/[id]/pause', () => {
    it('should pause an active session', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const pausedSession = { ...mockFocusSession, endTime: new Date() };
      mockPauseSession.mockResolvedValue(pausedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/pause`, {
        method: 'POST',
      });

      const response = await pauseSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual({
        ...pausedSession,
        startTime: pausedSession.startTime.toISOString(),
        endTime: pausedSession.endTime?.toISOString(),
        createdAt: pausedSession.createdAt.toISOString(),
      });
      expect(mockPauseSession).toHaveBeenCalledWith(mockSessionId, mockUserId);
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/pause`, {
        method: 'POST',
      });

      const response = await pauseSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 if session not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPauseSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/pause`, {
        method: 'POST',
      });

      const response = await pauseSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/sessions/[id]/resume', () => {
    it('should resume a paused session', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const resumedSession = { ...mockFocusSession, pausedMinutes: 5 };
      mockResumeSession.mockResolvedValue(resumedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/resume`, {
        method: 'POST',
      });

      const response = await resumeSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual({
        ...resumedSession,
        startTime: resumedSession.startTime.toISOString(),
        createdAt: resumedSession.createdAt.toISOString(),
      });
      expect(mockResumeSession).toHaveBeenCalledWith(mockSessionId, mockUserId);
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/resume`, {
        method: 'POST',
      });

      const response = await resumeSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 if session not found or not paused', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockResumeSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/resume`, {
        method: 'POST',
      });

      const response = await resumeSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/sessions/[id]/stop', () => {
    it('should stop a session without notes', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const stoppedSession = { ...mockFocusSession, completed: true, endTime: new Date() };
      mockStopSession.mockResolvedValue(stoppedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/stop`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await stopSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual({
        ...stoppedSession,
        startTime: stoppedSession.startTime.toISOString(),
        endTime: stoppedSession.endTime?.toISOString(),
        createdAt: stoppedSession.createdAt.toISOString(),
      });
      expect(mockStopSession).toHaveBeenCalledWith(mockSessionId, mockUserId, {});
    });

    it('should stop a session with notes', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const notes = 'Great focus session!';
      const stoppedSession = { ...mockFocusSession, completed: true, endTime: new Date(), notes };
      mockStopSession.mockResolvedValue(stoppedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/stop`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });

      const response = await stopSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session.notes).toBe(notes);
      expect(mockStopSession).toHaveBeenCalledWith(mockSessionId, mockUserId, { notes });
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/stop`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await stopSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 if session not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockStopSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/stop`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await stopSession(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/sessions/[id]/distraction', () => {
    it('should log a distraction without note', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const updatedSession = { ...mockFocusSession, distractionCount: 1 };
      mockLogDistraction.mockResolvedValue(updatedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/distraction`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await logDistraction(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session.distractionCount).toBe(1);
      expect(mockLogDistraction).toHaveBeenCalledWith(mockSessionId, mockUserId, {});
    });

    it('should log a distraction with note', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const note = 'Phone call';
      const updatedSession = { ...mockFocusSession, distractionCount: 1 };
      mockLogDistraction.mockResolvedValue(updatedSession);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/distraction`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });

      const response = await logDistraction(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockLogDistraction).toHaveBeenCalledWith(mockSessionId, mockUserId, { note });
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/distraction`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await logDistraction(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 if session not found', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockLogDistraction.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/sessions/${mockSessionId}/distraction`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await logDistraction(request, { params: { id: mockSessionId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/sessions', () => {
    it('should get sessions without filters', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const sessions = [mockFocusSession];
      mockGetSessions.mockResolvedValue(sessions);

      const request = new NextRequest('http://localhost:3000/api/sessions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toEqual([{
        ...mockFocusSession,
        startTime: mockFocusSession.startTime.toISOString(),
        createdAt: mockFocusSession.createdAt.toISOString(),
      }]);
      expect(mockGetSessions).toHaveBeenCalledWith({
        userId: mockUserId,
        startDate: undefined,
        endDate: undefined,
        limit: undefined,
      });
    });

    it('should get sessions with date range filters', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const sessions = [mockFocusSession];
      mockGetSessions.mockResolvedValue(sessions);

      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';
      const request = new NextRequest(
        `http://localhost:3000/api/sessions?startDate=${startDate}&endDate=${endDate}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toEqual([{
        ...mockFocusSession,
        startTime: mockFocusSession.startTime.toISOString(),
        createdAt: mockFocusSession.createdAt.toISOString(),
      }]);
      expect(mockGetSessions).toHaveBeenCalledWith({
        userId: mockUserId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        limit: undefined,
      });
    });

    it('should get sessions with limit', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const sessions = [mockFocusSession];
      mockGetSessions.mockResolvedValue(sessions);

      const request = new NextRequest('http://localhost:3000/api/sessions?limit=10');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toEqual([{
        ...mockFocusSession,
        startTime: mockFocusSession.startTime.toISOString(),
        createdAt: mockFocusSession.createdAt.toISOString(),
      }]);
      expect(mockGetSessions).toHaveBeenCalledWith({
        userId: mockUserId,
        startDate: undefined,
        endDate: undefined,
        limit: 10,
      });
    });

    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/sessions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid date format', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/sessions?startDate=invalid-date');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid limit', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/sessions?limit=0');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
