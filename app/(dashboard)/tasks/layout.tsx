import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tasks', description: 'Manage your tasks and projects with Forgrin task management.' };
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</>; }
