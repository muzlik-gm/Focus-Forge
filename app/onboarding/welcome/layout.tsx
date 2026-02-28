import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Welcome',
    description: 'Welcome to FocusForge. Your journey to deep work starts here.',
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
