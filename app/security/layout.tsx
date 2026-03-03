import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security',
    description: 'Learn about Forgrin security practices and how we keep your data safe.',
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
