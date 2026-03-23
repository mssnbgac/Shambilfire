'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import PaymentConfirmation from '@/components/PaymentConfirmation';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';

interface StudentPayment {
  id: string;
  studentName: string;
  admissionNumber: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  dateIssued: string;
  description: string;
  academicSession: string;
  term: string;
}
import { useAuth } from '@/contexts/AuthContext';

interface FinancialStats {
  totalRevenue: number;
  pendingPayments: number;
  paidToday: number;
  overduePayments: number;
  recentTransactions: StudentPayment[];
}

export default function AccountantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    paidToday: 0,
    overduePayments: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);

  const today = new Date();
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    fetchFinancialData();
  }, [selectedSession, selectedTerm]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchFinancialData(), 30_000);
    return () => clearInterval(interval);
  }, [selectedSession, selectedTerm]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const [ovRes, pmRes] = await Promise.all([
        fetch(`/api/finances?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`),
        fetch(`/api/payments?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`),
      ]);

      let totalRevenue = 0;
      let payments: StudentPayment[] = [];

      if (ovRes.ok) {
        const d = await ovRes.json();
        totalRevenue = d.financialOverview?.totalRevenue ?? 0;
      }
      if (pmRes.ok) {
        const d = await pmRes.json();
        payments = d.payments || [];
      }

      const todayStr = today.toDateString();
      const paidToday = payments
        .filter(p => new Date(p.dateIssued).toDateString() === todayStr)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      setStats({
        totalRevenue,
        pendingPayments: 0,
        paidToday,
        overduePayments: 0,
        recentTransactions: payments.slice(-10).reverse(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-gray-500 text-sm">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-xl">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="h-4 w-4 text-yellow-300" />
                  <span className="text-emerald-200 text-sm">Finance Office</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}</h1>
                <p className="text-emerald-200 text-sm mt-0.5">
                  {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'overview' ? 'bg-white text-emerald-700 shadow-lg' : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'payments' ? 'bg-white text-emerald-700 shadow-lg' : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'}`}
              >
                Confirm Payments
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: CurrencyDollarIcon },
              { label: 'Paid Today', value: fmt(stats.paidToday), icon: CheckCircleIcon },
              { label: 'Pending', value: fmt(stats.pendingPayments), icon: ClockIcon },
              { label: 'Overdue', value: fmt(stats.overduePayments), icon: ExclamationTriangleIcon },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <s.icon className="h-5 w-5 text-emerald-200 mb-2" />
                <p className="text-lg font-bold text-white truncate">{s.value}</p>
                <p className="text-emerald-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'payments' ? (
        <PaymentConfirmation />
      ) : (
        <>
          {/* Period selector */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Select Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Confirm Payment', icon: MagnifyingGlassIcon, color: 'bg-emerald-50 text-emerald-600', action: () => setActiveTab('payments') },
                { label: 'Payment Records', icon: DocumentTextIcon, color: 'bg-blue-50 text-blue-600', href: '/finance?tab=confirm-payments' },
                { label: 'Generate Invoice', icon: ExclamationTriangleIcon, color: 'bg-yellow-50 text-yellow-600', href: '/finance?tab=payments' },
                { label: 'Payment History', icon: ChartBarIcon, color: 'bg-purple-50 text-purple-600', href: '/finance?tab=financial-overview' },
              ].map((a) =>
                a.href ? (
                  <a key={a.label} href={a.href} className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <a.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 text-center">{a.label}</span>
                  </a>
                ) : (
                  <button key={a.label} onClick={a.action} className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <a.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 text-center">{a.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-xs text-gray-400">{selectedTerm}, {selectedSession}</p>
              </div>
            </div>
            <div className="p-6">
              {stats.recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No transactions for this period</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.studentName}</p>
                          <p className="text-xs text-gray-400">{t.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{fmt(t.amount)}</p>
                        <button onClick={() => setSelectedPayment(t)} className="text-xs text-emerald-600 hover:text-emerald-700">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-white/70 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Student', value: selectedPayment.studentName },
                { label: 'Admission No.', value: selectedPayment.admissionNumber },
                { label: 'Receipt No.', value: selectedPayment.receiptNumber },
                { label: 'Amount', value: fmt(selectedPayment.amount) },
                { label: 'Method', value: selectedPayment.paymentMethod },
                { label: 'Date', value: new Date(selectedPayment.dateIssued).toLocaleDateString() },
                { label: 'Session', value: `${selectedPayment.term}, ${selectedPayment.academicSession}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-400">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedPayment(null)} className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
