'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ShieldCheck, Terminal, DollarSign, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/agent', label: 'Agent Terminal', icon: Terminal },
    { href: '/ledger', label: 'Audit Ledger', icon: DollarSign },
    { href: '/settings', label: 'Guardrail Settings', icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[2px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  AgentWallet
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded">
                  Autonomous Runtime
                </span>
              </div>
            </Link>

            <div className="hidden md:flex ml-8 space-x-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PayPal Orders v2: Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
