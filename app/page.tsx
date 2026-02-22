import { Metadata } from 'next';
import { LandingContent } from './components/LandingContent';

export const metadata: Metadata = {
  metadataBase: new URL('https://focusforge.app'),
  title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
  description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques. Track your deep work, analyze patterns, and build lasting habits.',
  keywords: ['productivity', 'focus timer', 'deep work', 'task management', 'analytics', 'developer tools', 'time tracking', 'distraction logging'],
  authors: [{ name: 'FocusForge' }],
  openGraph: {
    title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    url: 'https://focusforge.app',
    siteName: 'FocusForge',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/FocusForge.png',
        width: 1200,
        height: 630,
        alt: 'FocusForge Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusForge - Master Deep Focus and Build Lasting Productivity Habits',
    description: 'FocusForge helps developers eliminate distractions, track focus sessions, and achieve peak productivity through proven deep work techniques.',
    images: ['/FocusForge.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://focusforge.app',
  },
};

export default function HomePage() {
  return <LandingContent />;
}