import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Tasks', description: 'Manage your tasks and projects with FocusForge task management.' };
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</>; }
