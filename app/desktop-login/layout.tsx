import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Desktop Sign In',
    description: 'Sign in to the FocusForge desktop app.',
};

export default function DesktopLoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
