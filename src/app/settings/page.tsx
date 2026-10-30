'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Save,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { FinancialPolicy } from '@/types';

export default function SettingsPage() {
  const [policy, setPolicy] = useState<FinancialPolicy>({
    maxPerTransaction: 150,
    dailyCumulativeLimit: 500,
    autoApproveThreshold: 75,
    allowedCategories: ['Electronics', 'Office Supplies', 'Cloud Software', 'Developer Tools', 'Peripherals'],
    blockedMerchants: ['ShadyElectronicsCorp', 'UnverifiedDropshipper'],
    requireStrictSpecsMatch: true,
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newMerchant, setNewMerchant] = useState('');

  useEffect(() => {
    fetch('/api/settings/policy')
      .then((r) => r.json())
      .then((data) => {
        if (data.policy) setPolicy(data.policy);
      })
      .catch((err) => console.error('Failed to load policy:', err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (!policy.allowedCategories.includes(newCategory.trim())) {
      setPolicy({
        ...policy,
        allowedCategories: [...policy.allowedCategories, newCategory.trim()],
      });
    }
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    setPolicy({
      ...policy,
      allowedCategories: policy.allowedCategories.filter((c) => c !== cat),
    });
  };

  const addBlockedMerchant = () => {
    if (!newMerchant.trim()) return;
    if (!policy.blockedMerchants.includes(newMerchant.trim())) {
      setPolicy({
        ...policy,
        blockedMerchants: [...policy.blockedMerchants, newMerchant.trim()],
      });
    }
    setNewMerchant('');
  };

  const removeBlockedMerchant = (merchant: string) => {
    setPolicy({
      ...policy,
      blockedMerchants: policy.blockedMerchants.filter((m) => m !== merchant),
    });
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-sky-400" />
          Autonomous Financial Guardrails
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure spending ceilings, risk tolerances, and autonomous approval gates enforced by AgentWallet.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Financial guardrails updated successfully! New limits are actively enforced.</span>
        </div>
      )}

      {/* Numerical Thresholds */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Spending Limits & Thresholds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Auto-Approve Threshold ($)
            </label>
            <p className="text-[11px] text-slate-500">
              Purchases below this amount are settled autonomously without operator prompt.
            </p>
            <input
              type="number"
              value={policy.autoApproveThreshold}
              onChange={(e) =>
                setPolicy({ ...policy, autoApproveThreshold: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Max Per-Transaction ($)
            </label>
            <p className="text-[11px] text-slate-500">
              Hard limit for a single order. Anything higher is strictly blocked.
            </p>
            <input
              type="number"
              value={policy.maxPerTransaction}
              onChange={(e) =>
                setPolicy({ ...policy, maxPerTransaction: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Daily Cumulative Limit ($)
            </label>
            <p className="text-[11px] text-slate-500">
              Maximum total expenditures allowed per 24-hour calendar window.
            </p>
            <input
              type="number"
              value={policy.dailyCumulativeLimit}
              onChange={(e) =>
                setPolicy({ ...policy, dailyCumulativeLimit: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Allowed Categories */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          Whitelisted Procurement Categories
        </h3>
        <p className="text-xs text-slate-400">
          Agent will only procure items matching these approved organizational categories.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {policy.allowedCategories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="text-slate-500 hover:text-rose-400 font-bold ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Add category (e.g. Office Furniture)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* Blacklisted Merchants */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          Blacklisted Merchants & Vendors
        </h3>
        <p className="text-xs text-slate-400">
          Transactions from these merchants are instantly rejected with high-risk policy violation flag.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {policy.blockedMerchants.map((merchant) => (
            <span
              key={merchant}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950/30 border border-rose-500/30 text-rose-300"
            >
              {merchant}
              <button
                type="button"
                onClick={() => removeBlockedMerchant(merchant)}
                className="text-rose-400 hover:text-white font-bold ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Blacklist vendor (e.g. UnverifiedSeller)"
            value={newMerchant}
            onChange={(e) => setNewMerchant(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBlockedMerchant()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-rose-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addBlockedMerchant}
            className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30"
          >
            Block
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Policy Guardrails</span>
        </button>
      </div>
    </div>
  );
}
