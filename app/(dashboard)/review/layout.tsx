import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Weekly Review', description: 'Review your weekly productivity and set goals for next week.' };
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</>; }
