import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import RoleSimulator from '@/components/RoleSimulator';
import BottomNavMobile from '@/components/BottomNavMobile';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'CampusConnect | College Event Management Platform',
  description: 'Manage, discover, and check-in to college hackathons, concerts, workshops, and sports meets with instant digital ticketing and secure payouts.',
  keywords: ['college events', 'hackathons', 'ticketing', 'campus events', 'event registration', 'attendance scanner'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth select-none">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans min-h-full flex flex-col antialiased pb-16 md:pb-0`}>
        <ThemeProvider>
          <AuthProvider>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <BottomNavMobile />
            <RoleSimulator />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
