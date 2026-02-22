'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronDown, Building2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Workspace Selector Component
 * 
 * Displays current workspace name in navbar with dropdown
 * to switch between workspaces.
 * 
 * Requirements: 17, 47
 */

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  currentWorkspaceId?: string;
  workspaces?: Workspace[];
}

export function WorkspaceSelector({ 
  currentWorkspaceId, 
  workspaces = [] 
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const hasTeamPlan = session?.user?.subscriptionTier === 'TEAM';

  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === currentWorkspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    } else if (workspaces.length > 0) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [currentWorkspaceId, workspaces]);

  const handleWorkspaceChange = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsOpen(false);
    // Workspace switching not yet implemented
    console.log('Switching to workspace:', workspace.name);
  };

  const handleCreateWorkspace = () => {
    setIsOpen(false);
    // TODO: Implement workspace creation
    console.log('Workspace creation not yet implemented');
  };

  // If user doesn't have TEAM plan, show upgrade prompt
  if (!hasTeamPlan) {
    return (
      <Button
        variant="ghost"
        onClick={() => router.push('/pricing')}
        className="flex items-center gap-2 h-9 px-2"
      >
        <Building2 className="w-4 h-4" />
        <span className="font-medium text-sm text-zinc-400">
          Personal
        </span>
      </Button>
    );
  }

  // If user has TEAM plan but no workspaces, show "Team Workspace" as default
  if (workspaces.length === 0) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-9 px-2"
        >
          <Building2 className="w-4 h-4" />
          <span className="font-medium truncate max-w-[120px]">
            Team Workspace
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            
            <div className="absolute left-0 mt-1 w-56 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-lg overflow-hidden z-[70]">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Workspaces
                </p>
              </div>

              <div className="py-1">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary"
                >
                  <Building2 className="w-4 h-4" />
                  <span className="flex-1 text-left truncate">
                    Team Workspace
                  </span>
                  <Check className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-white/10 py-1">
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current workspace button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-2"
      >
        <Building2 className="w-4 h-4" />
        <span className="font-medium truncate max-w-[120px]">
          {selectedWorkspace?.name || 'Select Workspace'}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute left-0 mt-1 w-56 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-lg overflow-hidden z-[70]">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Workspaces
              </p>
            </div>

            {/* Workspace list */}
            <div className="py-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    selectedWorkspace?.id === workspace.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-white/5'
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="flex-1 text-left truncate">
                    {workspace.name}
                  </span>
                  {selectedWorkspace?.id === workspace.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Create new workspace */}
            <div className="border-t border-white/10 py-1">
              <button
                onClick={handleCreateWorkspace}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Upgrade to Team Plan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}