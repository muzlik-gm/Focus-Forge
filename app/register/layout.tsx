import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create your free Forgrin account and start mastering deep focus today.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
