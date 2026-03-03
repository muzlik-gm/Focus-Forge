'use client';

/**
 * Desktop Notification Service
 *
 * Handles real push notifications for the desktop app using:
 * 1. Tauri native notifications (when available in desktop)
 * 2. Web Notifications API (fallback)
 * 3. In-app toast system (fallback for all environments)
 *
 * Used for: focus session events, distraction alerts, sync status, milestones
 */

export type NotificationType = 'focus' | 'distraction' | 'sync' | 'achievement' | 'reminder' | 'info';

export interface DesktopNotification {
    title: string;
    body: string;
    type?: NotificationType;
    icon?: string;
    silent?: boolean;
    durationMs?: number;
}

class DesktopNotificationService {
    private permission: NotificationPermission = 'default';
    private isTauri = false;
    private isInitialized = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        if (typeof window === 'undefined') return;

        this.isTauri = '__TAURI__' in window;
        this.isInitialized = true;

        // Request Web Notifications permission
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
            } catch {
                this.permission = 'denied';
            }
        } else if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    async send(notification: DesktopNotification): Promise<void> {
        if (typeof window === 'undefined') return;

        await this.initialize();

        // Try Tauri native notification first (desktop only)
        if (this.isTauri) {
            try {
                const { sendNotification, isPermissionGranted, requestPermission } = await import('@tauri-apps/api/notification');

                let granted = await isPermissionGranted();
                if (!granted) {
                    const permission = await requestPermission();
                    granted = permission === 'granted';
                }

                if (granted) {
                    sendNotification({
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon,
                    });
                    return;
                }
            } catch {
                // Tauri notification API not available, fall through
            }
        }

        // Fallback: Web Notifications API
        if ('Notification' in window && this.permission === 'granted') {
            try {
                const n = new Notification(notification.title, {
                    body: notification.body,
                    icon: notification.icon ?? '/logo.png',
                    silent: notification.silent ?? false,
                    tag: notification.type ?? 'forgrin',
                });

                // Auto-close after duration
                if (notification.durationMs) {
                    setTimeout(() => n.close(), notification.durationMs);
                }
                return;
            } catch {
                // Web notification failed, fall through to toast
            }
        }

        // Fallback: in-app toast (dispatches to a global event the toast listener can pick up)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('forgrin:notification', {
                detail: notification,
            }));
        }
    }

    /** Request push notification permission explicitly */
    async requestPermission(): Promise<boolean> {
        if (typeof window === 'undefined') return false;

        if (this.isTauri) {
            try {
                const { requestPermission } = await import('@tauri-apps/api/notification');
                const result = await requestPermission();
                return result === 'granted';
            } catch { /* fall through */ }
        }

        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            this.permission = result;
            return result === 'granted';
        }

        return false;
    }

    async getPermissionStatus(): Promise<'granted' | 'denied' | 'default'> {
        if (this.isTauri) {
            try {
                const { isPermissionGranted } = await import('@tauri-apps/api/notification');
                const granted = await isPermissionGranted();
                return granted ? 'granted' : 'default';
            } catch { /* fall through */ }
        }
        if ('Notification' in window) return Notification.permission;
        return 'default';
    }

    // ─── Convenience helpers ───────────────────────────────────────────────────

    async notifyFocusStart(durationMinutes: number): Promise<void> {
        await this.send({
            title: '🎯 Focus Session Started',
            body: `Your ${durationMinutes}-minute focus session has begun. Stay locked in!`,
            type: 'focus',
            durationMs: 6000,
        });
    }

    async notifyFocusComplete(durationMinutes: number, distractions: number): Promise<void> {
        await this.send({
            title: '✅ Focus Session Complete!',
            body: `Great work! ${durationMinutes} minutes focused with only ${distractions} distraction${distractions === 1 ? '' : 's'}.`,
            type: 'achievement',
            durationMs: 8000,
        });
    }

    async notifyDistraction(app: string): Promise<void> {
        await this.send({
            title: '⚡ Distraction Detected',
            body: `${app} may be pulling focus away. Stay on track!`,
            type: 'distraction',
            silent: false,
            durationMs: 5000,
        });
    }

    async notifyBreakTime(): Promise<void> {
        await this.send({
            title: '☕ Time for a Break',
            body: "You've been focused for a while. Take a short break before your next session.",
            type: 'reminder',
            durationMs: 8000,
        });
    }

    async notifySyncComplete(sessions: number): Promise<void> {
        await this.send({
            title: '☁️ Cloud Sync Complete',
            body: sessions > 0
                ? `${sessions} session${sessions === 1 ? '' : 's'} synced to your cloud account.`
                : 'Your data is up to date with the cloud.',
            type: 'sync',
            silent: true,
            durationMs: 4000,
        });
    }

    async notifyStreak(days: number): Promise<void> {
        await this.send({
            title: `🔥 ${days}-Day Streak!`,
            body: `You've focused for ${days} days in a row. Keep it up!`,
            type: 'achievement',
            durationMs: 8000,
        });
    }
}

export const desktopNotifications = new DesktopNotificationService();
export default desktopNotifications;
