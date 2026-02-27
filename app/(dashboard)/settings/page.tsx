'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Building, Bell, CreditCard, Key, Plug, MessageSquare, Calendar, FileText, Github, Monitor, CloudCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { get, post, patch, del } from '@/lib/api-client';
import { tauriApi } from '@/lib/tauri-api';
import { toSafeString } from '@/lib/render-safe';
import DesktopSettings from '@/components/settings/DesktopSettings';
import { CloudSyncTab } from '@/components/settings/CloudSyncTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if running in Tauri desktop environment
    setIsDesktop(tauriApi.isTauriEnvironment());
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'cloud-sync', label: 'Cloud Sync', icon: CloudCog },
    ...(isDesktop ? [{ id: 'desktop', label: 'Desktop App', icon: Monitor }] : []),
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [settingsRes, notifsRes] = await Promise.all([
        get('/api/settings'),
        get('/api/settings/notifications')
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setUserSettings({
          name: data.settings.profile.name || '',
          email: data.settings.profile.email || '',
          workspaceName: data.settings.workspace?.name || '',
          subscriptionTier: data.settings.profile.subscriptionTier || 'FREE',
          nextBillingDate: '2026-03-26'
        });
      }

      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        if (notifsData.preferences) {
          setNotificationPrefs(notifsData.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Tabs */}
        <div className="md:sticky md:top-24 h-fit">
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
        </div>

        {/* Content */}
        <div className="skeuo-panel p-10 min-h-[500px]">
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
              {activeTab === 'api-keys' && <APITab subscriptionTier={userSettings?.subscriptionTier} />}
              {activeTab === 'integrations' && <IntegrationsTab />}
              {activeTab === 'cloud-sync' && <CloudSyncTab />}
              {activeTab === 'desktop' && isDesktop && <DesktopSettings />}
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

  useEffect(() => {
    if (userSettings) {
      setName(userSettings.name);
      setEmail(userSettings.email);
    }
  }, [userSettings]);

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1 embossed-text text-white">Profile Settings</h2>
        <p className="text-sm text-zinc-400">Manage your personal information</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-2 text-zinc-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-2 text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-2 text-zinc-300">Change Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900"
          />
        </div>

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-6 py-2.5 w-fit font-medium text-sm text-white shadow-lg transition-all">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1 embossed-text text-white">Workspace Settings</h2>
        <p className="text-sm text-zinc-400">Manage your workspace and team</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-2 text-zinc-300">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-2 text-zinc-300">Default Focus Duration</label>
          <select
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(e.target.value)}
            className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
            }}
          >
            <option value="25" className="bg-zinc-900 text-white">25 minutes</option>
            <option value="45" className="bg-zinc-900 text-white">45 minutes</option>
            <option value="60" className="bg-zinc-900 text-white">60 minutes</option>
            <option value="90" className="bg-zinc-900 text-white">90 minutes</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-6 py-2.5 w-fit font-medium text-sm text-white shadow-lg transition-all">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
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

  useEffect(() => {
    setNotifs(preferences);
  }, [preferences]);

  const updateNotif = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifs, [key]: value };
    setNotifs(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await patch('/api/settings/notifications', notifs);

      if (response.ok) {
        const updatedPrefs = await response.json();
        setMessage({ type: 'success', text: 'Notification preferences updated' });
        onUpdate(updatedPrefs.preferences || notifs);
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1 embossed-text text-white">Notification Preferences</h2>
        <p className="text-sm text-zinc-400">Choose how you want to be notified</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {[
          { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email updates about your activity' },
          { key: 'browserNotifications', label: 'Browser notifications', desc: 'Get notified when focus sessions end' },
          { key: 'weeklySummary', label: 'Weekly summary', desc: 'Receive weekly productivity reports' },
          { key: 'teamUpdates', label: 'Team updates', desc: 'Get notified about team activity' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 skeuo-card">
            <div>
              <p className="font-bold text-white embossed-text mb-0.5 text-sm">{item.label}</p>
              <p className="text-xs text-zinc-400">{item.desc}</p>
            </div>
            <button
              onClick={() => updateNotif(item.key as keyof NotificationPreferences, !notifs[item.key as keyof NotificationPreferences])}
              className={`skeuo-toggle ${notifs[item.key as keyof NotificationPreferences] ? 'active' : ''}`}
            />
          </div>
        ))}

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-6 py-2.5 w-fit font-medium text-sm text-white shadow-lg transition-all mt-2">
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1 embossed-text text-white">Billing & Subscription</h2>
        <p className="text-sm text-zinc-400">Manage your subscription and payment methods</p>
      </div>

      <div className="p-6 skeuo-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-zinc-400 mb-1 tracking-wide uppercase">Current Plan</p>
            <p className="text-3xl font-black text-white embossed-text">{tier}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-400 mb-1 tracking-wide uppercase">Next billing date</p>
            <p className="text-base font-semibold text-white">{nextBillingDate}</p>
          </div>
        </div>
        <button onClick={handleManageSubscription} disabled={loading} className="skeuo-button w-full px-6 py-3 font-bold text-sm text-white shadow-lg transition-all">
          {loading ? 'Processing...' : 'Manage Subscription'}
        </button>
      </div>

      <div className="p-6 skeuo-card">
        <h3 className="text-base font-bold text-white embossed-text mb-1">Billing History</h3>
        <p className="text-xs text-zinc-400 mb-4 font-medium">View and download invoices from the Stripe billing portal.</p>
        <button onClick={handleManageSubscription} disabled={loading} className="skeuo-card px-6 py-2.5 w-fit font-bold text-xs text-zinc-300 hover:text-white transition-all hover:bg-white/5 disabled:opacity-50">
          View Billing History
        </button>
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
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    if (!newKeyName.trim()) return;
    setShowGenerateModal(false);
    setGenerating(true);
    try {
      const response = await post('/api/settings/api-keys', { name: newKeyName.trim() });
      if (response.ok) {
        const data = await response.json();
        // Extract just the key string, not the entire object
        setNewKey(data.apiKey?.key || String(data.apiKey));
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: string) => {
    setRevokeTarget(null);
    try {
      const response = await del(`/api/settings/api-keys/${id}`);
      if (response.ok) fetchApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1 embossed-text text-white">API Keys</h2>
        <p className="text-sm text-zinc-400">Manage API keys for custom integrations</p>
      </div>

      {!isPro ? (
        <div className="p-6 skeuo-card border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent text-center">
          <p className="text-sm text-yellow-400 font-bold mb-4">Upgrade to Pro or Team plan to access custom API keys</p>
          <button onClick={() => window.location.href = '/pricing'} className="skeuo-button px-6 py-2.5 font-bold text-white text-sm transition-all">
            Upgrade Now
          </button>
        </div>
      ) : (
        <>
          {newKey && (
            <div className="p-4 skeuo-card border-green-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <p className="text-xs text-emerald-400 font-bold mb-2">API Key Generated <span className="text-zinc-500 font-normal">(copy it securely, won't be shown again)</span>:</p>
              <div className="flex items-center gap-2">
                <code className="block flex-1 px-3 py-2 skeuo-input text-xs font-mono break-all text-white selection:bg-emerald-500/30">{newKey}</code>
                <button onClick={() => navigator.clipboard.writeText(newKey)} className="skeuo-button px-4 py-2 font-bold text-white text-xs">Copy</button>
              </div>
              <button onClick={() => setNewKey(null)} className="mt-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-2">
            {loading ? (
              <Skeleton className="h-14 w-full rounded-lg" />
            ) : apiKeys.length === 0 ? (
              <div className="p-6 skeuo-card text-center text-zinc-500 text-sm font-medium border-dashed border-zinc-800">
                No active API keys found
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 skeuo-card hover:bg-zinc-800/50 transition-all">
                  <div>
                    <p className="font-bold text-white embossed-text mb-0.5 text-sm">{toSafeString(key.name)}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <span>• Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setRevokeTarget({ id: toSafeString(key.id), name: toSafeString(key.name) })}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setShowGenerateModal(true)} disabled={generating} className="skeuo-button px-6 py-3 font-bold text-sm text-white shadow-lg transition-all disabled:opacity-50 w-full">
            {generating ? 'Generating...' : '+ Generate New API Key'}
          </button>
        </>
      )}

      {/* Generate Key Modal - Compact */}
      {mounted && showGenerateModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setShowGenerateModal(false); setNewKeyName(''); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[210] w-full max-w-md mx-4 skeuo-panel p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black embossed-text text-white mb-1">Generate New API Key</h3>
            <p className="text-xs text-zinc-400 mb-4">Give your API key a descriptive name.</p>
            
            <label className="block text-xs font-bold text-zinc-300 mb-2">Key Name</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateKey()}
              placeholder="e.g. My App, CI/CD Pipeline..."
              className="skeuo-input w-full px-4 py-2.5 text-sm text-white focus:outline-none placeholder:text-zinc-600 mb-4"
              autoFocus
            />
            
            <div className="flex items-center gap-3">
              <button
                onClick={generateKey}
                disabled={!newKeyName.trim()}
                className="skeuo-button flex-1 py-2.5 font-bold text-sm text-white disabled:opacity-40"
              >
                Generate
              </button>
              <button
                onClick={() => { setShowGenerateModal(false); setNewKeyName(''); }}
                className="skeuo-card flex-1 py-2.5 font-bold text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Revoke Confirmation Modal - Compact */}
      {mounted && revokeTarget && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setRevokeTarget(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-[210] w-full max-w-md mx-4 skeuo-panel p-6 overflow-hidden border-rose-500/20"
          >
            <h3 className="text-lg font-black text-rose-400 mb-1">Revoke API Key?</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Revoking <strong className="text-white">&ldquo;{toSafeString(revokeTarget.name)}&rdquo;</strong> is permanent.
              Any apps using this key will lose access.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => revokeKey(toSafeString(revokeTarget.id))}
                className="flex-1 py-2.5 font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Yes, Revoke
              </button>
              <button
                onClick={() => setRevokeTarget(null)}
                className="skeuo-card flex-1 py-2.5 font-bold text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}

// IntegrationsTab is now imported from components/settings/IntegrationsTab.tsx
