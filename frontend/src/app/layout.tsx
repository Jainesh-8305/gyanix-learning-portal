import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import SpaceCanvasBackground from '@/components/ui/SpaceCanvasBackground';
import CosmicCursor from '@/components/ui/CosmicCursor';
import SWRProvider from '@/components/providers/SWRProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Gyanix-Academy — Advanced Intelligent Learning Ecosystem',
  description: 'The world’s premier AI-powered learning platform with verified industry certifications.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#05060f] relative overflow-x-hidden`} suppressHydrationWarning>
        <SWRProvider>
          <SpaceCanvasBackground />
          <CosmicCursor />
          <Navbar />
          <div className="pt-16 relative z-10">
            {children}
          </div>
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