'use client';

import { useState, useEffect } from 'react';
import { Circle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Team Member Status Component
 * 
 * Displays team members with their current status:
 * - IN_FOCUS: User has an active focus session (green)
 * - AVAILABLE: User has no active session (gray)
 * - OFFLINE: User has no recent activity (gray with lower opacity)
 * 
 * Updates status every 30 seconds via polling.
 * 
 * Requirements: 43
 */

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'IN_FOCUS' | 'AVAILABLE' | 'OFFLINE';
  currentSessionId?: string | null;
}

interface TeamMemberStatusProps {
  members: TeamMember[];
  showLabels?: boolean;
  compact?: boolean;
}

// Mock team members for demo
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    status: 'IN_FOCUS',
    currentSessionId: 'session-1',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    status: 'AVAILABLE',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    status: 'OFFLINE',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'IN_FOCUS',
    currentSessionId: 'session-2',
  },
];

export function TeamMemberStatus({
  members = MOCK_TEAM_MEMBERS,
  showLabels = true,
  compact = false,
}: TeamMemberStatusProps) {
  const [displayMembers, setDisplayMembers] = useState(members);
  // const [isPolling, setIsPolling] = useState(false);

  // Poll for status updates every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/team/members');
        if (response.ok) {
          const data = await response.json();
          setDisplayMembers(data.members || []);
        }
      } catch (error) {
        console.error('Failed to poll team status:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Get status color
  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'IN_FOCUS':
        return 'bg-green-500';
      case 'AVAILABLE':
        return 'bg-gray-400';
      case 'OFFLINE':
        return 'bg-gray-300';
      default:
        return 'bg-gray-400';
    }
  };

  // Get status label
  const getStatusLabel = (status: TeamMember['status']) => {
    switch (status) {
      case 'IN_FOCUS':
        return 'In Focus';
      case 'AVAILABLE':
        return 'Available';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (compact) {
    // Compact view - just show avatars with status dots
    return (
      <div className="flex items-center -space-x-2">
        {displayMembers.slice(0, 5).map((member) => (
          <div
            key={member.id}
            className="relative group"
            title={`${member.name} - ${getStatusLabel(member.status)}`}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-background',
                getAvatarColor(member.name)
              )}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(member.name)
              )}
            </div>
            {/* Status dot */}
            <span
              className={cn(
                'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                getStatusColor(member.status)
              )}
            />
          </div>
        ))}
        {displayMembers.length > 5 && (
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-muted text-muted-foreground ring-2 ring-background'
            )}
          >
            +{displayMembers.length - 5}
          </div>
        )}
      </div>
    );
  }

  // Full view - show all members with details
  return (
    <div className="space-y-2">
      {displayMembers.map((member) => (
        <div
          key={member.id}
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg transition-colors',
            member.status === 'IN_FOCUS' && 'bg-green-50 dark:bg-green-950/20',
            member.status === 'AVAILABLE' && 'hover:bg-muted/50',
            member.status === 'OFFLINE' && 'opacity-60'
          )}
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                getAvatarColor(member.name)
              )}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(member.name)
              )}
            </div>
            {/* Status indicator */}
            <span
              className={cn(
                'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background',
                getStatusColor(member.status)
              )}
            />
          </div>

          {/* Member info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{member.name}</p>
            {showLabels && (
              <p className="text-xs text-muted-foreground">
                {getStatusLabel(member.status)}
                {member.status === 'IN_FOCUS' && (
                  <span className="ml-1 flex items-center gap-1 inline-flex">
                    <Clock className="w-3 h-3" />
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Status icon */}
          {member.status === 'IN_FOCUS' && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Circle className="w-2 h-2 fill-current animate-pulse" />
              <span>Focusing</span>
            </div>
          )}
          {member.status === 'AVAILABLE' && (
            <CheckCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );
}