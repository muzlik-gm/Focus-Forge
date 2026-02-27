'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Settings, CheckCircle, Code2, Gamepad2, Palette, PenTool,
  Trophy, Target, Sparkles, Zap, ShieldAlert, AlertTriangle, Flame, Lightbulb,
  Smartphone, Ban, OctagonX, Focus, Crosshair, Repeat, Shuffle, Workflow,
  Sunrise, Sun, Moon, TrendingUp, GraduationCap, BarChart, Clock, Timer,
  CircleCheck, Coffee, AlertCircle, OctagonAlert, Hourglass
} from 'lucide-react';
import { tauriApi } from '@/lib/tauri-api';
import { post } from '@/lib/api-client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { FocusSession, ApplicationCategory } from '@/types/tauri';

/**
 * DesktopFocusSession Component
 * 
 * Desktop-specific focus session management UI that integrates with Tauri commands.
 * Features:
 * - Session start dialog with category selection
 * - Active session controls (pause/resume/stop)
 * - Session summary display after completion
 * - Real-time monitoring integration
 * 
 * Requirements: 6.1, 6.5
 */

interface SessionSummary {
  totalDuration: number;
  focusTime: number;
  idleTime: number;
  distractionCount: number;
  applicationBreakdown: Record<string, number>;
  productivityScore: number;
  insights?: ProductivityInsight[];
}

interface ProductivityInsight {
  type: 'success' | 'warning' | 'tip';
  icon: string;
  message: string;
}

// Icon mapping for insights
const INSIGHT_ICONS: Record<string, React.ComponentType<any>> = {
  'trophy': Trophy,
  'target': Target,
  'sparkles': Sparkles,
  'zap': Zap,
  'shield-alert': ShieldAlert,
  'alert-triangle': AlertTriangle,
  'flame': Flame,
  'check-circle': CheckCircle,
  'lightbulb': Lightbulb,
  'smartphone': Smartphone,
  'ban': Ban,
  'octagon-x': OctagonX,
  'bar-chart': BarChart,
  'clock': Clock,
  'timer': Timer,
  'circle-check': CircleCheck,
  'coffee': Coffee,
  'alert-circle': AlertCircle,
  'octagon-alert': OctagonAlert,
  'focus': Focus,
  'crosshair': Crosshair,
  'repeat': Repeat,
  'shuffle': Shuffle,
  'workflow': Workflow,
  'sunrise': Sunrise,
  'sun': Sun,
  'moon': Moon,
  'trending-up': TrendingUp,
  'graduation-cap': GraduationCap,
  'hourglass': Hourglass,
};

/**
 * Generate actionable productivity insights based on session data
 */
