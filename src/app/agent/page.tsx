'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Lock,
  ArrowRight,
  XCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  PackageCheck,
} from 'lucide-react';
import {
  AgentRunResponse,
  AgentStep,
  Order,
  ProductComparison,
  GoalDecomposition,
} from '@/types';

const SAMPLE_PROMPTS = [
  {
    title: 'Ergonomic Mouse (< $60)',
    prompt: 'Order an ergonomic wireless mouse under $60 with fast delivery',
    badge: 'Auto-Approve (~$50)',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    title: '4K Pro Webcam (< $120)',
    prompt: 'Procure a high quality 4K streaming webcam under $120 for video conferencing',
    badge: 'Requires Sign-Off (~$115)',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    title: 'Dedicated Cloud Server (< $100)',
    prompt: 'Book a dedicated cloud server node with 16GB RAM for AI under $100',
    badge: 'Auto-Approve (~$74)',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    title: 'Blacklisted Merchant Test',
    prompt: 'Order cheap 4K camera from ShadyElectronicsCorp for $40',
    badge: 'Policy Violation Block',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
];

export default function AgentTerminalPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [approvalModalOrder, setApprovalModalOrder] = useState<Order | null>(null);
  const [approvalActionLoading, setApprovalActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Expiration countdown timer for pending approval modal
  useEffect(() => {
    if (!approvalModalOrder?.approvalExpiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((approvalModalOrder.approvalExpiresAt! - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [approvalModalOrder]);

  const handleRun = async (inputPrompt?: string) => {
    const textToRun = inputPrompt || prompt;
    if (!textToRun.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setActionMessage(null);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToRun.trim() }),
      });

      const data: AgentRunResponse = await res.json();
      setResult(data);

      if (data.order && data.order.status === 'PENDING_APPROVAL') {
        setApprovalModalOrder(data.order);
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to execute autonomous procurement run.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!approvalModalOrder) return;
    setApprovalActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/agent/orders/${approvalModalOrder.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: approvalModalOrder.approvalToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve order');
      }

      setActionMessage({
        type: 'success',
        text: `Order successfully approved! PayPal Capture Transaction: ${data.captureId}`,
      });

      // Update in result
      if (result) {
        setResult({
          ...result,
          order: data.order,
        });
      }

      setApprovalModalOrder(null);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Approval error',
      });
    } finally {
      setApprovalActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!approvalModalOrder) return;
    setApprovalActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/agent/orders/${approvalModalOrder.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Declined by human operator via Agent Command Center.' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject order');
      }

      setActionMessage({
        type: 'error',
        text: 'Order was rejected and aborted. No funds were captured.',
      });

      if (result) {
        setResult({
          ...result,
          order: data.order,
        });
      }

      setApprovalModalOrder(null);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Rejection error',
      });
    } finally {
      setApprovalActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Status Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Bot className="w-8 h-8 text-sky-400" />
              Agentic Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch procurement objectives with autonomous multi-merchant comparison, PayPal Orders v2 execution, and cryptographic intent locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Policy: &lt;$75 Auto | Max $150</span>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{actionMessage.text}</span>
        </div>
      )}

      {/* Sample Goal Quick Dispatch Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Pre-Configured Procurement Scenarios
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(sample.prompt);
                handleRun(sample.prompt);
              }}
              disabled={loading}
              className="group text-left p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {sample.title}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sample.badgeColor}`}>
                  {sample.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {sample.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Prompt Dispatch Console */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl focus-within:border-blue-500/50 transition-all">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRun();
                }
              }}
              placeholder="e.g. Order an ergonomic wireless mouse under $60 with fast delivery..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none font-sans"
            />
          </div>
          <button
            onClick={() => handleRun()}
            disabled={loading || !prompt.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 sm:self-center h-12"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Execution Visualizer: Step-by-Step Card Stream */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              Live Execution Trace
              <span className="text-xs font-mono text-slate-500">({result.runId})</span>
            </h2>

            {result.order && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold font-mono border ${
                  result.order.status === 'CAPTURED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : result.order.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                STATUS: {result.order.status}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {result.steps.map((step, index) => (
              <div
                key={step.id}
                className="relative p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md transition-all hover:border-slate-700"
              >
                {/* Step Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                        step.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : step.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : step.status === 'error'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{step.title}</h3>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                        {step.phase}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Step Thought */}
                {step.thought && (
                  <p className="text-xs text-slate-300 mt-2 pl-10 border-l-2 border-slate-800 italic">
                    "{step.thought}"
                  </p>
                )}

                {/* Specific Phase Rich Visualizations */}
                {step.phase === 'DECOMPOSITION' && step.data && (
                  <div className="mt-3 ml-10 p-3 rounded-lg bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Target Item:</span>
                      <span className="font-semibold text-slate-200">{step.data.itemName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Max Budget:</span>
                      <span className="font-semibold text-emerald-400">${step.data.maxBudget}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Category:</span>
                      <span className="font-semibold text-slate-200">{step.data.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Urgency:</span>
                      <span className="font-semibold uppercase text-sky-400">{step.data.urgency}</span>
                    </div>
                  </div>
                )}

                {step.phase === 'EVALUATION' && step.data && (
                  <div className="mt-3 ml-10 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(step.data as ProductComparison).candidates?.map((candidate) => {
                        const isWinner = candidate.itemId === (step.data as ProductComparison).selectedItem.id;
                        return (
                          <div
                            key={candidate.itemId}
                            className={`p-3 rounded-lg border text-xs transition-all ${
                              isWinner
                                ? 'bg-blue-950/30 border-blue-500/50 shadow-sm'
                                : 'bg-slate-950/40 border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-slate-200 truncate pr-2">
                                {candidate.title}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isWinner
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {candidate.score}/100
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] mb-2">
                              Merchant: <span className="text-slate-300 font-medium">{candidate.merchantName}</span> • Total:{' '}
                              <span className="text-emerald-400 font-semibold">${candidate.totalPrice.toFixed(2)}</span>
                            </div>
                            <ul className="space-y-1 text-[11px] text-slate-400">
                              {candidate.pros.slice(0, 2).map((pro, pIdx) => (
                                <li key={pIdx} className="flex items-center gap-1 text-slate-300">
                                  <span className="text-emerald-400 font-bold">✓</span> {pro}
                                </li>
                              ))}
                            </ul>
                            {isWinner && (
                              <div className="mt-2 pt-2 border-t border-blue-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Selected Optimal Deal
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step.phase === 'GUARDRAIL' && step.data && (
                  <div className="mt-3 ml-10 p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Composite Risk Score:</span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            step.data.riskScore < 30
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : step.data.riskScore < 60
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {step.data.riskScore} / 100
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <Lock className="w-3 h-3 text-sky-400" />
                        <span>SHA-256 Intent Digest:</span>
                        <span className="text-sky-300 font-semibold">{step.data.intentHash?.slice(0, 18)}...</span>
                      </div>
                    </div>
                  </div>
                )}

                {step.phase === 'ORDER_CREATION' && (
                  <div className="mt-3 ml-10 p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-400" />
                      <span className="text-slate-300 font-medium">PayPal Orders API v2:</span>
                      <span className="font-mono text-sky-400 font-bold">
                        {result.order?.paypalOrderId || 'Pending'}
                      </span>
                    </div>

                    {result.order?.paypalCaptureId && (
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300">Capture ID:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {result.order.paypalCaptureId}
                        </span>
                      </div>
                    )}

                    {result.order?.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => setApprovalModalOrder(result.order!)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Open Approval Gate
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Human-in-the-Loop Approval Modal */}
      {approvalModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Human Authorization Required</h3>
                  <p className="text-xs text-slate-400">
                    Order exceeds auto-approval limits. Review transaction parameters and sign off.
                  </p>
                </div>
              </div>

              {/* 15-minute countdown pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/30 text-amber-400 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {Math.floor(remainingSeconds / 60)}:
                  {String(remainingSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Deal Breakdown Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                    Target Item
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{approvalModalOrder.item.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Merchant: <span className="text-slate-200">{approvalModalOrder.item.merchantName}</span> • Rating: {approvalModalOrder.item.rating}★
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                    Total Charge
                  </span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    ${approvalModalOrder.amount.total.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    (Item: ${approvalModalOrder.amount.itemTotal} + Shipping: ${approvalModalOrder.amount.shipping})
                  </span>
                </div>
              </div>

              {/* Risk Score & Audit Notes */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {approvalModalOrder.riskScore}/100 (Human Sign-Off Triggered)
                  </span>
                </div>
                <div className="font-mono text-slate-500 text-[10px]">
                  Order Ref: #{approvalModalOrder.id}
                </div>
              </div>

              {/* Intent Hash */}
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <Lock className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <span className="truncate">Intent Hash: {approvalModalOrder.intentHash}</span>
              </div>
            </div>

            {/* Direct PayPal Sandbox Checkout Option */}
            {approvalModalOrder.paypalOrderId && (
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">PayPal Sandbox Order Staged:</span>
                  <span className="font-mono text-sky-300 font-bold">{approvalModalOrder.paypalOrderId}</span>
                </div>
                <a
                  href={`https://www.sandbox.paypal.com/checkoutnow?token=${approvalModalOrder.paypalOrderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Direct Sandbox Checkout
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleRejectOrder}
                disabled={approvalActionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 font-semibold text-xs border border-slate-700 hover:border-rose-500/40 transition-all disabled:opacity-50"
              >
                Reject & Cancel
              </button>
              <button
                onClick={handleApproveOrder}
                disabled={approvalActionLoading || remainingSeconds <= 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition-all active:scale-95"
              >
                {approvalActionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Capturing PayPal Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Capture via PayPal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
