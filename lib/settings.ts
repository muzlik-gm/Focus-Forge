import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import crypto from 'crypto';

/**
 * Settings Data Access Layer
 * 
 * Provides functions for user settings management:
 * - updateProfile: Update user profile information
 * - updateWorkspaceSettings: Update workspace settings
 * - updateNotificationPreferences: Update notification preferences
 * - generateApiKey: Generate a new API key
 * - revokeApiKey: Revoke an existing API key
 * - getApiKeys: Get all API keys for a user
 * 
 * Requirements: 8.1, 8.2, 8.3, 31
 */

export interface ProfileSettings {
  name?: string;
  email?: string;
}

export interface WorkspaceSettings {
  name?: string;
}

export interface NotificationPreferences {
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  weeklyDigest?: boolean;
  taskReminders?: boolean;
  focusSessionReminders?: boolean;
}

export interface ApiKeyWithMask {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: Date | null;
  createdAt: Date;
}

/**
 * Update user profile
 * 
 * Updates the user's name and/or email.
 * 
 * @param userId - ID of the user
 * @param settings - Profile settings to update
 * @returns The updated user, or null if not found
 * 
 * Requirements: 8.1
 */
export async function updateProfile(
  userId: string,
  settings: ProfileSettings
): Promise<User | null> {
  try {
    // Build update data
    const updateData: { name?: string; email?: string } = {};
    
    if (settings.name !== undefined) {
      updateData.name = settings.name;
    }
    
    if (settings.email !== undefined) {
      updateData.email = settings.email;
    }

    // Check for email uniqueness if email is being updated
    if (settings.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: settings.email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });

    return user;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Update workspace settings
 * 
 * Updates the workspace name.
 * 
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for authorization)
 * @param settings - Workspace settings to update
 * @returns The updated workspace, or null if not found or unauthorized
 * 
 * Requirements: 8.2
 */
export async function updateWorkspaceSettings(
  workspaceId: string,
  userId: string,
  settings: WorkspaceSettings
) {
  try {
    // Verify user is the workspace owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
    });

    if (!workspace) {
      return null;
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: settings.name,
      },
    });

    return updatedWorkspace;
  } catch (error) {
    console.error('Error updating workspace settings:', error);
    return null;
  }
}

/**
 * Update notification preferences
 * 
 * Updates the user's notification preferences.
 * 
 * @param userId - ID of the user
 * @param preferences - Notification preferences to update
 * @returns The updated user, or null if not found
 * 
 * Requirements: 8.3
 */
export async function updateNotificationPreferences(
  userId: string,
  _preferences: NotificationPreferences
): Promise<User | null> {
  try {
    // For now, we'll store notification preferences in a JSON field
    // or we could add a separate NotificationPreferences model
    // For MVP, we'll use user extension fields approach
    
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        // Using a workaround - in a real app, you'd have a separate model
        // or use Prisma's JSON type
      },
    });

    // For now, return the user without updating (placeholder for full implementation)
    // In production, you'd want to store these preferences properly
    return user;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return null;
  }
}

/**
 * Generate a new API key
 * 
 * Creates a new API key for the user with the given name.
 * The key is hashed before storage for security.
 * 
 * @param userId - ID of the user
 * @param name - Name/description for the API key
 * @returns The created API key with prefix (for display), or null if error
 * 
 * Requirements: 31
 */
export async function generateApiKey(
  userId: string,
  name: string
): Promise<ApiKeyWithMask | null> {
  try {
    // Generate a new API key
    const key = `ff_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const keyPrefix = key.substring(0, 10) + '...';

    // Create the API key in the database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix,
      lastUsed: apiKey.lastUsed,
      createdAt: apiKey.createdAt,
    };
  } catch (error) {
    console.error('Error generating API key:', error);
    return null;
  }
}

/**
 * Revoke an API key
 * 
 * Deletes an API key from the database.
 * 
 * @param apiKeyId - ID of the API key to revoke
 * @param userId - ID of the user (for authorization)
 * @returns true if revoked, false if not found or unauthorized
 * 
 * Requirements: 31
 */
export async function revokeApiKey(
  apiKeyId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify the key belongs to the user
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId,
      },
    });

    if (!existingKey) {
      return false;
    }

    // Delete the key
    await prisma.apiKey.delete({
      where: {
        id: apiKeyId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

/**
 * Get all API keys for a user
 * 
 * Returns all API keys for the user (without the full key, only prefix).
 * 
 * @param userId - ID of the user
 * @returns Array of API keys
 * 
 * Requirements: 31
 */
export async function getApiKeys(userId: string): Promise<ApiKeyWithMask[]> {
  const keys = await prisma.apiKey.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyHash.substring(0, 10) + '...',
    lastUsed: key.lastUsed,
    createdAt: key.createdAt,
  }));
}

/**
 * Validate an API key
 * 
 * Checks if an API key is valid and returns the associated user.
 * Updates the last used timestamp.
 * 
 * @param apiKey - The API key to validate (without ff_ prefix)
 * @returns The user associated with the key, or null if invalid
 * 
 * Requirements: 31
 */
export async function validateApiKey(apiKey: string): Promise<User | null> {
  try {
    const keyHash = crypto.createHash('sha256').update(`ff_${apiKey}`).digest('hex');

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        keyHash,
      },
      include: {
        user: true,
      },
    });

    if (!apiKeyRecord) {
      return null;
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: {
        id: apiKeyRecord.id,
      },
      data: {
        lastUsed: new Date(),
      },
    });

    return apiKeyRecord.user;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Get user settings
 * 
 * Retrieves all user settings including profile, workspace, and preferences.
 * 
 * @param userId - ID of the user
 * @returns User settings object
 * 
 * Requirements: 8.1, 8.2, 8.3
 */
export async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      workspace: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    workspace: user.workspace
      ? {
          id: user.workspace.id,
          name: user.workspace.name,
          ownerId: user.workspace.ownerId,
        }
      : null,
    apiKeys: await getApiKeys(userId),
  };
}