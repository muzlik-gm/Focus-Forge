'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { get } from '@/lib/api-client';
import { InviteMemberModal } from '@/components/team/InviteMemberModal';
import { toSafeString } from '@/lib/render-safe';

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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Show upgrade prompt only if user doesn't have TEAM plan
  if (!hasTeamPlan) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold font-heading text-on-surface tracking-tight mb-1">Team</h1>
          <p className="text-on-surface-variant text-sm">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-8 text-center max-w-2xl mx-auto">
          <div className="skeuo-icon-container w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold font-heading text-on-surface tracking-tight mb-3">Team Collaboration Not Available</h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">
=======
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Team</h1>
          <p className="text-zinc-300 text-sm">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-8 text-center max-w-2xl mx-auto">
          <div className="skeuo-icon-container w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-3">Team Collaboration Not Available</h3>
          <p className="text-zinc-300 text-sm mb-6 max-w-md mx-auto">
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
            Upgrade to the Team plan to enable collaboration features and work with your team.
          </p>
          <Link
            href="/pricing"
            className="skeuo-button inline-block px-6 py-2.5 text-on-surface font-medium text-sm transition-all shadow-lg"
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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold font-heading text-on-surface tracking-tight mb-1">Team</h1>
          <p className="text-on-surface-variant text-sm">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-8 text-center max-w-2xl mx-auto">
          <div className="skeuo-icon-container w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold font-heading text-on-surface tracking-tight mb-3">Unable to Load Team Members</h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">{error}</p>
=======
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Team</h1>
          <p className="text-zinc-300 text-sm">Collaborate with your team</p>
        </div>
        <div className="skeuo-panel p-8 text-center max-w-2xl mx-auto">
          <div className="skeuo-icon-container w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-3">Unable to Load Team Members</h3>
          <p className="text-zinc-300 text-sm mb-6 max-w-md mx-auto">{error}</p>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
          <button
            onClick={fetchTeamMembers}
            className="skeuo-card hover:bg-surface-container-highest inline-block px-6 py-2.5 text-on-surface font-medium text-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold font-heading text-on-surface tracking-tight mb-1">Team</h1>
          <p className="text-on-surface-variant text-sm">Collaborate with your team</p>
=======
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Team</h1>
          <p className="text-zinc-300 text-sm">Collaborate with your team</p>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="skeuo-button inline-flex items-center gap-2 px-5 py-2.5 text-on-surface font-medium text-sm shadow-lg transition-all"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 skeuo-panel p-6">
<<<<<<< HEAD
          <h2 className="text-lg font-bold font-heading text-on-surface tracking-tight mb-5">Weekly Leaderboard</h2>
=======
          <h2 className="text-lg font-bold text-white tracking-tight mb-5">Weekly Leaderboard</h2>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
          {sortedMembers.length === 0 ? (
            <p className="text-xs text-outline text-center py-6">No team members yet</p>
          ) : (
            <div className="space-y-3">
              {sortedMembers.map((member, i) => (
                <div key={member.id} className="skeuo-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
<<<<<<< HEAD
                    <div className="text-xs font-bold text-outline w-5 text-center">{i + 1}</div>
                    <div className="skeuo-avatar w-10 h-10 font-bold text-base text-on-surface-variant">
=======
                    <div className="text-xs font-bold text-zinc-500 w-5 text-center">{i + 1}</div>
                    <div className="skeuo-avatar w-10 h-10 font-bold text-base text-zinc-300">
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
                      {toSafeString(member.name).charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-on-surface">{toSafeString(member.name)}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{toSafeString(member.email)}</div>
                    </div>
                  </div>
<<<<<<< HEAD
                  <div className="text-base font-bold font-heading text-on-surface">{formatFocusTime(member.totalFocusMinutes)}</div>
=======
                  <div className="text-base font-bold text-white">{formatFocusTime(member.totalFocusMinutes)}</div>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="skeuo-panel p-6">
<<<<<<< HEAD
          <h2 className="text-lg font-bold font-heading text-on-surface tracking-tight mb-5">Team Status</h2>
=======
          <h2 className="text-lg font-bold text-white tracking-tight mb-5">Team Status</h2>
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
          {sortedMembers.length === 0 ? (
            <p className="text-xs text-outline text-center py-6">No team members</p>
          ) : (
            <div className="space-y-3">
              {sortedMembers.map((member) => (
                <div key={member.id} className="skeuo-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
<<<<<<< HEAD
                    <div className="skeuo-avatar w-9 h-9 font-bold text-sm text-on-surface-variant">
=======
                    <div className="skeuo-avatar w-9 h-9 font-bold text-sm text-zinc-300">
>>>>>>> ffdba67be8dc3f10a5ea82ff4642602cf4f87f65
                      {toSafeString(member.name).charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{toSafeString(member.name).split(' ')[0]}</span>
                  </div>
                  <span className={`skeuo-badge text-xs ${getStatusColor(member.status)}`}>
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
