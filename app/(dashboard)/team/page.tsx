'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'IN_FOCUS' | 'AVAILABLE' | 'OFFLINE';
  totalFocusMinutes: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        setError('Failed to load team members');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Team</h1>
            <p className="text-sm text-gray-400">Collaborate with your team and track progress.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="h-8 w-40 bg-white/10 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="h-8 w-32 bg-white/10 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Team</h1>
            <p className="text-sm text-gray-400">Collaborate with your team and track progress.</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchTeamMembers}
            className="mt-4 px-4 py-2 bg-white/10 text-sm font-medium rounded-md hover:bg-white/20 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Team</h1>
          <p className="text-sm text-gray-400">Collaborate with your team and track progress.</p>
        </div>
        <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-base font-semibold mb-6">Weekly leaderboard</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No team members yet</p>
          ) : (
            <div className="space-y-1">
              {sortedMembers.map((member, i) => (
                <div key={member.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 w-8">{i + 1}</div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatFocusTime(member.totalFocusMinutes)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Status */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-base font-semibold mb-6">Team status</h2>
          {sortedMembers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No team members</p>
          ) : (
            <div className="space-y-4">
              {sortedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
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
