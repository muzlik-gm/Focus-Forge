import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Feature Tour',
    description: 'A quick tour of the key Forgrin features to get you started.',
};

export default function TourLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
