'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Building, Bell, CreditCard, Key, Plug, MessageSquare, Calendar, FileText, Github, Monitor, CloudCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { get, post, patch, del } from '@/lib/api-client';
import { tauriApi } from '@/lib/tauri-api';
import DesktopSettings from '@/components/settings/DesktopSettings';
import { CloudSyncTab } from '@/components/settings/CloudSyncTab';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">Profile Settings</h2>
        <p className="text-base text-zinc-400">Manage your personal information</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-3 text-zinc-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-3 text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-3 text-zinc-300">Change Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
          />
        </div>

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-8 py-3 w-fit font-medium text-white shadow-lg transition-all mt-4">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">Workspace Settings</h2>
        <p className="text-base text-zinc-400">Manage your workspace and team</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-3 text-zinc-300">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-3 text-zinc-300">Default Focus Duration (minutes)</label>
          <select
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(e.target.value)}
            className="skeuo-input w-full px-5 py-3 text-white focus:outline-none"
          >
            <option value="25">25 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-8 py-3 w-fit font-medium text-white shadow-lg transition-all mt-4">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">Notification Preferences</h2>
        <p className="text-base text-zinc-400">Choose how you want to be notified</p>
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
          <div key={item.key} className="flex items-center justify-between p-6 skeuo-card">
            <div>
              <p className="font-bold text-white embossed-text mb-1">{item.label}</p>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
            <button
              onClick={() => updateNotif(item.key as keyof NotificationPreferences, !notifs[item.key as keyof NotificationPreferences])}
              className={`skeuo-toggle ${notifs[item.key as keyof NotificationPreferences] ? 'active' : ''}`}
            />
          </div>
        ))}

        <button onClick={handleSave} disabled={saving} className="skeuo-button px-8 py-3 w-fit font-medium text-white shadow-lg transition-all mt-4">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">Billing & Subscription</h2>
        <p className="text-base text-zinc-400">Manage your subscription and payment methods</p>
      </div>

      <div className="p-8 skeuo-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-[inset_0_0_80px_rgba(59,130,246,0.05)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-bold text-zinc-400 mb-2 tracking-wide uppercase">Current Plan</p>
            <p className="text-4xl font-black text-white embossed-text">{tier}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-zinc-400 mb-2 tracking-wide uppercase">Next billing date</p>
            <p className="text-lg font-semibold text-white tracking-tight">{nextBillingDate}</p>
          </div>
        </div>
        <button onClick={handleManageSubscription} disabled={loading} className="skeuo-button w-full px-8 py-4 font-bold text-lg text-white shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all">
          {loading ? 'Processing...' : 'Manage Subscription'}
        </button>
      </div>

      <div className="p-8 skeuo-card mt-8">
        <h3 className="text-lg font-bold text-white embossed-text mb-2">Billing History</h3>
        <p className="text-sm text-zinc-400 mb-6 font-medium">View and download invoices from the Stripe billing portal.</p>
        <button onClick={handleManageSubscription} disabled={loading} className="skeuo-card px-8 py-3 w-fit font-bold text-zinc-300 hover:text-white transition-all hover:bg-white/5 disabled:opacity-50">
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
        setNewKey(data.apiKey);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">API Keys</h2>
        <p className="text-base text-zinc-400">Manage API keys for custom integrations</p>
      </div>

      {!isPro ? (
        <div className="p-8 skeuo-card border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent text-center">
          <p className="text-base text-yellow-400 font-bold mb-6">Upgrade to Pro or Team plan to access custom API keys</p>
          <button onClick={() => window.location.href = '/pricing'} className="skeuo-button px-8 py-3 font-bold text-white transition-all">
            Upgrade Now
          </button>
        </div>
      ) : (
        <>
          {newKey && (
            <div className="p-6 skeuo-card border-green-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <p className="text-sm text-emerald-400 font-bold mb-3 tracking-tight">API Key Generated <span className="text-zinc-500 font-normal">(copy it securely, it won't be shown again)</span>:</p>
              <div className="flex items-center gap-3">
                <code className="block flex-1 px-5 py-4 skeuo-input text-sm font-mono tracking-wider break-all text-white selection:bg-emerald-500/30">{newKey}</code>
                <button onClick={() => navigator.clipboard.writeText(newKey)} className="skeuo-button px-6 py-4 font-bold text-white">Copy</button>
              </div>
              <button onClick={() => setNewKey(null)} className="mt-4 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
                Dismiss Notice
              </button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <Skeleton className="h-16 w-full rounded-[24px]" />
            ) : apiKeys.length === 0 ? (
              <div className="p-8 skeuo-card text-center text-zinc-500 font-medium border-dashed border-zinc-800">
                No active API keys found
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-6 skeuo-card outline outline-1 outline-transparent hover:outline-white/5 transition-all">
                  <div>
                    <p className="font-bold text-white embossed-text mb-1 text-lg">{key.name}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Created • {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsed && (
                        <span>Last used • {new Date(key.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setRevokeTarget({ id: key.id, name: key.name })}
                    className="skeuo-card px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent transition-all"
                  >
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setShowGenerateModal(true)} disabled={generating} className="skeuo-button px-8 py-4 font-bold text-sm uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-50 w-full mt-4">
            {generating ? 'Generating...' : 'Generate New Access Key'}
          </button>
        </>
      )}

      {/* Generate Key Modal */}
      {mounted && showGenerateModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setShowGenerateModal(false); setNewKeyName(''); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[210] w-full max-w-md mx-4 skeuo-panel p-0 overflow-hidden"
          >
            <div className="px-8 pt-8 pb-4 border-b border-white/5">
              <h3 className="text-xl font-black embossed-text text-white mb-1">Generate New API Key</h3>
              <p className="text-sm font-medium text-zinc-400">Give your API key a descriptive name to identify it later.</p>
            </div>
            <div className="px-8 py-6">
              <label className="block text-sm font-bold text-zinc-300 mb-3">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateKey()}
                placeholder="e.g. My App, CI/CD Pipeline..."
                className="skeuo-input w-full px-5 py-3 text-white focus:outline-none placeholder:text-zinc-600"
                autoFocus
              />
            </div>
            <div className="px-8 pb-8 flex items-center gap-4">
              <button
                onClick={generateKey}
                disabled={!newKeyName.trim()}
                className="skeuo-button flex-1 py-4 font-bold text-white disabled:opacity-40"
              >
                Generate Key
              </button>
              <button
                onClick={() => { setShowGenerateModal(false); setNewKeyName(''); }}
                className="skeuo-card flex-1 py-4 font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Revoke Confirmation Modal */}
      {mounted && revokeTarget && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setRevokeTarget(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-[210] w-full max-w-md mx-4 skeuo-panel p-0 overflow-hidden"
          >
            <div className="px-8 pt-8 pb-4 border-b border-rose-500/20 bg-rose-500/5">
              <h3 className="text-xl font-black text-rose-400 mb-1">Revoke API Key?</h3>
              <p className="text-sm font-medium text-zinc-400">
                Revoking <strong className="text-white">&ldquo;{revokeTarget.name}&rdquo;</strong> is permanent.
                Any apps using this key will immediately lose access.
              </p>
            </div>
            <div className="px-8 py-8 flex items-center gap-4">
              <button
                onClick={() => revokeKey(revokeTarget.id)}
                className="flex-1 py-4 font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-[0_4px_20px_rgba(220,38,38,0.3)]"
              >
                Yes, Revoke Key
              </button>
              <button
                onClick={() => setRevokeTarget(null)}
                className="skeuo-card flex-1 py-4 font-bold text-zinc-400 hover:text-white transition-colors"
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

function IntegrationsTab() {
  const integrations = [
    { name: 'Slack', desc: 'Get notifications in Slack', connected: false, icon: MessageSquare },
    { name: 'Google Calendar', desc: 'Sync focus sessions', connected: false, icon: Calendar },
    { name: 'Notion', desc: 'Export tasks to Notion', connected: false, icon: FileText },
    { name: 'GitHub', desc: 'Track commits during focus', connected: false, icon: Github },
  ];

  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleIntegration = async (name: string) => {
    // In a real app, this would initiate OAuth flow
    const isConnecting = !connected[name];
    setConnected(prev => ({ ...prev, [name]: isConnecting }));
    setMessage({ type: 'success', text: isConnecting ? `Successfully connected to ${name}` : `Disconnected from ${name}` });

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 embossed-text text-white">Integrations</h2>
        <p className="text-base text-zinc-400">Connect FocusForge with your favorite daily tools</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl skeuo-card border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid gap-5">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = connected[integration.name];

          return (
            <div key={integration.name} className="flex items-center justify-between p-6 skeuo-card group">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isConnected ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/30' : 'bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] border border-transparent'}`}>
                  <Icon className={`w-7 h-7 transition-colors duration-300 ${isConnected ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-white embossed-text text-lg mb-1">{integration.name}</p>
                  <p className="text-sm font-medium text-zinc-400">{integration.desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration(integration.name)}
                className={`px-8 py-3 rounded-[16px] text-sm font-bold uppercase tracking-wider transition-all duration-300 ${isConnected
                  ? 'skeuo-card text-zinc-400 hover:text-white border border-transparent hover:bg-white/5 active:scale-95'
                  : 'skeuo-button text-white shadow-lg shadow-blue-500/20 active:scale-95'
                  }`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
