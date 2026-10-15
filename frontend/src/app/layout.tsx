import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import AuthBoundary from '@/components/providers/AuthBoundary';
import AssistantLauncher from '@/components/assistant/AssistantLauncher';
import SpaceAtmosphere from '@/components/ui/SpaceAtmosphere';
import SWRProvider from '@/components/providers/SWRProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Gyanix-Academy — Advanced Intelligent Learning Ecosystem',
  description:
    'A college learning portal for courses, assessments, notes and study practice. Course completion certificates are issued by this project.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#05060f] relative overflow-x-hidden`}
        suppressHydrationWarning
      >
        <SWRProvider>
          <SpaceAtmosphere />
          <Navbar />
          <div className="pt-16 relative z-10">
            <AuthBoundary>{children}</AuthBoundary>
          </div>
          <AssistantLauncher />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0c0f24',
                color: '#fff',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              },
            }}
          />
        </SWRProvider>
      </body>
    </html>
  );
}
