/**
 * @jest-environment node
 */

// Mock NextAuth session BEFORE imports
jest.mock('@/lib/auth', () => ({
  authOptions: {},
  getServerSession: jest.fn(),
}));

import { GET as GetTeamMembers } from '@/app/api/team/members/route';
import { GET as GetLeaderboard } from '@/app/api/team/leaderboard/route';
import { POST as InviteTeamMember } from '@/app/api/team/invite/route';
import { POST as AcceptInvitation } from '@/app/api/team/accept/route';
import { DELETE as RemoveMember } from '@/app/api/team/members/[id]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';
import { getServerSession } from '@/lib/auth';

/**
 * Integration tests for team API endpoints
 * 
 * Tests the complete team collaboration flow with actual database operations
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 26, 27
 */

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Team API Integration', () => {
  let workspaceId: string;
  let ownerId: string;
  let ownerEmail: string;
  let memberId: string;
  let memberEmail: string;

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestDatabase();

    // Generate unique emails for this test
    ownerEmail = generateTestEmail('owner');
    memberEmail = generateTestEmail('member');

    // Create workspace owner
    const owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: 'Workspace Owner',
        passwordHash: await bcrypt.hash('TestPassword123', 12),
      },
    });
    ownerId = owner.id;

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        ownerId: ownerId,
      },
    });
    workspaceId = workspace.id;

    // Add owner to workspace
    await prisma.user.update({
      where: { id: ownerId },
      data: { workspaceId: workspaceId },
    });

    // Create a member
    const member = await prisma.user.create({
      data: {
        email: memberEmail,
        name: 'Team Member',
        passwordHash: await bcrypt.hash('TestPassword123', 12),
        workspaceId: workspaceId,
      },
    });
    memberId = member.id;

    // Mock authenticated session as owner by default
    mockGetServerSession.mockResolvedValue({
      user: {
        id: ownerId,
        email: ownerEmail,
        name: 'Workspace Owner',
        subscriptionTier: 'TEAM',
        workspaceId: workspaceId,
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

  describe('GET /api/team/members', () => {
    it('should return all team members with status', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/members');

      const response = await GetTeamMembers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.members).toHaveLength(2);
      expect(data.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: ownerId,
            name: 'Workspace Owner',
            email: ownerEmail,
            status: 'AVAILABLE',
            currentSessionId: null,
          }),
          expect.objectContaining({
            id: memberId,
            name: 'Team Member',
            email: memberEmail,
            status: 'AVAILABLE',
            currentSessionId: null,
          }),
        ])
      );
    });

    it('should show IN_FOCUS status for members with active sessions', async () => {
      // Create an active focus session for the member
      const session = await prisma.focusSession.create({
        data: {
          userId: memberId,
          durationMinutes: 25,
          completed: false,
        },
      });

      const request = new NextRequest('http://localhost:3000/api/team/members');

      const response = await GetTeamMembers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const memberData = data.members.find((m: any) => m.id === memberId);
      expect(memberData.status).toBe('IN_FOCUS');
      expect(memberData.currentSessionId).toBe(session.id);
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/team/members');

      const response = await GetTeamMembers(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require workspace membership', async () => {
      // Mock user without workspace
      mockGetServerSession.mockResolvedValue({
        user: {
          id: ownerId,
          email: ownerEmail,
          name: 'Workspace Owner',
          subscriptionTier: 'FREE',
          workspaceId: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/team/members');

      const response = await GetTeamMembers(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('NO_WORKSPACE');
    });
  });

  describe('GET /api/team/leaderboard', () => {
    beforeEach(async () => {
      // Create focus sessions for both users
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
      weekStart.setHours(0, 0, 0, 0);

      // Owner: 120 minutes this week
      await prisma.focusSession.create({
        data: {
          userId: ownerId,
          durationMinutes: 60,
          completed: true,
          startTime: new Date(weekStart.getTime() + 1000),
        },
      });
      await prisma.focusSession.create({
        data: {
          userId: ownerId,
          durationMinutes: 60,
          completed: true,
          startTime: new Date(weekStart.getTime() + 2000),
        },
      });

      // Member: 90 minutes this week
      await prisma.focusSession.create({
        data: {
          userId: memberId,
          durationMinutes: 90,
          completed: true,
          startTime: new Date(weekStart.getTime() + 3000),
        },
      });
    });

    it('should return leaderboard ranked by focus minutes', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/leaderboard');

      const response = await GetLeaderboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.leaderboard).toHaveLength(2);
      
      // Owner should be rank 1 with 120 minutes
      expect(data.leaderboard[0]).toMatchObject({
        userId: ownerId,
        name: 'Workspace Owner',
        focusMinutes: 120,
        rank: 1,
      });

      // Member should be rank 2 with 90 minutes
      expect(data.leaderboard[1]).toMatchObject({
        userId: memberId,
        name: 'Team Member',
        focusMinutes: 90,
        rank: 2,
      });
    });

    it('should hide leaderboard for workspaces with fewer than 2 members', async () => {
      // Remove the member
      await prisma.user.update({
        where: { id: memberId },
        data: { workspaceId: null },
      });

      const request = new NextRequest('http://localhost:3000/api/team/leaderboard');

      const response = await GetLeaderboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.leaderboard).toEqual([]);
      expect(data.message).toBe('Leaderboard requires at least 2 team members');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/team/leaderboard');

      const response = await GetLeaderboard(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should require workspace membership', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: ownerId,
          email: ownerEmail,
          name: 'Workspace Owner',
          subscriptionTier: 'FREE',
          workspaceId: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/team/leaderboard');

      const response = await GetLeaderboard(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('NO_WORKSPACE');
    });
  });

  describe('POST /api/team/invite', () => {
    it('should create an invitation', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newmember@test.com',
        }),
      });

      const response = await InviteTeamMember(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.invitationId).toBeDefined();
      expect(data.invitationLink).toContain('token=');
      expect(data.email).toBe('newmember@test.com');
      expect(data.expiresAt).toBeDefined();
    });

    it('should reject invitation for existing member', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: memberEmail,
        }),
      });

      const response = await InviteTeamMember(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('ALREADY_MEMBER');
    });

    it('should reject invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
        }),
      });

      const response = await InviteTeamMember(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require workspace owner permission', async () => {
      // Mock as regular member
      mockGetServerSession.mockResolvedValue({
        user: {
          id: memberId,
          email: memberEmail,
          name: 'Team Member',
          subscriptionTier: 'TEAM',
          workspaceId: workspaceId,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newmember@test.com',
        }),
      });

      const response = await InviteTeamMember(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newmember@test.com',
        }),
      });

      const response = await InviteTeamMember(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/team/accept', () => {
    let invitationToken: string;
    let newUserId: string;
    let newUserEmail: string;

    beforeEach(async () => {
      // Create a new user who will accept the invitation
      newUserEmail = generateTestEmail('newuser');
      const newUser = await prisma.user.create({
        data: {
          email: newUserEmail,
          name: 'New User',
          passwordHash: await bcrypt.hash('TestPassword123', 12),
        },
      });
      newUserId = newUser.id;

      // Create an invitation
      const inviteRequest = new NextRequest('http://localhost:3000/api/team/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: newUserEmail,
        }),
      });

      const inviteResponse = await InviteTeamMember(inviteRequest);
      const inviteData = await inviteResponse.json();
      
      // Extract token from invitation link
      const url = new URL(inviteData.invitationLink);
      invitationToken = url.searchParams.get('token') || '';

      // Mock session as new user
      mockGetServerSession.mockResolvedValue({
        user: {
          id: newUserId,
          email: newUserEmail,
          name: 'New User',
          subscriptionTier: 'FREE',
          workspaceId: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    });

    it('should accept invitation and add user to workspace', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/accept', {
        method: 'POST',
        body: JSON.stringify({
          token: invitationToken,
        }),
      });

      const response = await AcceptInvitation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.workspaceId).toBe(workspaceId);

      // Verify user was added to workspace
      const updatedUser = await prisma.user.findUnique({
        where: { id: newUserId },
      });
      expect(updatedUser?.workspaceId).toBe(workspaceId);
    });

    it('should reject invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/accept', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-token',
        }),
      });

      const response = await AcceptInvitation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_INVITATION');
    });

    it('should reject if email does not match', async () => {
      // Mock as different user
      mockGetServerSession.mockResolvedValue({
        user: {
          id: memberId,
          email: memberEmail,
          name: 'Team Member',
          subscriptionTier: 'FREE',
          workspaceId: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/team/accept', {
        method: 'POST',
        body: JSON.stringify({
          token: invitationToken,
        }),
      });

      const response = await AcceptInvitation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVITATION_FAILED');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/team/accept', {
        method: 'POST',
        body: JSON.stringify({
          token: invitationToken,
        }),
      });

      const response = await AcceptInvitation(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/team/members/[id]', () => {
    it('should remove a member from workspace', async () => {
      const request = new NextRequest(`http://localhost:3000/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      const response = await RemoveMember(request, { params: { id: memberId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify member was removed
      const updatedMember = await prisma.user.findUnique({
        where: { id: memberId },
      });
      expect(updatedMember?.workspaceId).toBeNull();
    });

    it('should prevent owner from removing themselves', async () => {
      const request = new NextRequest(`http://localhost:3000/api/team/members/${ownerId}`, {
        method: 'DELETE',
      });

      const response = await RemoveMember(request, { params: { id: ownerId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('CANNOT_REMOVE_SELF');
    });

    it('should require workspace owner permission', async () => {
      // Mock as regular member
      mockGetServerSession.mockResolvedValue({
        user: {
          id: memberId,
          email: memberEmail,
          name: 'Team Member',
          subscriptionTier: 'TEAM',
          workspaceId: workspaceId,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest(`http://localhost:3000/api/team/members/${ownerId}`, {
        method: 'DELETE',
      });

      const response = await RemoveMember(request, { params: { id: ownerId } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent member', async () => {
      const request = new NextRequest('http://localhost:3000/api/team/members/nonexistent', {
        method: 'DELETE',
      });

      const response = await RemoveMember(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('MEMBER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      const response = await RemoveMember(request, { params: { id: memberId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
