import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community',
    description: 'Join the FocusForge community. Connect with other productivity enthusiasts.',
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
