'use client';

import React, { useState, useEffect } from 'react';
import { Settlement } from '@/lib/data';
import { ArrowLeftRight, CheckCircle, Info, Landmark, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    // Simulated settlements ledger from Cashfree API
    setSettlements([
      {
        id: 'set-1',
        total_collected: 45000.00,
        settled_amount: 45000.00,
        pending_amount: 0.00,
        status: 'settled',
        settlement_date: '2026-06-28',
        reference_id: 'SET_REF_892182A1',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'set-2',
        total_collected: 38000.00,
        settled_amount: 38000.00,
        pending_amount: 0.00,
        status: 'settled',
        settlement_date: '2026-06-29',
        reference_id: 'SET_REF_902910H9',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'set-3',
        total_collected: 18000.00,
        settled_amount: 0.00,
        pending_amount: 18000.00,
        status: 'pending',
        settlement_date: '2026-07-01', // Next settlement cycle
        reference_id: 'SET_REF_PENDING1',
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  const aggregates = React.useMemo(() => {
    let collected = 120950.00;
    let settled = 83000.00;
    let pending = 37950.00;
    return { collected, settled, pending };
  }, []);

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settlements Ledger</h1>
        <p className="text-sm text-zinc-500 mt-1">Audit automatically dispatched merchant payouts from Cashfree to linked accounts.</p>
      </div>

      {/* Prominent Automated payout disclaimer banner */}
      <div className="p-4 rounded-24 bg-blue-500/10 border border-blue-500/20 flex gap-3 text-left text-xs text-blue-600 dark:text-blue-400 leading-normal">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Automated Settlements Active:</strong>
          <p className="mt-0.5">
            Payments are automatically settled by Cashfree to the merchant's linked bank account. No manual withdrawal is required.
          </p>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Funds Collected</span>
          <div className="text-2xl font-extrabold text-foreground">{formatCurrency(aggregates.collected)}</div>
          <p className="text-[9px] text-zinc-500">Gross receipts collected.</p>
        </div>

        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Transferred (Settled)</span>
          <div className="text-2xl font-extrabold text-emerald-500 flex items-center gap-1.5">
            <Landmark className="w-5 h-5" />
            <span>{formatCurrency(aggregates.settled)}</span>
          </div>
          <p className="text-[9px] text-emerald-500">Credited to linked bank account.</p>
        </div>

        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Pending Settlement</span>
          <div className="text-2xl font-extrabold text-zinc-500">{formatCurrency(aggregates.pending)}</div>
          <p className="text-[9px] text-zinc-500">Dispatched in the next bank cycle.</p>
        </div>

      </div>

      {/* Settlements Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
              <tr>
                <th className="p-4 font-bold">Settlement Reference ID</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Total Collected</th>
                <th className="p-4 font-bold">Settled Amount</th>
                <th className="p-4 font-bold">Pending Amount</th>
                <th className="p-4 font-bold">Payout Target Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {settlements.map((set) => (
                <tr key={set.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 font-mono font-extrabold text-foreground">{set.reference_id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      set.status === 'settled'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {set.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-foreground">{formatCurrency(set.total_collected)}</td>
                  <td className="p-4 text-emerald-500 font-semibold">{formatCurrency(set.settled_amount)}</td>
                  <td className="p-4 text-zinc-500">{formatCurrency(set.pending_amount)}</td>
                  <td className="p-4 text-zinc-400">{set.settlement_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
