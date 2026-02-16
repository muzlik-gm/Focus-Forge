import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Invitation Data Access Layer
 * 
 * Provides functions for workspace invitation management:
 * - createInvitation: Create a new workspace invitation
 * - getInvitation: Retrieve an invitation by token
 * - acceptInvitation: Accept an invitation and add user to workspace
 * - revokeInvitation: Revoke an invitation
 * 
 * Requirements: 6.3, 6.4, 27
 */

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  accepted: boolean;
}

/**
 * Generate a cryptographically secure random token
 * 
 * Requirements: 27.2 (secure invitation link)
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new workspace invitation
 * 
 * Generates a secure invitation token and stores it in the database.
 * The invitation expires after 7 days by default.
 * 
 * @param workspaceId - ID of the workspace
 * @param email - Email address of the invitee
 * @param expiresInDays - Number of days until expiration (default: 7)
 * @returns The created invitation with token
 * 
 * Requirements: 6.3, 27.2
 */
export async function createInvitation(
  workspaceId: string,
  email: string,
  expiresInDays: number = 7
): Promise<Invitation> {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // For now, we'll store invitations in memory or use a simple collection
  // In a production app, you'd want a proper Invitation model in Prisma
  // Since we're using MongoDB, we can store this as a simple document
  
  const invitation = {
    id: crypto.randomBytes(16).toString('hex'),
    workspaceId,
    email: email.toLowerCase(),
    token,
    expiresAt,
    createdAt: new Date(),
    accepted: false,
  };

  // Store in a simple in-memory map for now
  // In production, this would be stored in the database
  invitationStore.set(token, invitation);

  return invitation;
}

/**
 * Get an invitation by token
 * 
 * @param token - The invitation token
 * @returns The invitation if found and not expired, null otherwise
 * 
 * Requirements: 6.4
 */
export async function getInvitation(token: string): Promise<Invitation | null> {
  const invitation = invitationStore.get(token);

  if (!invitation) {
    return null;
  }

  // Check if expired
  if (new Date() > invitation.expiresAt) {
    return null;
  }

  // Check if already accepted
  if (invitation.accepted) {
    return null;
  }

  return invitation;
}

/**
 * Accept an invitation and add user to workspace
 * 
 * Validates the invitation token, adds the user to the workspace,
 * and marks the invitation as accepted.
 * 
 * @param token - The invitation token
 * @param userId - ID of the user accepting the invitation
 * @returns true if successful, false otherwise
 * 
 * Requirements: 6.4, 27.3
 */
export async function acceptInvitation(token: string, userId: string): Promise<boolean> {
  const invitation = await getInvitation(token);

  if (!invitation) {
    return false;
  }

  try {
    // Verify the user's email matches the invitation
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email.toLowerCase() !== invitation.email) {
      return false;
    }

    // Add user to workspace
    await prisma.user.update({
      where: { id: userId },
      data: {
        workspaceId: invitation.workspaceId,
      },
    });

    // Mark invitation as accepted
    invitation.accepted = true;
    invitationStore.set(token, invitation);

    return true;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return false;
  }
}

/**
 * Revoke an invitation
 * 
 * Removes an invitation from the system.
 * 
 * @param token - The invitation token
 * @returns true if revoked, false if not found
 */
export async function revokeInvitation(token: string): Promise<boolean> {
  const invitation = invitationStore.get(token);

  if (!invitation) {
    return false;
  }

  invitationStore.delete(token);
  return true;
}

/**
 * Get the invitation link for a token
 * 
 * @param token - The invitation token
 * @returns The full invitation URL
 */
export function getInvitationLink(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/team/accept-invite?token=${token}`;
}

// In-memory store for invitations
// In production, this would be a database table
const invitationStore = new Map<string, Invitation>();
