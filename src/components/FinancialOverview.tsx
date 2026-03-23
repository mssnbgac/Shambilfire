'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface FinancialOverviewData {
  totalIncome: number;
  totalRevenue: number;
  totalExpenditure: number;
  availableFunds: number;
  totalPayments: number;
  totalExpenditures: number;
  approvedExpenditures: number;
  pendingExpenditures: number;
  paymentMethods: Record<string, number>;
  expenditureCategories: Record<string, number>;
}

interface Payment {
  id: string;
  studentName: string;
  admissionNumber: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  dateIssued: string;
  description: string;
}

const EMPTY_OVERVIEW: FinancialOverviewData = {
  totalIncome: 0, totalRevenue: 0, totalExpenditure: 0, availableFunds: 0,
  totalPayments: 0, totalExpenditures: 0, approvedExpenditures: 0, pendingExpenditures: 0,
  paymentMethods: {}, expenditureCategories: {},
};

export default function FinancialOverview() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [overview, setOverview] = useState<FinancialOverviewData>(EMPTY_OVERVIEW);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ovRes, pmRes] = await Promise.all([
        fetch(`/api/finances?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`),
        fetch(`/api/payments?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`),
      ]);

      if (ovRes.ok) {
        const d = await ovRes.json();
        setOverview({ ...EMPTY_OVERVIEW, ...d.financialOverview });
      }
      if (pmRes.ok) {
        const d = await pmRes.json();
        setPayments(d.payments || []);
      }
    } catch (err) {
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSession, selectedTerm]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const methodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank transfer': return <BanknotesIcon className="h-5 w-5" />;
      case 'cash': return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'debit card': case 'credit card': case 'card': return <CreditCardIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  if (!user || !['admin', 'accountant'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators and accountants can access financial overviews.</p>
      </div>
    );
  }

  const netBalance = overview.totalRevenue - overview.totalExpenditure;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600">Real-time financial data by academic session and term</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Session</label>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term</label>
            <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Total Revenue', value: fmt(overview.totalRevenue), icon: CurrencyDollarIcon, color: 'text-green-400' },
              { label: 'Approved Expenditures', value: fmt(overview.totalExpenditure), icon: DocumentTextIcon, color: 'text-red-400' },
              { label: 'Net Balance', value: fmt(netBalance), icon: CheckCircleIcon, color: netBalance >= 0 ? 'text-blue-400' : 'text-red-500', valueColor: netBalance >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Total Payments', value: String(overview.totalPayments), icon: UserGroupIcon, color: 'text-purple-400' },
              { label: 'Pending Requests', value: String(overview.pendingExpenditures), icon: ArrowTrendingUpIcon, color: 'text-indigo-400' },
            ].map(card => (
              <div key={card.label} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <card.icon className={`h-8 w-8 flex-shrink-0 ${card.color}`} />
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
                      <dd className={`text-lg font-medium ${(card as any).valueColor || 'text-gray-900'}`}>{card.value}</dd>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdowns */}
          {(Object.keys(overview.paymentMethods).length > 0 || Object.keys(overview.expenditureCategories).length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.keys(overview.paymentMethods).length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {Object.entries(overview.paymentMethods).map(([method, amount]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-400">
                          {methodIcon(method)}
                          <span className="text-sm font-medium text-gray-900">{method}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{fmt(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {overview.totalRevenue > 0 ? ((amount / overview.totalRevenue) * 100).toFixed(1) : '0'}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(overview.expenditureCategories).length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expenditure Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(overview.expenditureCategories).map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-gray-400">
                          <DocumentTextIcon className="h-5 w-5" />
                          <span className="text-sm font-medium text-gray-900 capitalize">{cat}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{fmt(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {overview.totalRevenue > 0 ? ((amount / overview.totalRevenue) * 100).toFixed(1) : '0'}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmed Payments — {selectedTerm}, {selectedSession}
                <span className="ml-2 text-sm font-normal text-gray-500">({payments.length} records)</span>
              </h3>
            </div>
            <div className="p-6">
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payments recorded for this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Student', 'Receipt No.', 'Amount', 'Method', 'Date', 'Description'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{p.studentName}</div>
                            <div className="text-sm text-gray-500">{p.admissionNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.receiptNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{fmt(p.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-gray-400">
                              {methodIcon(p.paymentMethod)}
                              <span className="text-sm text-gray-900">{p.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(p.dateIssued).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-gray-700 font-medium">
                    Total: {payments.length} payments — {fmt(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
            <ChartBarIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <strong>{selectedTerm}, {selectedSession}</strong> — {overview.totalPayments} payments totalling{' '}
              <strong>{fmt(overview.totalRevenue)}</strong>. Approved expenditures:{' '}
              <strong>{fmt(overview.totalExpenditure)}</strong>. Net balance:{' '}
              <strong className={netBalance >= 0 ? 'text-green-700' : 'text-red-700'}>{fmt(netBalance)}</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
