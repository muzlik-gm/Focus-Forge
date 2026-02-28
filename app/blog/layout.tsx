import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Tips, insights, and stories about productivity, focus, and building better work habits.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
