import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authenticating...',
    description: 'Proccessing your authentication request.',
};

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
