import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Set Your Goals',
    description: 'Tell us about your productivity goals to help FocusForge tailor your experience.',
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
