import { prisma } from '@/lib/prisma';
import { Workspace, User } from '@prisma/client';

/**
 * Workspace Data Access Layer
 * 
 * Provides functions for workspace management operations:
 * - createWorkspace: Create a new workspace
 * - getWorkspace: Retrieve a workspace by ID
 * - updateWorkspace: Update workspace properties
 * - addMember: Add a user to a workspace
 * - removeMember: Remove a user from a workspace
 * - getTeamMembers: Get all members of a workspace with status
 * 
 * Requirements: 6.1, 27
 */

export interface CreateWorkspaceInput {
  name: string;
  ownerId: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
}

export interface TeamMemberWithStatus {
  id: string;
  name: string;
  email: string;
  status: 'AVAILABLE' | 'IN_FOCUS' | 'OFFLINE';
  currentSessionId: string | null;
}

/**
 * Create a new workspace
 * 
 * Creates a workspace and automatically adds the creator as the owner.
 * The owner is also added as a member of the workspace.
 * 
 * @param input - Workspace creation data
 * @returns The created workspace
 * 
 * Requirements: 27.1
 */
export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const workspace = await prisma.workspace.create({
    data: {
      name: input.name,
      ownerId: input.ownerId,
    },
  });

  // Add the owner as a member of the workspace
  await prisma.user.update({
    where: {
      id: input.ownerId,
    },
    data: {
      workspaceId: workspace.id,
    },
  });

  return workspace;
}

/**
 * Get a workspace by ID
 * 
 * Retrieves a workspace with all its members.
 * 
 * @param workspaceId - ID of the workspace to retrieve
 * @returns The workspace with members, or null if not found
 * 
 * Requirements: 6.1
 */
export async function getWorkspace(workspaceId: string): Promise<(Workspace & { members: User[] }) | null> {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: true,
    },
  });

  return workspace;
}

/**
 * Update a workspace
 * 
 * Updates workspace properties. Only the workspace owner should be able to update.
 * Authorization check should be performed by the caller.
 * 
 * @param workspaceId - ID of the workspace to update
 * @param input - Fields to update
 * @returns The updated workspace, or null if not found
 * 
 * Requirements: 27.1
 */
export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace | null> {
  try {
    const workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: input.name,
      },
    });

    return workspace;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
}

/**
 * Add a member to a workspace
 * 
 * Adds a user to a workspace by updating their workspaceId.
 * This is typically called after a user accepts an invitation.
 * 
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user to add
 * @returns The updated user, or null if not found
 * 
 * Requirements: 6.4, 27.3
 */
export async function addMember(workspaceId: string, userId: string): Promise<User | null> {
  try {
    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      return null;
    }

    // Add user to workspace
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        workspaceId: workspaceId,
      },
    });

    return user;
  } catch (error) {
    console.error('Error adding member to workspace:', error);
    return null;
  }
}

/**
 * Remove a member from a workspace
 * 
 * Removes a user from a workspace by clearing their workspaceId.
 * Only workspace owners should be able to remove members.
 * Authorization check should be performed by the caller.
 * 
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user to remove
 * @returns true if removed, false if not found or error
 * 
 * Requirements: 27.4
 */
export async function removeMember(workspaceId: string, userId: string): Promise<boolean> {
  try {
    // Verify the user is in this workspace
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        workspaceId: workspaceId,
      },
    });

    if (!user) {
      return false;
    }

    // Remove user from workspace
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        workspaceId: null,
      },
    });

    return true;
  } catch (error) {
    console.error('Error removing member from workspace:', error);
    return false;
  }
}

/**
 * Get team members with their current status
 * 
 * Retrieves all members of a workspace along with their current status:
 * - IN_FOCUS: User has an active (non-completed) focus session
 * - AVAILABLE: User has no active session
 * - OFFLINE: User has no recent activity (placeholder for future implementation)
 * 
 * @param workspaceId - ID of the workspace
 * @returns Array of team members with status information
 * 
 * Requirements: 6.1, 43
 */
export async function getTeamMembers(workspaceId: string): Promise<TeamMemberWithStatus[]> {
  // Get all members of the workspace
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: {
        include: {
          focusSessions: {
            where: {
              completed: false,
            },
            orderBy: {
              startTime: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!workspace) {
    return [];
  }

  // Map members to TeamMemberWithStatus
  const teamMembers: TeamMemberWithStatus[] = workspace.members.map((member) => {
    const activeSession = member.focusSessions[0];
    
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      status: activeSession ? 'IN_FOCUS' : 'AVAILABLE',
      currentSessionId: activeSession?.id || null,
    };
  });

  return teamMembers;
}
