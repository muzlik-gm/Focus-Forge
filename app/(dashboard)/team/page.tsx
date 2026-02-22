'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { get } from '@/lib/api-client';
import { InviteMemberModal } from '@/components/team/InviteMemberModal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'IN_FOCUS' | 'AVAILABLE' | 'OFFLINE';
  totalFocusMinutes: number;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await get('/api/team/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to load team members');
      }
    } catch {
      setError('Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_FOCUS': return 'In focus';
      case 'AVAILABLE': return 'Available';
      default: return 'Offline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_FOCUS': return 'bg-green-500/20 text-green-400';
      case 'AVAILABLE': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  // Sort by focus time (descending)
  const sortedMembers = [...members].sort((a, b) => b.totalFocusMinutes - a.totalFocusMinutes);

  // Check if user has TEAM plan
  const hasTeamPlan = session?.user?.subscriptionTier === 'TEAM';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Show upgrade prompt only if user doesn't have TEAM plan
  if (!hasTeamPlan) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Team</h1>
          <p className="text-zinc-400 text-sm">Collaborate with your team</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Team Collaboration Not Available</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Upgrade to the Team plan to enable collaboration features and work with your team.
          </p>
          <Link 
            href="/pricing"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading members (but user has TEAM plan)
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Team</h1>
          <p className="text-zinc-400 text-sm">Collaborate with your team</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Unable to Load Team Members</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">{error}</p>
          <button 
            onClick={fetchTeamMembers}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Team</h1>
          <p className="text-zinc-400 text-sm">Collaborate with your team</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite member
        </button>
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => fetchTeamMembers()}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="font-medium mb-6">Weekly Leaderboard</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-1">
              {sortedMembers.map((member, i) => (
                <div key={member.id} className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-zinc-500 w-8">{i + 1}</div>
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-zinc-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatFocusTime(member.totalFocusMinutes)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="font-medium mb-6">Team Status</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No team members</p>
          ) : (
            <div className="space-y-4">
              {sortedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                      <span className="text-xs">{member.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm">{member.name.split(' ')[0]}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
