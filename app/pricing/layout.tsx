import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Choose the Forgrin plan that fits your productivity needs. Free, Pro, and Team plans available.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
