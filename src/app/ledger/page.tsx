'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';
import { Order, LedgerStats } from '@/types';

export default function LedgerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<LedgerStats>({
    totalSpend: 0,
    totalOrders: 0,
    autoApprovedCount: 0,
    humanApprovedCount: 0,
    rejectedCount: 0,
    dailySpendToday: 0,
    dailyLimit: 500,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const gridRef = useRef<AgGridReact>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onExportClick = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `agentwallet_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Order ID',
        field: 'customId',
        width: 140,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: any) => (
          <span className="font-mono text-sky-400 font-semibold">{params.value}</span>
        ),
      },
      {
        headerName: 'Timestamp',
        field: 'createdAt',
        width: 170,
        sort: 'desc',
        valueFormatter: (params: any) => {
          if (!params.value) return '';
          const d = new Date(params.value);
          return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
      },
      {
        headerName: 'Item',
        field: 'item.title',
        flex: 1,
        minWidth: 200,
        cellRenderer: (params: any) => (
          <div>
            <div className="font-medium text-slate-100 truncate">{params.data?.item?.title}</div>
            <div className="text-[10px] text-slate-400">{params.data?.item?.category}</div>
          </div>
        ),
      },
      {
        headerName: 'Merchant',
        field: 'item.merchantName',
        width: 150,
        cellRenderer: (params: any) => (
          <span className="text-slate-300">{params.value}</span>
        ),
      },
      {
        headerName: 'Amount',
        field: 'amount.total',
        width: 110,
        cellRenderer: (params: any) => (
          <span className="font-mono font-bold text-emerald-400">
            ${Number(params.value || 0).toFixed(2)}
          </span>
        ),
      },
      {
        headerName: 'Guardrail Mode',
        field: 'executionMode',
        width: 160,
        cellRenderer: (params: any) => {
          const mode = params.value;
          let badge = 'bg-slate-800 text-slate-300 border-slate-700';
          if (mode === 'AUTO_APPROVED') badge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          if (mode === 'MANUAL_APPROVED') badge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
          if (mode === 'REJECTED') badge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          if (mode === 'PENDING') badge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';

          return (
            <div className="flex items-center h-full">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${badge}`}>
                {mode || 'PENDING'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'PayPal Status',
        field: 'status',
        width: 140,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isCaptured = status === 'CAPTURED';
          return (
            <div className="flex items-center h-full gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCaptured ? 'bg-emerald-400' : status === 'PENDING_APPROVAL' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="font-mono text-xs">{status}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Audit Action',
        width: 130,
        cellRenderer: (params: any) => (
          <button
            onClick={() => setSelectedOrder(params.data)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Audit Detail
          </button>
        ),
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-sky-400" />
            AG Grid Financial Ledger & Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time auditable ledger of all agent-initiated procurements, cryptographic intent hashes, and PayPal capture records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExportClick}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Autonomous Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${stats.totalSpend.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {stats.totalOrders} total transactions
          </span>
        </div>

        {/* Card 2: Auto-Approved vs Human Ratio */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Auto vs Human Approval</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {stats.autoApprovedCount} / {stats.humanApprovedCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.totalOrders > 0
              ? `${Math.round((stats.autoApprovedCount / stats.totalOrders) * 100)}% autonomous clearance`
              : 'No orders yet'}
          </span>
        </div>

        {/* Card 3: Daily Limit Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Today's Spend / Limit</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${stats.dailySpendToday.toFixed(2)}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, (stats.dailySpendToday / (stats.dailyLimit || 1)) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Daily Ceiling: ${stats.dailyLimit.toFixed(2)}
          </span>
        </div>

        {/* Card 4: Rejected Policy Blocks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Policy Interceptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">
            {stats.rejectedCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Blocked malicious or non-compliant orders
          </span>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl">
        <div className="h-[520px] w-full ag-theme-quartz-dark rounded-xl overflow-hidden">
          <AgGridReact
            ref={gridRef}
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            animateRows={true}
            rowHeight={48}
            headerHeight={44}
          />
        </div>
      </div>

      {/* Detail Audit Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-sky-400 font-semibold">
                  ORDER AUDIT RECORD: #{selectedOrder.customId}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedOrder.item.title}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Merchant:</span>
                <span className="font-semibold text-slate-200">{selectedOrder.item.merchantName}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">Total Captured:</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  ${selectedOrder.amount.total.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">PayPal Order ID:</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {selectedOrder.paypalOrderId || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 block">PayPal Capture ID:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {selectedOrder.paypalCaptureId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>SHA-256 Intent Verification Digest (Non-Repudiation):</span>
              </div>
              <div className="font-mono text-[11px] text-sky-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                {selectedOrder.intentHash}
              </div>
            </div>

            {/* Evaluation Reasoning */}
            {selectedOrder.evaluationReasoning && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium block mb-1">Agent Selection Rationale:</span>
                <p className="text-slate-300 italic">"{selectedOrder.evaluationReasoning}"</p>
              </div>
            )}

            {/* Audit Notes Trail */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-medium block">Guardrail Audit Trail & Events:</span>
              <ul className="space-y-1.5">
                {selectedOrder.guardrailNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300 font-mono text-[11px] flex items-start gap-2"
                  >
                    <span className="text-blue-400">›</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
