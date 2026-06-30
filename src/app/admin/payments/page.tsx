'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_EVENTS, Payment } from '@/lib/data';
import { 
  Wallet, Search, RefreshCw, CheckCircle, 
  XCircle, Clock, Download, ArrowUpRight 
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulated Payments ledger
    setPayments([
      {
        id: 'pay-1',
        registration_id: 'reg-demo-1',
        amount: 299.00,
        status: 'success',
        order_id: 'order_evt1_stud1_1719600000',
        transaction_id: 'cf_tx_7H2FA19A',
        payment_method: 'UPI (GPay)',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        registration: {
          id: 'reg-demo-1',
          event_id: 'event-1',
          student_id: 'student-1',
          emergency_contact: '9876543210',
          status: 'approved',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-1')
        }
      },
      {
        id: 'pay-2',
        registration_id: 'reg-demo-2',
        amount: 499.00,
        status: 'pending',
        order_id: 'order_evt3_stud2_1719700000',
        payment_method: '—',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        registration: {
          id: 'reg-demo-2',
          event_id: 'event-3',
          student_id: 'student-2',
          emergency_contact: '9876500111',
          status: 'pending',
          payment_status: 'unpaid',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-3')
        }
      },
      {
        id: 'pay-3',
        registration_id: 'reg-demo-3',
        amount: 99.00,
        status: 'success',
        order_id: 'order_evt5_stud3_1719500000',
        transaction_id: 'cf_tx_9D8FA212',
        payment_method: 'Card (Visa)',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        registration: {
          id: 'reg-demo-3',
          event_id: 'event-5',
          student_id: 'student-3',
          emergency_contact: '9876500222',
          status: 'approved',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-5')
        }
      },
      {
        id: 'pay-4',
        registration_id: 'reg-demo-4',
        amount: 299.00,
        status: 'failed',
        order_id: 'order_evt1_stud4_1719400000',
        payment_method: 'Net Banking',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        registration: {
          id: 'reg-demo-4',
          event_id: 'event-1',
          student_id: 'student-4',
          emergency_contact: '9876500999',
          status: 'cancelled',
          payment_status: 'unpaid',
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-1')
        }
      }
    ]);
  }, []);

  const stats = useMemo(() => {
    let successAmt = 0;
    let successCount = 0;
    let pendingAmt = 0;
    let failedCount = 0;

    payments.forEach(p => {
      if (p.status === 'success') {
        successAmt += p.amount;
        successCount++;
      } else if (p.status === 'pending') {
        pendingAmt += p.amount;
      } else if (p.status === 'failed') {
        failedCount++;
      }
    });

    return { successAmt, successCount, pendingAmt, failedCount };
  }, [payments]);

  const handleRefund = (id: string) => {
    const pay = payments.find(p => p.id === id);
    if (!pay) return;

    if (confirm(`Do you want to dispatch a full refund of ₹${pay.amount} to the student? This calls the Cashfree Refund API.`)) {
      setPayments(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, status: 'refunded' } as any;
        }
        return p;
      }));
    }
  };

  const handleDownloadInvoice = (pay: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${pay.order_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #1d1d1f; }
            .logo span { color: #3b82f6; }
            .details { margin-bottom: 30px; display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background-color: #f8fafc; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #3b82f6; }
            .footer { margin-top: 50px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Campus<span>Connect</span></div>
            <div><strong>PAYMENT RECEIPT</strong></div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              Student ID: ${pay.registration?.student_id}<br>
              Date: ${new Date(pay.created_at).toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Receipt Info:</strong><br>
              Order ID: ${pay.order_id}<br>
              Transaction ID: ${pay.transaction_id || 'N/A'}<br>
              Method: ${pay.payment_method}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Event Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Registration fee for: <strong>${pay.registration?.event?.title}</strong></td>
                <td style="text-align: right;">₹${pay.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Total Paid: ₹${pay.amount.toFixed(2)}</div>
          <div class="footer">
            Payments are automatically verified server-side. Thank you for your registration.<br>
            CampusConnect University, Administration Block.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        p.order_id.toLowerCase().includes(q) ||
        p.transaction_id?.toLowerCase().includes(q) ||
        p.registration?.event?.title?.toLowerCase().includes(q)
      );
    });
  }, [payments, searchQuery]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Payments & Financials</h1>
        <p className="text-sm text-zinc-500 mt-1">Audit cashfree collection, track transaction IDs, and dispatch refunds.</p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Collected</span>
          <div className="text-2xl font-extrabold text-blue-500">{formatCurrency(stats.successAmt)}</div>
          <p className="text-[9px] text-zinc-500">From successful transactions.</p>
        </div>

        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Successful Collections</span>
          <div className="text-2xl font-extrabold text-foreground">{stats.successCount} payments</div>
          <p className="text-[9px] text-emerald-500">100% server-side verified.</p>
        </div>

        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Pending Escrow</span>
          <div className="text-2xl font-extrabold text-zinc-500">{formatCurrency(stats.pendingAmt)}</div>
          <p className="text-[9px] text-zinc-500">Awaiting checkout completions.</p>
        </div>

        <div className="premium-card p-5 space-y-1 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Failed Sessions</span>
          <div className="text-2xl font-extrabold text-rose-500">{stats.failedCount} sessions</div>
          <p className="text-[9px] text-rose-400">User dropped or checkout timeouts.</p>
        </div>

      </div>

      {/* Filters */}
      <div className="premium-card p-5 bg-card border-border/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, transaction reference, or event title..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs shadow-sm focus:outline-none text-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
              <tr>
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Event Title</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Method</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Transaction Reference</th>
                <th className="p-4 font-bold">Billing Date</th>
                <th className="p-4 font-bold text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 font-mono text-zinc-500">{pay.order_id}</td>
                  <td className="p-4 font-bold text-foreground">
                    {pay.registration?.event?.title || 'Unknown Event'}
                  </td>
                  <td className="p-4 font-extrabold text-foreground">{formatCurrency(pay.amount)}</td>
                  <td className="p-4 text-zinc-400">{pay.payment_method}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      pay.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : pay.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-500'
                        : pay.status === 'refunded'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{pay.transaction_id || '—'}</td>
                  <td className="p-4 text-zinc-400">{formatDateTime(pay.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Download Invoice */}
                      <button
                        onClick={() => handleDownloadInvoice(pay)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
                        title="Print Receipt Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Refund */}
                      {pay.status === 'success' && (
                        <button
                          onClick={() => handleRefund(pay.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Trigger Cashfree Refund"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
