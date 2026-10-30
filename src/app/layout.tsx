import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AgentWallet — Autonomous Agentic Commerce Runtime',
  description:
    'Secure financial proxy and multi-agent reasoning loop empowering AI agents to autonomously procure items using PayPal Orders API v2 and cryptographic guardrails.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased flex flex-col selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
          AgentWallet © 2026 • Autonomous Agentic Commerce & PayPal Orders v2 Sandbox Runtime
        </footer>
      </body>
    </html>
  );
}
