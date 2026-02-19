'use client';

import { useState, useEffect } from 'react';
import { User, Building, Bell, CreditCard, Key, Plug, MessageSquare, Calendar, FileText, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { get, post, patch, del } from '@/lib/api-client';

interface UserSettings {
  name: string;
  email: string;
  workspaceName?: string;
  subscriptionTier: string;
  nextBillingDate?: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  weeklySummary: boolean;
  teamUpdates: boolean;
}

export default function SettingsPage() {
  // const { data: _session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailNotifications: true,
    browserNotifications: true,
    weeklySummary: true,
    teamUpdates: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await get('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setUserSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Tabs */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
{tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {activeTab === 'profile' && <ProfileTab userSettings={userSettings} onUpdate={fetchSettings} />}
              {activeTab === 'workspace' && <WorkspaceTab userSettings={userSettings} onUpdate={fetchSettings} />}
              {activeTab === 'notifications' && <NotificationsTab preferences={notificationPrefs} onUpdate={setNotificationPrefs} />}
              {activeTab === 'billing' && <BillingTab userSettings={userSettings} />}
              {activeTab === 'api' && <APITab subscriptionTier={userSettings?.subscriptionTier} />}
              {activeTab === 'integrations' && <IntegrationsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProfileTabProps {
  userSettings: UserSettings | null;
  onUpdate: () => void;
}

function ProfileTab({ userSettings, onUpdate }: ProfileTabProps) {
  const [name, setName] = useState(userSettings?.name || '');
  const [email, setEmail] = useState(userSettings?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await patch('/api/settings/profile', { name, email, password: password || undefined });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setPassword('');
        onUpdate();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error?.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <p className="text-sm text-gray-400">Manage your personal information</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Change Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </motion.div>
  );
}

interface WorkspaceTabProps {
  userSettings: UserSettings | null;
  onUpdate: () => void;
}

function WorkspaceTab({ userSettings, onUpdate }: WorkspaceTabProps) {
  const [workspaceName, setWorkspaceName] = useState(userSettings?.workspaceName || '');
  const [defaultDuration, setDefaultDuration] = useState('25');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (userSettings?.workspaceName) {
      setWorkspaceName(userSettings.workspaceName);
    }
  }, [userSettings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await patch('/api/settings/workspace', { 
        name: workspaceName,
        defaultFocusDuration: parseInt(defaultDuration),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Workspace settings updated' });
        onUpdate();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error?.message || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Workspace Settings</h2>
        <p className="text-sm text-gray-400">Manage your workspace and team</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Default Focus Duration (minutes)</label>
          <select
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="25">25 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </motion.div>
  );
}

interface NotificationsTabProps {
  preferences: NotificationPreferences;
  onUpdate: (prefs: NotificationPreferences) => void;
}

function NotificationsTab({ preferences, onUpdate }: NotificationsTabProps) {
  const [notifs, setNotifs] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateNotif = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifs, [key]: value };
    setNotifs(updated);
    onUpdate(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await patch('/api/settings/notifications', notifs);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification preferences updated' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error?.message || 'Failed to update' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <p className="text-sm text-gray-400">Choose how you want to be notified</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {[
          { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email updates about your activity' },
          { key: 'browserNotifications', label: 'Browser notifications', desc: 'Get notified when focus sessions end' },
          { key: 'weeklySummary', label: 'Weekly summary', desc: 'Receive weekly productivity reports' },
          { key: 'teamUpdates', label: 'Team updates', desc: 'Get notified about team activity' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifs[item.key as keyof NotificationPreferences]}
                onChange={(e) => updateNotif(item.key as keyof NotificationPreferences, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </motion.div>
  );
}

interface BillingTabProps {
  userSettings: UserSettings | null;
}

function BillingTab({ userSettings }: BillingTabProps) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await post('/api/billing/portal', { returnUrl: window.location.href });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        console.error('Failed to create portal session');
      }
    } catch (_error) {
      console.error('Error creating portal session');
    } finally {
      setLoading(false);
    }
  };

  const tier = userSettings?.subscriptionTier || 'FREE';
  const nextBillingDate = userSettings?.nextBillingDate || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
        <p className="text-sm text-gray-400">Manage your subscription and payment methods</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Current Plan</p>
            <p className="text-2xl font-bold">{tier}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Next billing date</p>
            <p className="font-semibold">{nextBillingDate}</p>
          </div>
        </div>
        <Button onClick={handleManageSubscription} disabled={loading} className="w-full">
          {loading ? 'Loading...' : 'Manage Subscription'}
        </Button>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Billing History</h3>
        <p className="text-sm text-gray-400">View and download invoices from the Stripe portal.</p>
        <Button variant="outline" onClick={handleManageSubscription} disabled={loading} className="mt-4">
          View Billing History
        </Button>
      </div>
    </motion.div>
  );
}

interface APITabProps {
  subscriptionTier?: string;
}

function APITab({ subscriptionTier }: APITabProps) {
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; createdAt: string; lastUsed?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const isPro = subscriptionTier === 'PRO' || subscriptionTier === 'TEAM';

  useEffect(() => {
    if (isPro) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }
  }, [isPro]);

  const fetchApiKeys = async () => {
    try {
      const response = await get('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    const name = prompt('Enter a name for this API key:');
    if (!name) return;

    setGenerating(true);
    try {
      const response = await post('/api/settings/api-keys', { name });

      if (response.ok) {
        const data = await response.json();
        setNewKey(data.apiKey);
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await del(`/api/settings/api-keys/${id}`);

      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        <p className="text-sm text-gray-400">Manage API keys for integrations (Pro/Team only)</p>
      </div>

      {!isPro ? (
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400 mb-4">Upgrade to Pro or Team plan to access API keys</p>
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrade Now
          </Button>
        </div>
      ) : (
        <>
          {newKey && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 font-medium mb-2">API Key Generated (copy now, won't be shown again):</p>
              <code className="block p-3 bg-black/50 rounded text-sm font-mono break-all">{newKey}</code>
              <Button variant="ghost" size="sm" onClick={() => setNewKey(null)} className="mt-2">
                Dismiss
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <Skeleton className="h-12 w-full" />
            ) : apiKeys.length === 0 ? (
              <p className="text-sm text-gray-400">No API keys generated yet.</p>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                    {key.lastUsed && (
                      <p className="text-xs text-gray-500">Last used: {new Date(key.lastUsed).toLocaleDateString()}</p>
                    )}
                  </div>
                  <Button variant="danger" size="sm" onClick={() => revokeKey(key.id)}>
                    Revoke
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button onClick={generateKey} disabled={generating}>
            {generating ? 'Generating...' : 'Generate New API Key'}
          </Button>
        </>
      )}
    </motion.div>
  );
}

function IntegrationsTab() {
  const integrations = [
    { name: 'Slack', desc: 'Get notifications in Slack', connected: false, icon: MessageSquare },
    { name: 'Google Calendar', desc: 'Sync focus sessions', connected: false, icon: Calendar },
    { name: 'Notion', desc: 'Export tasks to Notion', connected: false, icon: FileText },
    { name: 'GitHub', desc: 'Track commits during focus', connected: false, icon: Github },
  ];

  const [connected, setConnected] = useState<Record<string, boolean>>({});

  const toggleIntegration = async (name: string) => {
    // In a real app, this would initiate OAuth flow
    setConnected(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold mb-4">Integrations</h2>
        <p className="text-sm text-gray-400">Connect FocusForge with your favorite tools</p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-sm text-gray-500">{integration.desc}</p>
                </div>
              </div>
              <Button
                variant={connected[integration.name] ? 'outline' : 'default'}
                onClick={() => toggleIntegration(integration.name)}
              >
                {connected[integration.name] ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
