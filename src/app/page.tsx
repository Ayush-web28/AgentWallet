import Link from 'next/link';
import { Bot, Shield, FileText, ArrowRight, CheckCircle2, Zap, Lock, CreditCard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Financial Proxy Runtime</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cryptographic Guardrails for <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Autonomous Agentic Commerce
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            AgentWallet empowers AI agents to autonomously research products across merchant inventories, evaluate optimal deals with Gemini 2.5, and execute purchases through PayPal Orders API v2 under strict cryptographic policy limits and human-in-the-loop approvals.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/agent"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              Launch Agent Terminal
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/ledger"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/60 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              View Audit Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Cryptographic Intent Hashing</h3>
          <p className="text-sm text-slate-400">
            Every autonomous procurement request generates an immutable SHA-256 intent verification digest preventing parameter tampering and non-repudiation.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">PayPal Orders API v2</h3>
          <p className="text-sm text-slate-400">
            Native server-side checkout integration with token caching, real-time breakdown validation, order capture, and webhook event reconciliation.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Human-in-the-Loop Gates</h3>
          <p className="text-sm text-slate-400">
            Transactions exceeding auto-approval thresholds or risk metrics trigger an approval token requiring one-click operator confirmation within 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