function generateProductivityInsights(
  productivityScore: number,
  distractionCount: number,
  totalDuration: number,
  focusTime: number,
  breakdown: Record<string, number>
): ProductivityInsight[] {
  const insights: ProductivityInsight[] = [];
  const durationMinutes = Math.round(totalDuration / 60);
  const sortedApps = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const distractingTime = totalDuration - focusTime;
  const distractingPercent = Math.round((distractingTime / totalDuration) * 100);

  // === PRODUCTIVITY SCORE ANALYSIS ===
  if (productivityScore >= 95) {
    const messages = [
      'Peak performance! You\'re operating at maximum efficiency.',
      'Exceptional focus! This is what deep work looks like.',
      'Outstanding! You\'ve mastered the art of concentration.',
      'Incredible discipline! You barely broke focus at all.',
    ];
    insights.push({
      type: 'success',
      icon: 'trophy',
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  } else if (productivityScore >= 85) {
    const messages = [
      'Excellent work! You maintained strong focus throughout.',
      'Great session! Your concentration was rock solid.',
      'Impressive! You stayed in the zone for most of the session.',
      'Well done! This level of focus will compound over time.',
    ];
    insights.push({
      type: 'success',
      icon: 'target',
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  } else if (productivityScore >= 70) {
    const messages = [
      'Solid session! A few distractions but you recovered well.',
      'Good focus overall. Keep building this momentum.',
      'Nice work! You\'re developing strong focus habits.',
      'Productive session! Small improvements will add up.',
    ];
    insights.push({
      type: 'success',
      icon: 'sparkles',
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  } else if (productivityScore >= 50) {
    insights.push({
      type: 'warning',
      icon: 'zap',
      message: `${distractingPercent}% of time was off-task. Try the Pomodoro technique: 25 min focus, 5 min break.`,
    });
  } else if (productivityScore >= 30) {
    insights.push({
      type: 'warning',
      icon: 'shield-alert',
      message: `Only ${productivityScore}% productive. Consider using app blockers like Cold Turkey or Freedom.`,
    });
  } else {
    insights.push({
      type: 'warning',
      icon: 'alert-triangle',
      message: `${productivityScore}% productivity is low. Try airplane mode or a dedicated focus space.`,
    });
  }

  // === DISTRACTION ANALYSIS ===
  // Only show "no distractions" message if productivity is also decent (>50%)
  if (distractionCount === 0 && productivityScore >= 90) {
    const messages = [
      'Zero distractions! You\'re in a state of flow.',
      'Perfect focus! Not a single distraction broke your concentration.',
      'Flawless execution! This is what peak productivity feels like.',
      'Distraction-free! You\'ve achieved deep work mastery.',
    ];
    insights.push({
      type: 'success',
      icon: 'flame',
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  } else if (distractionCount === 0 && productivityScore >= 50) {
    insights.push({
      type: 'success',
      icon: 'check-circle',
      message: 'No distractions logged! Great discipline.',
    });
  } else if (distractionCount === 1) {
    insights.push({
      type: 'tip',
      icon: 'lightbulb',
      message: 'One distraction is acceptable. Aim for zero next time!',
    });
  } else if (distractionCount === 2) {
    insights.push({
      type: 'tip',
      icon: 'smartphone',
      message: '2 distractions. Try putting your phone in another room.',
    });
  } else if (distractionCount >= 3 && distractionCount <= 5) {
    insights.push({
      type: 'warning',
      icon: 'ban',
      message: `${distractionCount} distractions. Use browser extensions like LeechBlock or StayFocusd.`,
    });
  } else if (distractionCount > 5) {
    insights.push({
      type: 'warning',
      icon: 'octagon-x',
      message: `${distractionCount} distractions is too many. Block social media and close unnecessary tabs.`,
    });
  }

  // === SPECIFIC APP INSIGHTS ===
  const distractingApps = sortedApps.filter(([app, duration]) => {
    // Apps that took significant time but weren't productive
    const percent = (duration / totalDuration) * 100;
    return percent >= 10 && duration >= 60; // At least 10% and 60+ seconds
  });

  if (distractingApps.length > 0) {
    const topDistractor = distractingApps[0];
    const distractorMinutes = Math.round(topDistractor[1] / 60);
    const distractorPercent = Math.round((topDistractor[1] / totalDuration) * 100);
    
    if (distractorPercent >= 30) {
      insights.push({
        type: 'warning',
        icon: 'bar-chart',
        message: `${topDistractor[0]} consumed ${distractorMinutes} min (${distractorPercent}%). Block it during focus time.`,
      });
    } else if (distractorPercent >= 15) {
      insights.push({
        type: 'tip',
        icon: 'clock',
        message: `${topDistractor[0]} took ${distractorMinutes} min. Schedule specific times for non-work apps.`,
      });
    }
  }

  // === SESSION DURATION INSIGHTS ===
  if (durationMinutes < 10) {
    insights.push({
      type: 'tip',
      icon: 'timer',
      message: 'Short session. Try 25-minute Pomodoros for better results.',
    });
  } else if (durationMinutes >= 20 && durationMinutes <= 30) {
    insights.push({
      type: 'success',
      icon: 'circle-check',
      message: 'Perfect Pomodoro length! Take a 5-minute break now.',
    });
  } else if (durationMinutes >= 45 && durationMinutes <= 60) {
    insights.push({
      type: 'tip',
      icon: 'coffee',
      message: 'Long session! Take a 15-minute break. Walk, stretch, or hydrate.',
    });
  } else if (durationMinutes >= 90 && durationMinutes <= 120) {
    insights.push({
      type: 'warning',
      icon: 'alert-circle',
      message: '90+ minutes without a break reduces effectiveness. Try 50/10 intervals.',
    });
  } else if (durationMinutes > 120) {
    insights.push({
      type: 'warning',
      icon: 'octagon-alert',
      message: '2+ hours is too long! Your brain needs breaks. Use the 52/17 method.',
    });
  }

  // === SINGLE-TASKING INSIGHTS ===
  if (sortedApps.length > 0) {
    const topApp = sortedApps[0];
    const topAppPercent = Math.round((topApp[1] / totalDuration) * 100);
    const topAppMinutes = Math.round(topApp[1] / 60);
    
    if (topAppPercent >= 90) {
      insights.push({
        type: 'success',
        icon: 'focus',
        message: `${topAppPercent}% in ${topApp[0]} - masterful single-tasking!`,
      });
    } else if (topAppPercent >= 75) {
      insights.push({
        type: 'success',
        icon: 'crosshair',
        message: `Strong focus on ${topApp[0]} (${topAppMinutes} min). Keep this up!`,
      });
    }
  }

  // === CONTEXT SWITCHING INSIGHTS ===
  if (sortedApps.length >= 8) {
    insights.push({
      type: 'warning',
      icon: 'repeat',
      message: `${sortedApps.length} different apps! Context switching kills productivity. Stick to 2-3 tools.`,
    });
  } else if (sortedApps.length >= 5) {
    insights.push({
      type: 'tip',
      icon: 'shuffle',
      message: `${sortedApps.length} apps used. Reduce to 3 or fewer for better focus.`,
    });
  } else if (sortedApps.length <= 2 && productivityScore >= 70) {
    insights.push({
      type: 'success',
      icon: 'workflow',
      message: 'Minimal app switching! This is how you achieve flow state.',
    });
  }

  // === TIME-OF-DAY INSIGHTS ===
  const now = new Date();
  const hour = now.getHours();
  
  if (productivityScore >= 80) {
    if (hour >= 6 && hour < 10) {
      insights.push({
        type: 'tip',
        icon: 'sunrise',
        message: 'Morning sessions are your peak time! Schedule hard tasks here.',
      });
    } else if (hour >= 14 && hour < 17) {
      insights.push({
        type: 'tip',
        icon: 'sun',
        message: 'Afternoon productivity! You\'ve found your rhythm.',
      });
    } else if (hour >= 20 || hour < 6) {
      insights.push({
        type: 'tip',
        icon: 'moon',
        message: 'Night owl! Just ensure you\'re getting enough sleep.',
      });
    }
  }

  // === MOTIVATIONAL INSIGHTS ===
  if (productivityScore >= 70 && distractionCount <= 2) {
    const motivational = [
      'Consistency beats intensity. Keep showing up like this!',
      'Small daily improvements lead to stunning results.',
      'You\'re building a powerful focus habit. Don\'t break the chain!',
      'This is how professionals work. You\'re on the right path.',
      'Every focused session compounds. You\'re investing in your future.',
    ];
    insights.push({
      type: 'tip',
      icon: 'trending-up',
      message: motivational[Math.floor(Math.random() * motivational.length)],
    });
  }

  // === IMPROVEMENT SUGGESTIONS ===
  if (productivityScore < 70) {
    const suggestions = [
      'Try the "Two-Minute Rule": if it takes < 2 min, do it now. Otherwise, schedule it.',
      'Use the "5-4-3-2-1" technique: Count down and start immediately. No thinking.',
      'Create a pre-session ritual: close tabs, silence phone, set intention.',
      'Work in a different location. Environment shapes behavior.',
      'Use white noise or focus music. Try Brain.fm or Noisli.',
      'Set a clear goal before starting: "I will complete X by the end of this session."',
    ];
    insights.push({
      type: 'tip',
      icon: 'graduation-cap',
      message: suggestions[Math.floor(Math.random() * suggestions.length)],
    });
  }

  // Limit to 5-6 most relevant insights
  return insights.slice(0, 6);
}

export function DesktopFocusSession() {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const WORK_PROFILES = [
    { 
      id: 'dev_web', 
      name: 'Web Dev', 
      icon: Code2, 
      productive: ['Productive', 'programming', 'ide', 'web browser', 'terminal', 'utility'],
      description: 'IDEs, browsers, terminals for web development'
    },
    { 
      id: 'dev_game', 
      name: 'Game Dev', 
      icon: Gamepad2, 
      productive: ['Productive', 'game engine', '3d modeling', 'programming', 'ide', 'graphics editor', 'utility'],
      description: 'Game engines, 3D tools, IDEs'
    },
    { 
      id: 'art_design', 
      name: 'Art & Design', 
      icon: Palette, 
      productive: ['Productive', 'graphics editor', 'vector graphics', '3d modeling', 'design', 'utility'],
      description: 'Design tools, graphics editors'
    },
    { 
      id: 'writing', 
      name: 'Writing', 
      icon: PenTool, 
      productive: ['Productive', 'word processor', 'writing', 'web browser', 'utility'],
      description: 'Word processors, writing tools'
    },
    { 
      id: 'custom', 
      name: 'Custom', 
      icon: Settings, 
      productive: ['Productive'],
      description: 'Choose specific apps manually'
    },
  ];

  // Start dialog state
  const [selectedProfile, setSelectedProfile] = useState(WORK_PROFILES[0]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Productive']);
  const [sessionGoal, setSessionGoal] = useState('');
  const [durationValue, setDurationValue] = useState(25); // The actual number shown in input
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  
  // New: Application selection state
  const [availableApps, setAvailableApps] = useState<Array<{ name: string; category: string; tags: string[] }>>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [customProfileName, setCustomProfileName] = useState('');
  const [savedProfiles, setSavedProfiles] = useState<Array<{ name: string; apps: string[] }>>([]);

  // Session state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentApp, setCurrentApp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load available categories on mount
  useEffect(() => {
    loadCategories();
    checkActiveSession();
    loadSavedProfiles();
  }, []);

  // Load running applications when app selector is opened
  useEffect(() => {
    if (showAppSelector && availableApps.length === 0) {
      loadRunningApplications();
    }
  }, [showAppSelector]);

  const loadSavedProfiles = () => {
    try {
      const saved = localStorage.getItem('focus_custom_profiles');
      if (saved) {
        setSavedProfiles(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading saved profiles:', err);
    }
  };

  const saveCustomProfile = () => {
    if (!customProfileName.trim() || selectedApps.length === 0) {
      setError('Please enter a profile name and select at least one app');
      return;
    }

    const newProfile = {
      name: customProfileName.trim(),
      apps: selectedApps,
    };

    const updated = [...savedProfiles, newProfile];
    setSavedProfiles(updated);
    localStorage.setItem('focus_custom_profiles', JSON.stringify(updated));
    setCustomProfileName('');
    setError(null);
  };

  const loadCustomProfile = (profile: { name: string; apps: string[] }) => {
    setSelectedApps(profile.apps);
    setShowAppSelector(true);
  };

  const deleteCustomProfile = (profileName: string) => {
    const updated = savedProfiles.filter(p => p.name !== profileName);
    setSavedProfiles(updated);
    localStorage.setItem('focus_custom_profiles', JSON.stringify(updated));
  };

  const loadRunningApplications = async () => {
    setLoadingApps(true);
    try {
      // Get all application categories from the database
      const appCategories = await tauriApi.categories.listAll();
      console.log('[LoadApps] All app categories:', appCategories);

      // Get unique applications with their metadata
      const uniqueApps = new Map<string, { name: string; category: string; tags: string[] }>();
      
      for (const appCat of appCategories) {
        const appName = appCat.application;
        if (!uniqueApps.has(appName)) {
          // Get full metadata for this app
          const categoryStr = await tauriApi.categories.getCategoryWithFallback(appName);
          const parts = categoryStr.split(',').map(s => s.trim());
          const category = parts.find(p => !p.startsWith('type:')) || 'Neutral';
          const tags = parts.filter(p => p.startsWith('type:')).map(p => p.replace('type:', ''));
          
          uniqueApps.set(appName, {
            name: appName,
            category,
            tags,
          });
        }
      }

      const apps = Array.from(uniqueApps.values()).sort((a, b) => a.name.localeCompare(b.name));
      setAvailableApps(apps);
      console.log('[LoadApps] Loaded apps:', apps);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const toggleAppSelection = (appName: string) => {
    setSelectedApps(prev => {
      if (prev.includes(appName)) {
        return prev.filter(a => a !== appName);
      } else {
        return [...prev, appName];
      }
    });
  };

  const selectAllApps = () => {
    setSelectedApps(availableApps.map(app => app.name));
  };

  const deselectAllApps = () => {
    setSelectedApps([]);
  };

  const selectAppsByCategory = (category: string) => {
    const apps = availableApps.filter(app => app.category === category).map(app => app.name);
    setSelectedApps(prev => {
      const newSet = new Set([...prev, ...apps]);
      return Array.from(newSet);
    });
  };

  // Timer for elapsed time with auto-stop
  useEffect(() => {
    if (currentSession?.status === 'Active') {
      const interval = setInterval(() => {
        const now = Date.now(); // milliseconds
        const elapsed = Math.floor((now - currentSession.startTime) / 1000);

        // Retrieve duration from local storage (set during session start)
        const storedDuration = localStorage.getItem(`session_duration_${currentSession.id}`);
        if (storedDuration) {
          const durationSeconds = parseInt(storedDuration) * 60;
          const remaining = Math.max(0, durationSeconds - elapsed);
          setElapsedTime(remaining);

          // Auto-stop when timer reaches 0
          if (remaining === 0) {
            console.log('[Timer] Session time reached 0, auto-stopping...');
            handleStopSession();
          }
        } else {
          setElapsedTime(elapsed);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  // Poll current application
  useEffect(() => {
    if (currentSession?.status === 'Active') {
      const interval = setInterval(async () => {
        try {
          const appInfo = await tauriApi.monitoring.getActiveWindow();
          setCurrentApp(appInfo.name);
        } catch (err) {
          console.error('Error getting active window:', err);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const loadCategories = async () => {
    try {
      const categoryNames = await tauriApi.categories.listCategoryNames();
      console.log('[DesktopFocusSession] Raw categories from API:', categoryNames);
      console.log('[DesktopFocusSession] First category type:', typeof categoryNames[0]);
      
      // Ensure categories are strings, not objects
      // Handle case where API might return objects with {id, name, key, createdAt}
      const validCategories = categoryNames
        .map(cat => {
          if (typeof cat === 'string') {
            return cat;
          } else if (cat && typeof cat === 'object' && 'name' in cat) {
            // If it's an object with a name property, extract it
            return String((cat as any).name);
          } else if (cat && typeof cat === 'object' && 'category' in cat) {
            // If it's an object with a category property, extract it
            return String((cat as any).category);
          } else {
            console.warn('[DesktopFocusSession] Unexpected category format:', cat);
            return null;
          }
        })
        .filter((cat): cat is string => cat !== null);
      
      console.log('[DesktopFocusSession] Processed categories:', validCategories);
      setCategories(validCategories);
      
      if (validCategories.length === 0) {
        console.warn('[DesktopFocusSession] No valid categories found, using defaults');
        setCategories(['Productive', 'Neutral', 'Distracting']);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(['Productive', 'Neutral', 'Distracting']);
    }
  };

  const checkActiveSession = async () => {
    try {
      const session = await tauriApi.focusSessions.getCurrent();
      if (session) {
        setCurrentSession(session);
        const now = Date.now();
        const elapsed = Math.floor((now - session.startTime) / 1000);

        const storedDuration = localStorage.getItem(`session_duration_${session.id}`);
        if (storedDuration) {
          const durationSeconds = parseInt(storedDuration) * 60;
          setElapsedTime(Math.max(0, durationSeconds - elapsed));
        } else {
          setElapsedTime(elapsed);
        }
      }
    } catch (err) {
      console.error('Error checking active session:', err);
    }
  };

  const handleStartSession = async () => {
    // Determine if we're using app-based or category-based mode
    const isAppBasedMode = selectedProfile.id === 'custom' && selectedApps.length > 0;
    
    // If using app-based selection (custom profile with apps), validate apps
    if (isAppBasedMode && selectedApps.length === 0) {
      setError('Please select at least one application to track');
      return;
    }

    // If using category-based selection, validate categories
    if (!isAppBasedMode && selectedCategories.length === 0) {
      setError('Please select at least one productive category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if monitoring is running
      const monitoringStatus = await tauriApi.monitoring.getStatus();
      console.log('[StartSession] Monitoring status:', monitoringStatus);
      
      if (!monitoringStatus) {
        console.warn('[StartSession] Monitoring is not running, starting it now...');
        try {
          await tauriApi.monitoring.start();
          console.log('[StartSession] Monitoring started successfully');
          
          // Wait a moment for monitoring to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify it's actually running
          const statusAfterStart = await tauriApi.monitoring.getStatus();
          console.log('[StartSession] Monitoring status after start:', statusAfterStart);
          
          if (!statusAfterStart) {
            console.error('[StartSession] Monitoring failed to start!');
            setError('Failed to start monitoring. Please try starting it manually from Desktop Monitor page.');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('[StartSession] Failed to start monitoring:', err);
          setError('Failed to start monitoring. Please try starting it manually from Desktop Monitor page.');
          setLoading(false);
          return;
        }
      } else {
        console.log('[StartSession] Monitoring is already running');
      }

      const sessionId = crypto.randomUUID();
      const startTime = Date.now(); // milliseconds - matches Rust backend

      // Determine productive criteria based on selection mode
      let productiveCategories: string[];
      
      if (isAppBasedMode) {
        // App-based mode: use selected app names directly
        // Store them with a special prefix to distinguish from categories
        productiveCategories = selectedApps.map(app => `app:${app}`);
        console.log('[StartSession] Using app-based selection:', productiveCategories);
      } else {
        // Category-based mode: use selected categories
        productiveCategories = selectedCategories;
        console.log('[StartSession] Using category-based selection:', productiveCategories);
      }

      console.log('[StartSession] Creating session with productive criteria:', productiveCategories);

      await tauriApi.focusSessions.create(
        sessionId,
        startTime,
        productiveCategories,
        sessionGoal || undefined
      );

      const session = await tauriApi.focusSessions.getById(sessionId);
      console.log('[StartSession] Session created:', session);
      console.log('[StartSession] Session productive categories:', session?.productiveCategories);
      
      setCurrentSession(session);
      setShowStartDialog(false);
      setShowAppSelector(false);

      // Convert duration to minutes based on unit
      const durationInMinutes = durationUnit === 'hours' ? durationValue * 60 : durationValue;
      
      // Store the requested duration locally for countdown interface
      localStorage.setItem(`session_duration_${sessionId}`, durationInMinutes.toString());
      setElapsedTime(durationInMinutes * 60); // Convert to seconds for timer
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await tauriApi.focusSessions.pause();
      const updated = await tauriApi.focusSessions.getCurrent();
      setCurrentSession(updated);
    } catch (err) {
      console.error('Error pausing session:', err);
      setError('Failed to pause session');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await tauriApi.focusSessions.resume();
      const updated = await tauriApi.focusSessions.getCurrent();
      setCurrentSession(updated);
    } catch (err) {
      console.error('Error resuming session:', err);
      setError('Failed to resume session');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      const endTime = Date.now(); // milliseconds - matches Rust backend
      await tauriApi.focusSessions.complete(currentSession.id, endTime);

      // Generate session summary
      const summary = await generateSessionSummary(currentSession.id);
      setSessionSummary(summary);
      setShowSummary(true);
      setCurrentSession(null);
      setElapsedTime(0);

      // Show desktop notification
      try {
        if (window.__TAURI__) {
          const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/api/notification');
          
          let permissionGranted = await isPermissionGranted();
          if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
          }

          if (permissionGranted) {
            await sendNotification({
              title: 'Focus Session Complete! 🎉',
              body: `Great work! You completed ${formatTime(summary.totalDuration)} with ${summary.productivityScore}% productivity.`,
            });
          }
        }
      } catch (notifErr) {
        console.warn('Failed to send desktop notification:', notifErr);
      }

      // Sync completed session to cloud so analytics & team update
      try {
        const completedSession = await tauriApi.focusSessions.getById(currentSession.id);
        console.log('[StopSession] Retrieved completed session:', completedSession);
        
        if (completedSession) {
          // Convert milliseconds to seconds for activity log API
          const startTimeSeconds = Math.floor(completedSession.startTime / 1000);
          const endTimeSeconds = Math.floor((completedSession.endTime ?? endTime) / 1000);
          
          const activityLogs = await tauriApi.activityLogs.getLogs(
            startTimeSeconds,
            endTimeSeconds
          ).catch((err) => {
            console.warn('[StopSession] Failed to get activity logs:', err);
            return [];
          });

          console.log('[StopSession] Activity logs count:', activityLogs.length);

          // Use the calculated summary values, not the Rust backend values
          // The summary has the correct duration and distraction count from activity logs
          // Ensure at least 1 minute for any completed session
          const actualDurationMins = Math.max(1, Math.round(summary.totalDuration / 60));
          console.log('[StopSession] Syncing duration:', {
            totalDurationSeconds: summary.totalDuration,
            durationMinutes: actualDurationMins,
            focusTimeSeconds: summary.focusTime,
            distractionCount: summary.distractionCount,
          });

          // Build list of distraction apps (apps that were distracting)
          const distractionApps = Object.entries(summary.applicationBreakdown)
            .filter(([app]) => {
              // Check if this app was categorized as distracting
              // We'll mark it as a distraction if it's in the breakdown but not productive
              return true; // For now, include all apps in the breakdown
            })
            .map(([app, duration]) => ({
              application: app,
              duration: Math.round(duration),
              timestamp: Math.floor(Date.now() / 1000),
            }));

          const syncPayload = {
            focusSessions: [{
              id: completedSession.id,
              start_time: completedSession.startTime,
              end_time: completedSession.endTime ?? endTime,
              duration_minutes: actualDurationMins,
              distraction_count: summary.distractionCount,
              distractions: distractionApps,
              status: 'Completed',
              goal: completedSession.goal ?? null,
              paused_minutes: 0,
            }],
            activityLogs,
          };

          console.log('[StopSession] Syncing to cloud with payload:', syncPayload);

          const syncResponse = await post('/api/sync/push', syncPayload);
          console.log('[StopSession] Sync response status:', syncResponse.status);
          
          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            console.log('[StopSession] Session synced to cloud successfully:', syncResult);
          } else {
            const errorText = await syncResponse.text();
            console.error('[StopSession] Sync failed with status:', syncResponse.status, errorText);
          }
        }
      } catch (syncErr) {
        console.error('[StopSession] Session sync to cloud failed:', syncErr);
      }
    } catch (err) {
      console.error('Error stopping session:', err);
      setError('Failed to stop session');
    } finally {
      setLoading(false);
    }
  };

  const generateSessionSummary = async (sessionId: string): Promise<SessionSummary> => {
    try {
      const session = await tauriApi.focusSessions.getById(sessionId);
      if (!session || !session.endTime) {
        throw new Error('Session not found or not completed');
      }

      // Times are in milliseconds, convert to seconds for duration
      const totalDuration = Math.floor((session.endTime - session.startTime) / 1000);

      // Get activity logs for the session period
      // IMPORTANT: Tauri backend expects timestamps in SECONDS, not milliseconds
      const startTimeSeconds = Math.floor(session.startTime / 1000);
      const endTimeSeconds = Math.floor(session.endTime / 1000);
      
      console.log(`[SessionSummary] Fetching logs from ${startTimeSeconds} to ${endTimeSeconds} (seconds)`);
      console.log(`[SessionSummary] Session dates:`, {
        startDate: new Date(session.startTime).toISOString(),
        endDate: new Date(session.endTime).toISOString(),
      });
      
      const logs = await tauriApi.activityLogs.getLogs(
        startTimeSeconds,
        endTimeSeconds
      );

      console.log(`[SessionSummary] Total logs retrieved: ${logs.length}`);
      
      // DEBUG: Check if there are ANY logs in the database around this time
      if (logs.length === 0) {
        console.error('[SessionSummary] NO LOGS FOUND! Checking broader time range...');
        const oneHourBefore = startTimeSeconds - 3600;
        const oneHourAfter = endTimeSeconds + 3600;
        const broaderLogs = await tauriApi.activityLogs.getLogs(oneHourBefore, oneHourAfter);
        console.error(`[SessionSummary] Logs in ±1 hour range: ${broaderLogs.length}`);
        if (broaderLogs.length > 0) {
          console.error('[SessionSummary] Sample logs:', broaderLogs.slice(0, 3).map(l => ({
            app: l.application,
            timestamp: l.timestamp,
            date: new Date(l.timestamp * 1000).toISOString(),
            duration: l.duration,
          })));
        }
      }

      // Calculate application breakdown
      const breakdown: Record<string, number> = {};
      let focusTime = 0;
      let idleTime = 0;
      let distractionCount = 0;

      console.log(`[SessionSummary] Total logs: ${logs.length}`);
      console.log(`[SessionSummary] Session productive categories:`, session.productiveCategories);

      if (logs.length === 0) {
        console.error('[SessionSummary] NO ACTIVITY LOGS FOUND! This means monitoring did not record any activity.');
        console.error('[SessionSummary] Session time range:', {
          startTime: session.startTime,
          endTime: session.endTime,
          startTimeSeconds,
          endTimeSeconds,
          startDate: new Date(session.startTime).toISOString(),
          endDate: new Date(session.endTime).toISOString(),
        });
      }

      // Track consecutive time on non-productive apps for 60s threshold
      const nonProductiveBlocks: { app: string; duration: number }[] = [];
      
      // Check if session uses app-based selection (apps start with "app:" prefix)
      const isAppBased = session.productiveCategories.some(cat => cat.startsWith('app:'));
      const productiveAppNames = isAppBased 
        ? session.productiveCategories.map(cat => cat.replace('app:', ''))
        : [];

      console.log('[SessionSummary] Selection mode:', isAppBased ? 'APP-BASED' : 'CATEGORY-BASED');
      if (isAppBased) {
        console.log('[SessionSummary] Productive apps:', productiveAppNames);
      }
      
      for (const log of logs) {
        // Check if this is idle time
        if (log.application.toLowerCase().includes('idle') || 
            log.application.toLowerCase().includes('lock') ||
            log.application.toLowerCase().includes('screensaver')) {
          idleTime += log.duration;
          breakdown['IDLE'] = (breakdown['IDLE'] || 0) + log.duration;
          continue;
        }

        breakdown[log.application] = (breakdown[log.application] || 0) + log.duration;

        let isProductive = false;

        if (isAppBased) {
          // App-based mode: check if app name matches exactly
          isProductive = productiveAppNames.some(prodApp => 
            log.application.toLowerCase() === prodApp.toLowerCase()
          );
          console.log(`[SessionSummary] App: "${log.application}", Duration: ${log.duration}s`);
          console.log(`[SessionSummary]   Checking against productive apps:`, productiveAppNames);
          console.log(`[SessionSummary]   RESULT: ${isProductive ? 'PRODUCTIVE' : 'DISTRACTING'}`);
        } else {
          // Category-based mode: check categories and tags
          const categoryStr = await tauriApi.categories.getCategoryWithFallback(log.application);
          const logCategories = categoryStr.split(',').map(c => c.trim());

          console.log(`[SessionSummary] App: "${log.application}", Duration: ${log.duration}s`);
          console.log(`[SessionSummary]   Raw category string: "${categoryStr}"`);
          console.log(`[SessionSummary]   Parsed categories:`, logCategories);
          console.log(`[SessionSummary]   Checking against productive categories:`, session.productiveCategories);

          // Check if ANY log category matches ANY productive category
          isProductive = logCategories.some(logCat => 
            session.productiveCategories.some(prodCat => {
              const logCatClean = logCat.toLowerCase().replace('type:', '');
              const prodCatClean = prodCat.toLowerCase().replace('type:', '');
              const matches = logCatClean === prodCatClean || logCat === prodCat;
              if (matches) {
                console.log(`[SessionSummary]     MATCH: "${logCat}" matches "${prodCat}"`);
              }
              return matches;
            })
          );

          console.log(`[SessionSummary]   RESULT: ${log.application} is ${isProductive ? 'PRODUCTIVE' : 'DISTRACTING'}`);
        }

        if (isProductive) {
          focusTime += log.duration;
        } else {
          // Track non-productive app usage
          nonProductiveBlocks.push({ app: log.application, duration: log.duration });
          
          // Only count as distraction if spent 60+ seconds on this non-productive app
          if (log.duration >= 60) {
            distractionCount++;
            console.log(`[SessionSummary]   ⚠️ DISTRACTION COUNTED: ${log.application} (${log.duration}s >= 60s threshold)`);
          } else {
            console.log(`[SessionSummary]   ✓ Brief switch ignored: ${log.application} (${log.duration}s < 60s threshold)`);
          }
        }
      }
      
      console.log(`[SessionSummary] Non-productive blocks:`, nonProductiveBlocks);
      console.log(`[SessionSummary] Total distractions (60+ seconds each):`, distractionCount);

      console.log(`[SessionSummary] Final: Total=${totalDuration}s, Focus=${focusTime}s, Distractions=${distractionCount}`);

      const productivityScore = totalDuration > 0
        ? Math.min(100, Math.round((focusTime / totalDuration) * 100))
        : 0;

      // Generate productivity insights
      const insights = generateProductivityInsights(
        productivityScore,
        distractionCount,
        totalDuration,
        focusTime,
        breakdown
      );

      return {
        totalDuration,
        focusTime,
        idleTime,
        distractionCount,
        applicationBreakdown: breakdown,
        productivityScore,
        insights, // Add insights to summary
      };
    } catch (err) {
      console.error('Error generating summary:', err);
      return {
        totalDuration: 0,
        focusTime: 0,
        idleTime: 0,
        distractionCount: 0,
        applicationBreakdown: {},
        productivityScore: 0,
      };
    }
  };

  const formatTime = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Session Display */}
      {!currentSession ? (
        <div className="flex flex-col items-center justify-center p-16 max-w-2xl mx-auto rounded-3xl skeuo-panel">
          <div className="w-24 h-24 mb-8 skeuo-avatar flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
            <Play className="w-10 h-10 text-zinc-300 ml-1.5" fill="currentColor" strokeWidth={1} style={{ opacity: 0.9 }} />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 text-white tracking-tight drop-shadow-md">
            Ready to Focus?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-sm text-center font-medium leading-relaxed">
            Start a focus session with automatic distraction detection in a calm, tactile environment.
          </p>
          <button
            onClick={() => setShowStartDialog(true)}
            className="skeuo-button inline-flex items-center justify-center gap-3 px-10 py-4 text-white font-bold text-lg min-w-[260px] shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Play className="w-5 h-5 fill-current" strokeWidth={0} />
            Start Session
          </button>
        </div>
      ) : (
        <div className="skeuo-panel p-12 max-w-2xl mx-auto">
          {/* Timer Display */}
          <div className="text-center mb-10">
            <div className="text-7xl font-bold mb-6 embossed-text font-mono tabular-nums">
              {formatTime(elapsedTime)}
            </div>

            {currentSession.status === 'Paused' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-400">
                <Pause className="w-4 h-4" />
                Session Paused
              </div>
            )}

            {currentSession.goal && (
              <div className="mt-4 text-gray-400">
                Goal: {currentSession.goal}
              </div>
            )}
          </div>

          {/* Current Application */}
          {currentApp && (
            <div className="mb-8 skeuo-card p-5">
              <div className="text-sm text-zinc-400 mb-1 font-medium">Current Application:</div>
              <div className="text-xl font-bold text-white embossed-text">{currentApp}</div>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex gap-4 mt-6">
            {currentSession.status === 'Active' ? (
              <>
                <button
                  onClick={handlePauseSession}
                  disabled={loading}
                  className="skeuo-card hover:bg-zinc-800 flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
                <button
                  onClick={handleStopSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(145deg, #e83d3d, #b82e2e)' }}
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResumeSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
                <button
                  onClick={handleStopSession}
                  disabled={loading}
                  className="skeuo-button flex-1 py-4 text-white font-medium text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(145deg, #e83d3d, #b82e2e)' }}
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Productive Categories */}
          <div className="mt-8 pt-8 border-t border-zinc-800/30">
            <div className="text-sm text-zinc-400 mb-3 font-medium">Productive Categories</div>
            <div className="flex flex-wrap gap-2">
              {currentSession.productiveCategories?.map(category => (
                <span
                  key={category}
                  className="skeuo-chip bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400"
                >
                  {category}
                </span>
              )) || <span className="text-zinc-500 text-sm">No categories selected</span>}
            </div>
          </div>
        </div>
      )}

      {/* Start Session Dialog */}
      <Modal
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        title="Start Focus Session"
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Session Duration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="999"
                value={durationValue}
                onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                className="skeuo-input flex-1 px-4 py-2.5 text-sm text-white focus:outline-none"
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours')}
                className="skeuo-input px-4 py-2.5 text-sm text-white focus:outline-none bg-zinc-900 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="minutes" className="bg-zinc-900 text-white">Minutes</option>
                <option value="hours" className="bg-zinc-900 text-white">Hours</option>
              </select>
            </div>
          </div>

          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Session Goal (optional)
            </label>
            <input
              type="text"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              placeholder="What will you focus on?"
              className="skeuo-input w-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Smart Work Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What are you working on? (Smart Profile)
            </label>
            <p className="text-xs text-zinc-400 mb-3">
              Select a work profile to automatically categorize your productive applications.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
              {WORK_PROFILES.map(profile => (
                <div
                  key={profile.id}
                  onClick={() => {
                    setSelectedProfile(profile);
                    if (profile.id !== 'custom') {
                      setSelectedCategories(Array.from(new Set([...categories, ...profile.productive])));
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${selectedProfile.id === profile.id
                    ? 'bg-blue-500/10 border-blue-500/50 border shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] text-blue-400'
                    : 'skeuo-card hover:bg-white/5 border border-transparent text-zinc-400'
                    }`}
                >
                  <profile.icon className="w-7 h-7 mb-1.5 drop-shadow-md" strokeWidth={1.5} />
                  <span className={`font-medium text-xs ${selectedProfile.id === profile.id ? 'text-white' : 'text-zinc-400'}`}>
                    {profile.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Category Selection Overlay */}
            {selectedProfile.id === 'custom' && (
              <div className="space-y-3 mt-3">
                {/* Choose Apps Button */}
                <button
                  onClick={() => setShowAppSelector(true)}
                  className="w-full skeuo-button py-2.5 text-sm text-white font-medium flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Choose Apps ({selectedApps.length} selected)
                </button>

                {/* Show selected apps preview */}
                {selectedApps.length > 0 && (
                  <div className="p-3 border border-zinc-700/50 rounded-lg bg-black/20">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Selected Apps</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApps.slice(0, 5).map(app => (
                        <span key={app} className="skeuo-chip text-xs px-2 py-1 bg-blue-500/10 border-blue-500/30 text-blue-400">
                          {app}
                        </span>
                      ))}
                      {selectedApps.length > 5 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">+{selectedApps.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Saved Profiles */}
                {savedProfiles.length > 0 && (
                  <div className="p-3 border border-zinc-700/50 rounded-lg bg-black/20">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Saved Profiles</div>
                    <div className="space-y-1.5">
                      {savedProfiles.map(profile => (
                        <div key={profile.name} className="flex items-center justify-between p-2 rounded bg-zinc-900/50">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{profile.name}</div>
                            <div className="text-xs text-zinc-500">{profile.apps.length} apps</div>
                          </div>
                          <div className="flex gap-1.5 ml-2">
                            <button
                              onClick={() => loadCustomProfile(profile)}
                              className="px-2.5 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteCustomProfile(profile.name)}
                              className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback to category selection if no apps selected */}
                {selectedApps.length === 0 && (
                  <div className="space-y-2 p-3 border border-zinc-700/50 rounded-lg bg-black/20 max-h-56 overflow-y-auto">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide block mb-1">OR USE CATEGORIES</span>
                    {categories.map((category, index) => {
                      // Ensure category is a string
                      const categoryName = typeof category === 'string' ? category : String(category);
                      return (
                        <label
                          key={`${categoryName}-${index}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all skeuo-card hover:bg-white/5"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${selectedCategories.includes(categoryName)
                            ? 'bg-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                            : 'bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
                            }`}>
                            {selectedCategories.includes(categoryName) && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(categoryName)}
                            onChange={() => toggleCategory(categoryName)}
                            className="sr-only"
                          />
                          <span className={`font-medium text-xs ${selectedCategories.includes(categoryName) ? 'text-white' : 'text-zinc-400'}`}>
                            {categoryName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowStartDialog(false)}
              className="skeuo-card flex-1 py-2.5 text-sm text-white font-medium transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              disabled={loading || (selectedProfile.id === 'custom' ? selectedApps.length === 0 && selectedCategories.length === 0 : selectedCategories.length === 0)}
              className="skeuo-button flex-1 py-2.5 text-sm text-white font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      </Modal>

      {/* App Selector Modal */}
      <Modal
        isOpen={showAppSelector}
        onClose={() => setShowAppSelector(false)}
        title="Select Applications"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Search and Filter Bar */}
          <div className="sticky top-0 bg-zinc-900 pb-4 space-y-3 z-10">
            <input
              type="text"
              placeholder="Search applications..."
              className="skeuo-input w-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                if (search) {
                  const filtered = availableApps.filter(app => 
                    app.name.toLowerCase().includes(search)
                  );
                  setAvailableApps(filtered);
                } else {
                  loadRunningApplications();
                }
              }}
            />

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={selectAllApps}
                className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAllApps}
                className="px-3 py-1.5 text-xs bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={() => selectAppsByCategory('Productive')}
                className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors"
              >
                + Productive
              </button>
              <button
                onClick={() => selectAppsByCategory('Neutral')}
                className="px-3 py-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded transition-colors"
              >
                + Neutral
              </button>
              <button
                onClick={() => selectAppsByCategory('Distracting')}
                className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
              >
                + Distracting
              </button>
            </div>

            {/* Selected Count */}
            <div className="text-sm text-zinc-400">
              {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          {/* Loading State */}
          {loadingApps && (
            <div className="text-center py-8 text-zinc-400">
              Loading applications...
            </div>
          )}

          {/* App List */}
          {!loadingApps && availableApps.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              No applications found. Start using apps to see them here.
            </div>
          )}

          {!loadingApps && availableApps.length > 0 && (
            <div className="space-y-2">
              {availableApps.map((app) => (
                <label
                  key={app.name}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all skeuo-card hover:bg-white/5"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                    selectedApps.includes(app.name)
                      ? 'bg-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]'
                      : 'bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
                  }`}>
                    {selectedApps.includes(app.name) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedApps.includes(app.name)}
                    onChange={() => toggleAppSelection(app.name)}
                    className="sr-only"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${selectedApps.includes(app.name) ? 'text-white embossed-text' : 'text-zinc-400'}`}>
                      {app.name}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        app.category === 'Productive' ? 'bg-green-500/20 text-green-400' :
                        app.category === 'Distracting' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {app.category}
                      </span>
                      {app.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Save Profile Section */}
          <div className="pt-4 border-t border-zinc-800/30 space-y-3">
            <div className="text-sm font-bold text-zinc-300">Save as Profile (Optional)</div>
            <input
              type="text"
              value={customProfileName}
              onChange={(e) => setCustomProfileName(e.target.value)}
              placeholder="Profile name (e.g., 'My Web Dev Setup')"
              className="skeuo-input w-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={saveCustomProfile}
              disabled={!customProfileName.trim() || selectedApps.length === 0}
              className="w-full px-4 py-2.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Profile
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm -mx-2 px-2 pb-2">
            <button
              onClick={() => setShowAppSelector(false)}
              className="skeuo-card flex-1 py-3 text-white font-medium text-sm transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowAppSelector(false)}
              disabled={selectedApps.length === 0}
              className="skeuo-button flex-1 py-3 text-white font-medium text-sm transition-all disabled:opacity-50"
            >
              Done ({selectedApps.length} selected)
            </button>
          </div>
        </div>
      </Modal>

      {/* Session Summary Modal */}
      <Modal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        title="Session Complete!"
        className="max-h-[90vh] overflow-hidden flex flex-col"
      >
        {sessionSummary && (
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {/* Completion Icon & Score */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                {/* Productivity Score Badge */}
                <div className="absolute -bottom-2 -right-2 skeuo-badge bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1">
                  <span className="text-sm font-bold">{sessionSummary.productivityScore}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {sessionSummary.productivityScore >= 90 ? 'Outstanding!' :
                 sessionSummary.productivityScore >= 70 ? 'Great Work!' :
                 sessionSummary.productivityScore >= 50 ? 'Good Session!' :
                 'Session Complete!'}
              </h3>
              <p className="text-gray-400">
                {sessionSummary.productivityScore >= 90 ? 'You achieved peak productivity' :
                 sessionSummary.productivityScore >= 70 ? 'You maintained strong focus' :
                 sessionSummary.productivityScore >= 50 ? 'You stayed on track' :
                 'You completed your focus session'}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="skeuo-card p-5 border-l-4 border-blue-500">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Total Time</div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(sessionSummary.totalDuration || 0)}
                </div>
              </div>
              <div className="skeuo-card p-5 border-l-4 border-green-500">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Focus Time</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatTime(sessionSummary.focusTime || 0)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {sessionSummary.totalDuration > 0 
                    ? Math.round((sessionSummary.focusTime / sessionSummary.totalDuration) * 100) 
                    : 0}% of session
                </div>
              </div>
              <div className="skeuo-card p-5 border-l-4 border-orange-500">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Idle Time</div>
                <div className="text-2xl font-bold text-orange-400">
                  {formatTime(sessionSummary.idleTime || 0)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {sessionSummary.totalDuration > 0 
                    ? Math.round(((sessionSummary.idleTime || 0) / sessionSummary.totalDuration) * 100) 
                    : 0}% of session
                </div>
              </div>
              <div className="skeuo-card p-5 border-l-4 border-yellow-500">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Distractions</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {sessionSummary.distractionCount || 0}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {(sessionSummary.distractionCount || 0) === 0 ? 'Perfect!' :
                   sessionSummary.distractionCount === 1 ? 'Acceptable' :
                   sessionSummary.distractionCount <= 3 ? 'Room to improve' :
                   'Too many'}
                </div>
              </div>
              <div className="skeuo-card p-5 border-l-4 border-purple-500 col-span-2">
                <div className="text-sm text-zinc-400 mb-1 font-medium">Productivity Score</div>
                <div className="text-2xl font-bold text-blue-400">
                  {sessionSummary.productivityScore || 0}%
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {(sessionSummary.productivityScore || 0) >= 90 ? 'Excellent' :
                   sessionSummary.productivityScore >= 70 ? 'Good' :
                   sessionSummary.productivityScore >= 50 ? 'Fair' :
                   'Needs work'}
                </div>
              </div>
            </div>

            {/* Productivity Insights - Enhanced */}
            {sessionSummary.insights && sessionSummary.insights.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800/30">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Productivity Insights
                </h4>
                <div className="space-y-3">
                  {sessionSummary.insights.map((insight, i) => {
                    const IconComponent = INSIGHT_ICONS[insight.icon] || Lightbulb;
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.type === 'success'
                            ? 'bg-green-900/10 border-green-500 text-green-200'
                            : insight.type === 'warning'
                            ? 'bg-yellow-900/10 border-yellow-500 text-yellow-200'
                            : 'bg-blue-900/10 border-blue-500 text-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            insight.type === 'success' ? 'text-green-400' :
                            insight.type === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                          <p className="text-sm leading-relaxed flex-1">{insight.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Application Breakdown - Enhanced */}
            {Object.keys(sessionSummary.applicationBreakdown).length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800/30">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-400" />
                  Time Breakdown
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {Object.entries(sessionSummary.applicationBreakdown)
                    .filter(([app]) => app !== 'IDLE') // Filter out IDLE from breakdown
                    .sort(([, a], [, b]) => b - a)
                    .map(([app, duration], index) => {
                      const percent = Math.round((duration / sessionSummary.totalDuration) * 100);
                      return (
                        <div
                          key={app}
                          className="skeuo-card p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                index === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-400' :
                                index === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-400' :
                                index === 2 ? 'bg-gradient-to-br from-green-500 to-emerald-400' :
                                'bg-zinc-700'
                              }`}>
                                {index === 0 ? <Trophy className="w-4 h-4 text-white" /> : 
                                 index === 1 ? <Target className="w-4 h-4 text-white" /> : 
                                 index === 2 ? <Sparkles className="w-4 h-4 text-white" /> : 
                                 <Code2 className="w-4 h-4 text-zinc-400" />}
                              </div>
                              <span className="text-sm text-white truncate flex-1 font-medium">{app}</span>
                            </div>
                            <div className="text-right ml-3">
                              <div className="text-sm text-white font-bold whitespace-nowrap">
                                {formatTime(duration)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {percent}%
                              </div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="skeuo-progress h-2">
                            <div 
                              className="skeuo-progress-bar h-2" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm -mx-2 px-2 pb-2">
              <button
                onClick={() => setShowSummary(false)}
                className="skeuo-card flex-1 py-4 text-white font-bold transition-all hover:bg-white/5 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setShowStartDialog(true);
                }}
                className="skeuo-button flex-1 py-4 text-white font-bold inline-flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Another
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
