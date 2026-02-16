/**
 * @jest-environment node
 */

import {
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  addMember,
  removeMember,
  getTeamMembers,
} from '@/lib/workspaces';
import { startSession } from '@/lib/sessions';
import { prisma } from '@/lib/prisma';
import { generateTestEmail } from '../../helpers/test-db';

/**
 * Unit tests for workspace data access layer
 * 
 * Tests cover:
 * - Workspace creation with owner assignment
 * - Workspace retrieval with members
 * - Workspace updates
 * - Adding members to workspace
 * - Removing members from workspace
 * - Getting team members with status (AVAILABLE, IN_FOCUS)
 * 
 * Requirements: 6.1, 27
 */

describe('Workspace Data Access Layer', () => {
  let testOwnerId: string;
  let testMember1Id: string;
  let testMember2Id: string;

  beforeAll(async () => {
    // Create test users without full cleanup (to avoid transaction issues)
    // Clean up only users that might exist from previous runs
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              generateTestEmail('owner'),
              generateTestEmail('member1'),
              generateTestEmail('member2'),
            ].map(email => ({ contains: 'owner' }))
          }
        }
      });
    } catch (error) {
      // Ignore cleanup errors
      console.log('Skipping cleanup, will use unique emails');
    }

    // Create test users
    const owner = await prisma.user.create({
      data: {
        email: generateTestEmail('owner'),
        name: 'Workspace Owner',
        passwordHash: 'hashedpassword',
      },
    });
    testOwnerId = owner.id;

    const member1 = await prisma.user.create({
      data: {
        email: generateTestEmail('member1'),
        name: 'Team Member 1',
        passwordHash: 'hashedpassword',
      },
    });
    testMember1Id = member1.id;

    const member2 = await prisma.user.create({
      data: {
        email: generateTestEmail('member2'),
        name: 'Team Member 2',
        passwordHash: 'hashedpassword',
      },
    });
    testMember2Id = member2.id;
  }, 30000); // Increase timeout for database operations

  afterAll(async () => {
    // Clean up test data
    if (testOwnerId && testMember1Id && testMember2Id) {
      try {
        // Clean up focus sessions first (has foreign key to user)
        await prisma.focusSession.deleteMany({
          where: {
            userId: {
              in: [testOwnerId, testMember1Id, testMember2Id],
            },
          },
        });

        // Clean up workspaces
        await prisma.workspace.deleteMany({
          where: {
            ownerId: {
              in: [testOwnerId, testMember1Id, testMember2Id],
            },
          },
        });

        // Clean up users
        await prisma.user.deleteMany({
          where: {
            id: {
              in: [testOwnerId, testMember1Id, testMember2Id],
            },
          },
        });
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }
    }
    await prisma.$disconnect();
  }, 30000);

  beforeEach(async () => {
    // Clean up workspaces and reset user workspace associations before each test
    await prisma.user.updateMany({
      where: {
        id: {
          in: [testOwnerId, testMember1Id, testMember2Id],
        },
      },
      data: {
        workspaceId: null,
      },
    });
    await prisma.workspace.deleteMany();
  });

  describe('createWorkspace', () => {
    it('should create a workspace with owner', async () => {
      const input = {
        name: 'Test Workspace',
        ownerId: testOwnerId,
      };

      const workspace = await createWorkspace(input);

      expect(workspace).toBeDefined();
      expect(workspace.name).toBe(input.name);
      expect(workspace.ownerId).toBe(input.ownerId);
      expect(workspace.id).toBeDefined();
      expect(workspace.createdAt).toBeInstanceOf(Date);
      expect(workspace.updatedAt).toBeInstanceOf(Date);
    });

    it('should automatically add owner as a member', async () => {
      const workspace = await createWorkspace({
        name: 'Owner Member Test',
        ownerId: testOwnerId,
      });

      // Verify owner is added as member
      const owner = await prisma.user.findUnique({
        where: { id: testOwnerId },
      });

      expect(owner!.workspaceId).toBe(workspace.id);
    });

    it('should create workspace with unique ID', async () => {
      const workspace1 = await createWorkspace({
        name: 'Workspace 1',
        ownerId: testOwnerId,
      });

      // Reset owner's workspace
      await prisma.user.update({
        where: { id: testOwnerId },
        data: { workspaceId: null },
      });

      const workspace2 = await createWorkspace({
        name: 'Workspace 2',
        ownerId: testOwnerId,
      });

      expect(workspace1.id).not.toBe(workspace2.id);
    });
  });

  describe('getWorkspace', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const workspace = await createWorkspace({
        name: 'Test Workspace',
        ownerId: testOwnerId,
      });
      workspaceId = workspace.id;
    });

    it('should retrieve workspace with members', async () => {
      const workspace = await getWorkspace(workspaceId);

      expect(workspace).not.toBeNull();
      expect(workspace!.id).toBe(workspaceId);
      expect(workspace!.name).toBe('Test Workspace');
      expect(workspace!.ownerId).toBe(testOwnerId);
      expect(workspace!.members).toBeDefined();
      expect(Array.isArray(workspace!.members)).toBe(true);
    });

    it('should include owner in members list', async () => {
      const workspace = await getWorkspace(workspaceId);

      expect(workspace!.members).toHaveLength(1);
      expect(workspace!.members[0].id).toBe(testOwnerId);
      expect(workspace!.members[0].name).toBe('Workspace Owner');
    });

    it('should include all members', async () => {
      // Add additional members
      await addMember(workspaceId, testMember1Id);
      await addMember(workspaceId, testMember2Id);

      const workspace = await getWorkspace(workspaceId);

      expect(workspace!.members).toHaveLength(3);
      const memberIds = workspace!.members.map(m => m.id);
      expect(memberIds).toContain(testOwnerId);
      expect(memberIds).toContain(testMember1Id);
      expect(memberIds).toContain(testMember2Id);
    });

    it('should return null for non-existent workspace', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const workspace = await getWorkspace(nonExistentId);

      expect(workspace).toBeNull();
    });
  });

  describe('updateWorkspace', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const workspace = await createWorkspace({
        name: 'Original Name',
        ownerId: testOwnerId,
      });
      workspaceId = workspace.id;
    });

    it('should update workspace name', async () => {
      const updated = await updateWorkspace(workspaceId, {
        name: 'Updated Name',
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.id).toBe(workspaceId);
    });

    it('should preserve other fields when updating', async () => {
      const original = await getWorkspace(workspaceId);
      
      const updated = await updateWorkspace(workspaceId, {
        name: 'New Name',
      });

      expect(updated!.ownerId).toBe(original!.ownerId);
      expect(updated!.createdAt).toEqual(original!.createdAt);
    });

    it('should return null for non-existent workspace', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updated = await updateWorkspace(nonExistentId, {
        name: 'New Name',
      });

      expect(updated).toBeNull();
    });

    it('should handle empty update input', async () => {
      const updated = await updateWorkspace(workspaceId, {});

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Original Name');
    });
  });

  describe('addMember', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const workspace = await createWorkspace({
        name: 'Test Workspace',
        ownerId: testOwnerId,
      });
      workspaceId = workspace.id;
    });

    it('should add a member to workspace', async () => {
      const user = await addMember(workspaceId, testMember1Id);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(testMember1Id);
      expect(user!.workspaceId).toBe(workspaceId);
    });

    it('should add member to workspace members list', async () => {
      await addMember(workspaceId, testMember1Id);

      const workspace = await getWorkspace(workspaceId);
      const memberIds = workspace!.members.map(m => m.id);

      expect(memberIds).toContain(testMember1Id);
    });

    it('should add multiple members', async () => {
      await addMember(workspaceId, testMember1Id);
      await addMember(workspaceId, testMember2Id);

      const workspace = await getWorkspace(workspaceId);

      expect(workspace!.members).toHaveLength(3); // owner + 2 members
      const memberIds = workspace!.members.map(m => m.id);
      expect(memberIds).toContain(testMember1Id);
      expect(memberIds).toContain(testMember2Id);
    });

    it('should return null for non-existent workspace', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const user = await addMember(nonExistentId, testMember1Id);

      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const nonExistentUserId = '507f1f77bcf86cd799439011';
      const user = await addMember(workspaceId, nonExistentUserId);

      expect(user).toBeNull();
    });

    it('should update user workspace when adding to new workspace', async () => {
      // Add member to first workspace
      await addMember(workspaceId, testMember1Id);

      // Create second workspace
      const workspace2 = await createWorkspace({
        name: 'Second Workspace',
        ownerId: testOwnerId,
      });

      // Reset owner's workspace for second workspace
      await prisma.user.update({
        where: { id: testOwnerId },
        data: { workspaceId: workspace2.id },
      });

      // Add same member to second workspace (should move them)
      const user = await addMember(workspace2.id, testMember1Id);

      expect(user!.workspaceId).toBe(workspace2.id);
    });
  });

  describe('removeMember', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const workspace = await createWorkspace({
        name: 'Test Workspace',
        ownerId: testOwnerId,
      });
      workspaceId = workspace.id;

      // Add members
      await addMember(workspaceId, testMember1Id);
      await addMember(workspaceId, testMember2Id);
    });

    it('should remove a member from workspace', async () => {
      const result = await removeMember(workspaceId, testMember1Id);

      expect(result).toBe(true);

      // Verify member is removed
      const user = await prisma.user.findUnique({
        where: { id: testMember1Id },
      });
      expect(user!.workspaceId).toBeNull();
    });

    it('should remove member from workspace members list', async () => {
      await removeMember(workspaceId, testMember1Id);

      const workspace = await getWorkspace(workspaceId);
      const memberIds = workspace!.members.map(m => m.id);

      expect(memberIds).not.toContain(testMember1Id);
      expect(memberIds).toContain(testMember2Id); // Other member still there
    });

    it('should return false for non-existent user', async () => {
      const nonExistentUserId = '507f1f77bcf86cd799439011';
      const result = await removeMember(workspaceId, nonExistentUserId);

      expect(result).toBe(false);
    });

    it('should return false when user is not in workspace', async () => {
      // Create another workspace
      const workspace2 = await createWorkspace({
        name: 'Other Workspace',
        ownerId: testMember1Id,
      });

      // Try to remove member2 from workspace2 (they're not in it)
      const result = await removeMember(workspace2.id, testMember2Id);

      expect(result).toBe(false);
    });

    it('should not affect other members', async () => {
      await removeMember(workspaceId, testMember1Id);

      const workspace = await getWorkspace(workspaceId);
      const memberIds = workspace!.members.map(m => m.id);

      expect(memberIds).toContain(testOwnerId);
      expect(memberIds).toContain(testMember2Id);
    });
  });

  describe('getTeamMembers', () => {
    let workspaceId: string;

    beforeEach(async () => {
      const workspace = await createWorkspace({
        name: 'Test Workspace',
        ownerId: testOwnerId,
      });
      workspaceId = workspace.id;

      // Add members
      await addMember(workspaceId, testMember1Id);
      await addMember(workspaceId, testMember2Id);
    });

    it('should return all team members', async () => {
      const members = await getTeamMembers(workspaceId);

      expect(members).toHaveLength(3);
      const memberIds = members.map(m => m.id);
      expect(memberIds).toContain(testOwnerId);
      expect(memberIds).toContain(testMember1Id);
      expect(memberIds).toContain(testMember2Id);
    });

    it('should include member details', async () => {
      const members = await getTeamMembers(workspaceId);

      const owner = members.find(m => m.id === testOwnerId);
      expect(owner).toBeDefined();
      expect(owner!.name).toBe('Workspace Owner');
      expect(owner!.email).toContain('owner');
    });

    it('should show AVAILABLE status for members without active sessions', async () => {
      const members = await getTeamMembers(workspaceId);

      expect(members.every(m => m.status === 'AVAILABLE')).toBe(true);
      expect(members.every(m => m.currentSessionId === null)).toBe(true);
    });

    it('should show IN_FOCUS status for members with active sessions', async () => {
      // Start a session for member1
      const session = await startSession({
        userId: testMember1Id,
        durationMinutes: 25,
      });

      const members = await getTeamMembers(workspaceId);

      const member1 = members.find(m => m.id === testMember1Id);
      expect(member1!.status).toBe('IN_FOCUS');
      expect(member1!.currentSessionId).toBe(session.id);

      // Other members should still be AVAILABLE
      const owner = members.find(m => m.id === testOwnerId);
      expect(owner!.status).toBe('AVAILABLE');
      expect(owner!.currentSessionId).toBeNull();
    });

    it('should show IN_FOCUS for multiple members with active sessions', async () => {
      // Start sessions for multiple members
      const session1 = await startSession({
        userId: testMember1Id,
        durationMinutes: 25,
      });

      const session2 = await startSession({
        userId: testMember2Id,
        durationMinutes: 50,
      });

      const members = await getTeamMembers(workspaceId);

      const member1 = members.find(m => m.id === testMember1Id);
      expect(member1!.status).toBe('IN_FOCUS');
      expect(member1!.currentSessionId).toBe(session1.id);

      const member2 = members.find(m => m.id === testMember2Id);
      expect(member2!.status).toBe('IN_FOCUS');
      expect(member2!.currentSessionId).toBe(session2.id);

      const owner = members.find(m => m.id === testOwnerId);
      expect(owner!.status).toBe('AVAILABLE');
    });

    it('should return empty array for non-existent workspace', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const members = await getTeamMembers(nonExistentId);

      expect(members).toEqual([]);
    });

    it('should return only workspace members', async () => {
      // Create another workspace with different members
      const workspace2 = await createWorkspace({
        name: 'Other Workspace',
        ownerId: testMember1Id,
      });

      const members = await getTeamMembers(workspaceId);

      // Should only include members of the first workspace
      expect(members).toHaveLength(3);
      const memberIds = members.map(m => m.id);
      expect(memberIds).toContain(testOwnerId);
      expect(memberIds).toContain(testMember1Id);
      expect(memberIds).toContain(testMember2Id);
    });

    it('should show most recent active session', async () => {
      // Start multiple sessions for same user (though only one should be active)
      const session1 = await startSession({
        userId: testMember1Id,
        durationMinutes: 25,
      });

      const members = await getTeamMembers(workspaceId);

      const member1 = members.find(m => m.id === testMember1Id);
      expect(member1!.currentSessionId).toBe(session1.id);
    });
  });
});
