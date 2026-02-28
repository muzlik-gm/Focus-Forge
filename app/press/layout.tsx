import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Press',
    description: 'FocusForge press resources, media kit, and news.',
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
