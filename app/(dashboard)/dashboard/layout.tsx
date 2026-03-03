import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard', description: 'Your Forgrin productivity dashboard. Track focus sessions, tasks, and analytics.' };
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</>; }
