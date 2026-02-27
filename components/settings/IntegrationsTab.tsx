'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, FileText, Check, X, ExternalLink, Zap, Settings, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  connected: boolean;
  features: string[];
}

/**
 * IntegrationsTab - Manage third-party integrations
 * 
 * Features:
 * - GitHub integration (issues, commits, gists)
 * - Notion integration (databases, pages, reports)
 * - Real-time sync status
 * - OAuth connection flow
 */
export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Sync tasks with issues, track commits during focus sessions, and generate productivity reports',
      icon: Github,
      color: '#6e5494',
      gradient: 'from-purple-500 to-pink-500',
      connected: false,
      features: [
        'Create issues from tasks',
        'Track commits during sessions',
        'Generate productivity gists',
        'Update project boards',
        'Sync with GitHub Projects',
      ],
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync tasks and sessions to Notion databases, create weekly reports, and track productivity',
      icon: FileText,
      color: '#000000',
      gradient: 'from-gray-800 to-black',
      connected: false,
      features: [
        'Create task pages',
        'Log focus sessions',
        'Generate weekly reports',
        'Sync task completion',
        'Track productivity metrics',
      ],
    },
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: true }
          : int
      )
    );
    
    setConnecting(null);
    toast.success(`Connected to ${integrations.find(i => i.id === integrationId)?.name}!`, {
      icon: '🎉',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });
  };

  const handleDisconnect = async (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: false }
          : int
      )
    );
    
    toast.success('Integration disconnected', {
      icon: '👋',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });
  };

  const handleSync = async (integrationId: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Syncing data...',
        success: 'Sync complete!',
        error: 'Sync failed',
      },
      {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold mb-1 text-white embossed-text">Integrations</h2>
        <p className="text-zinc-400 text-sm">
          Connect your favorite tools to supercharge your productivity
        </p>
      </motion.div>

      {/* Integrations Grid - Compact 2-column layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {integrations.map((integration, index) => {
          const Icon = integration.icon;
          const isConnecting = connecting === integration.id;

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="skeuo-card p-5 hover:bg-zinc-800/50 transition-all group"
            >
              {/* Header with icon and status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white embossed-text">
                      {integration.name}
                    </h3>
                    {integration.connected && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                {integration.description}
              </p>

              {/* Features - Compact list */}
              <div className="space-y-1.5 mb-4">
                {integration.features.slice(0, 3).map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-zinc-500"
                  >
                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${integration.gradient}`} />
                    {feature}
                  </div>
                ))}
                {integration.features.length > 3 && (
                  <div className="text-xs text-zinc-600 pl-3">
                    +{integration.features.length - 3} more features
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => handleSync(integration.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600/50 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={isConnecting}
                    className={`w-full px-4 py-2 rounded-lg bg-gradient-to-r ${integration.gradient} text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 hover:shadow-lg`}
                  >
                    {isConnecting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </motion.div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Coming Soon - Compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="skeuo-card p-6 text-center mt-6"
      >
        <div className="text-2xl mb-2">🚀</div>
        <h3 className="text-sm font-bold text-white mb-1">
          More Integrations Coming Soon
        </h3>
        <p className="text-xs text-zinc-500 mb-3">
          Slack, Trello, Jira, Linear, and more...
        </p>
        <button className="px-4 py-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600/50 text-white font-medium text-xs transition-colors">
          Request Integration
        </button>
      </motion.div>
    </div>
  );
}
