import { Metadata } from 'next';
import { LandingContent } from './components/LandingContent';

export const metadata: Metadata = {
  metadataBase: new URL('https://forgrin.app'),
  title: 'Master Deep Focus & Productivity',
  description: 'Forgrin helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
  keywords: ['productivity', 'focus timer', 'deep work', 'task management', 'analytics', 'developer tools', 'time tracking', 'distraction logging'],
  authors: [{ name: 'Forgrin' }],
  openGraph: {
    title: 'Forgrin - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'Forgrin helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    url: 'https://forgrin.app',
    siteName: 'Forgrin',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/Forgrin.png',
        width: 1200,
        height: 630,
        alt: 'Forgrin Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgrin - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'Forgrin helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    images: ['/Forgrin.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://forgrin.app',
  },
};

export default function HomePage() {
  return <LandingContent />;
}