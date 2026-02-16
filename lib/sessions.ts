import { prisma } from '@/lib/prisma';
import { FocusSession, Prisma } from '@prisma/client';

/**
 * Focus Session Data Access Layer
 * 
 * Provides functions for focus session management:
 * - startSession: Create a new focus session
 * - pauseSession: Pause an active session
 * - resumeSession: Resume a paused session
 * - stopSession: Stop and complete a session
 * - logDistraction: Log a distraction during a session
 * - getSessions: Retrieve sessions with date range filtering
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.5, 3.7
 */

export interface Distraction {
  timestamp: Date;
  note?: string;
}

export interface StartSessionInput {
  userId: string;
  durationMinutes: number;
}

export interface StopSessionInput {
  notes?: string;
}

export interface GetSessionsFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface LogDistractionInput {
  note?: string;
}

/**
 * Start a new focus session
 * 
 * Creates a new focus session with the specified duration.
 * The session starts immediately with startTime set to now.
 * 
 * @param input - Session creation data
 * @returns The created focus session
 * 
 * Requirements: 3.1
 */
export async function startSession(input: StartSessionInput): Promise<FocusSession> {
  const session = await prisma.focusSession.create({
    data: {
      userId: input.userId,
      durationMinutes: input.durationMinutes,
      startTime: new Date(),
      completed: false,
      pausedMinutes: 0,
      distractionCount: 0,
      distractions: [],
    },
  });

  return session;
}

/**
 * Pause an active focus session
 * 
 * Pauses the session by recording the current time as endTime temporarily.
 * The pausedMinutes field is NOT updated here - it will be calculated when resuming.
 * 
 * @param sessionId - ID of the session to pause
 * @param userId - ID of the user (for authorization)
 * @returns The paused session, or null if not found or unauthorized
 * 
 * Requirements: 3.3
 */
export async function pauseSession(
  sessionId: string,
  userId: string
): Promise<FocusSession | null> {
  // Verify the session exists and belongs to the user
  const existingSession = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
      completed: false,
    },
  });

  if (!existingSession) {
    return null;
  }

  // Mark pause time by setting endTime (temporary marker)
  const pausedSession = await prisma.focusSession.update({
    where: {
      id: sessionId,
    },
    data: {
      endTime: new Date(),
    },
  });

  return pausedSession;
}

/**
 * Resume a paused focus session
 * 
 * Resumes a paused session by calculating the pause duration and
 * clearing the endTime marker. The pausedMinutes field is updated
 * to track total pause time.
 * 
 * @param sessionId - ID of the session to resume
 * @param userId - ID of the user (for authorization)
 * @returns The resumed session, or null if not found or unauthorized
 * 
 * Requirements: 3.4
 */
export async function resumeSession(
  sessionId: string,
  userId: string
): Promise<FocusSession | null> {
  // Verify the session exists and belongs to the user
  const existingSession = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
      completed: false,
    },
  });

  if (!existingSession || !existingSession.endTime) {
    return null;
  }

  // Calculate pause duration
  const pauseDuration = Math.floor(
    (new Date().getTime() - existingSession.endTime.getTime()) / 1000 / 60
  );

  // Resume by clearing endTime and adding to pausedMinutes
  const resumedSession = await prisma.focusSession.update({
    where: {
      id: sessionId,
    },
    data: {
      endTime: null,
      pausedMinutes: existingSession.pausedMinutes + pauseDuration,
    },
  });

  return resumedSession;
}

/**
 * Stop and complete a focus session
 * 
 * Stops the session, marks it as completed, and saves optional notes.
 * The endTime is set to now, and the session is marked as completed.
 * 
 * @param sessionId - ID of the session to stop
 * @param userId - ID of the user (for authorization)
 * @param input - Optional notes to save with the session
 * @returns The completed session, or null if not found or unauthorized
 * 
 * Requirements: 3.5
 */
export async function stopSession(
  sessionId: string,
  userId: string,
  input?: StopSessionInput
): Promise<FocusSession | null> {
  // Verify the session exists and belongs to the user
  const existingSession = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
      completed: false,
    },
  });

  if (!existingSession) {
    return null;
  }

  // Stop the session
  const stoppedSession = await prisma.focusSession.update({
    where: {
      id: sessionId,
    },
    data: {
      endTime: new Date(),
      completed: true,
      notes: input?.notes,
    },
  });

  return stoppedSession;
}

/**
 * Log a distraction during an active focus session
 * 
 * Adds a distraction entry to the session's distraction log with
 * the current timestamp and optional note. Increments the distraction count.
 * 
 * @param sessionId - ID of the session
 * @param userId - ID of the user (for authorization)
 * @param input - Optional note describing the distraction
 * @returns The updated session, or null if not found or unauthorized
 * 
 * Requirements: 3.7
 */
export async function logDistraction(
  sessionId: string,
  userId: string,
  input?: LogDistractionInput
): Promise<FocusSession | null> {
  // Verify the session exists and belongs to the user
  const existingSession = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
      completed: false,
    },
  });

  if (!existingSession) {
    return null;
  }

  // Parse existing distractions
  const distractions = existingSession.distractions as Prisma.JsonArray;
  
  // Create new distraction entry
  const newDistraction: Distraction = {
    timestamp: new Date(),
    note: input?.note,
  };

  // Add to distractions array
  const updatedDistractions = [...distractions, newDistraction];

  // Update session with new distraction
  const updatedSession = await prisma.focusSession.update({
    where: {
      id: sessionId,
    },
    data: {
      distractionCount: existingSession.distractionCount + 1,
      distractions: updatedDistractions as Prisma.JsonArray,
    },
  });

  return updatedSession;
}

/**
 * Update session notes
 * 
 * Updates the notes field for an active session.
 * This is used for auto-saving notes during a session.
 * 
 * @param sessionId - ID of the session
 * @param userId - ID of the user (for authorization)
 * @param notes - Notes text to save
 * @returns The updated session, or null if not found or unauthorized
 * 
 * Requirements: 3.8, 23
 */
export async function updateSessionNotes(
  sessionId: string,
  userId: string,
  notes: string
): Promise<FocusSession | null> {
  // Verify the session exists and belongs to the user
  const existingSession = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!existingSession) {
    return null;
  }

  // Update session notes
  const updatedSession = await prisma.focusSession.update({
    where: {
      id: sessionId,
    },
    data: {
      notes,
    },
  });

  return updatedSession;
}

/**
 * Get focus sessions with optional filtering
 * 
 * Retrieves sessions for a user with optional date range filtering.
 * Results are ordered by startTime in descending order (most recent first).
 * 
 * @param filters - Filter criteria including userId, date range, and limit
 * @returns Array of focus sessions matching the filters
 * 
 * Requirements: 3.1, 3.5
 */
export async function getSessions(filters: GetSessionsFilters): Promise<FocusSession[]> {
  const where: Prisma.FocusSessionWhereInput = {
    userId: filters.userId,
  };

  // Apply date range filters
  if (filters.startDate || filters.endDate) {
    where.startTime = {};
    
    if (filters.startDate) {
      where.startTime.gte = filters.startDate;
    }
    
    if (filters.endDate) {
      where.startTime.lte = filters.endDate;
    }
  }

  const sessions = await prisma.focusSession.findMany({
    where,
    orderBy: {
      startTime: 'desc',
    },
    take: filters.limit,
  });

  return sessions;
}
