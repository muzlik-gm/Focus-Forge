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
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Team</h1>
          <p className="text-zinc-300 text-lg">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-12 text-center max-w-2xl mx-auto">
          <div className="skeuo-avatar w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
            <Users className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 embossed-text">Team Collaboration Not Available</h3>
          <p className="text-zinc-300 text-lg mb-8 max-w-md mx-auto">
            Upgrade to the Team plan to enable collaboration features and work with your team.
          </p>
          <Link
            href="/pricing"
            className="skeuo-button inline-block px-8 py-4 text-white font-medium text-lg transition-all shadow-lg"
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
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Team</h1>
          <p className="text-zinc-300 text-lg">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-12 text-center max-w-2xl mx-auto">
          <div className="skeuo-avatar w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
            <Users className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 embossed-text tracking-tight">Unable to Load Team Members</h3>
          <p className="text-zinc-300 text-lg mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchTeamMembers}
            className="skeuo-card hover:bg-zinc-800 inline-block px-8 py-4 text-white font-medium text-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 embossed-text tracking-tight">Team</h1>
          <p className="text-zinc-300 text-lg">Collaborate with your team</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="skeuo-button inline-flex items-center gap-2 px-6 py-3 text-white font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Invite member
        </button>
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => fetchTeamMembers()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 skeuo-panel p-8">
          <h2 className="text-xl font-bold mb-8 embossed-text">Weekly Leaderboard</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-4">
              {sortedMembers.map((member, i) => (
                <div key={member.id} className="skeuo-card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-zinc-500 w-6 text-center">{i + 1}</div>
                    <div className="skeuo-avatar w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-lg embossed-text">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-medium text-white">{member.name}</div>
                      <div className="text-xs text-zinc-400 mt-1">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold embossed-text">{formatFocusTime(member.totalFocusMinutes)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="skeuo-panel p-8">
          <h2 className="text-xl font-bold mb-8 embossed-text">Team Status</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No team members</p>
          ) : (
            <div className="space-y-4">
              {sortedMembers.map((member) => (
                <div key={member.id} className="skeuo-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="skeuo-avatar w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-base embossed-text">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-base font-medium">{member.name.split(' ')[0]}</span>
                  </div>
                  <span className={`skeuo-badge ${getStatusColor(member.status)}`}>
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
