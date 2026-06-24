import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Synepic Pay',
  description: 'Pay Synepic for your Sales & Profit Dashboard Setup',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}