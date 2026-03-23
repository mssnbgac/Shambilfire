'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import ExpenditureManager from '@/components/ExpenditureManager';
import AdminExpenditureApproval from '@/components/AdminExpenditureApproval';
import FinancialOverview from '@/components/FinancialOverview';
import PaymentConfirmationManager from '@/components/PaymentConfirmationManager';
import AccountantFinancialReports from '@/components/AccountantFinancialReports';
import AdminFinancialReportReview from '@/components/AdminFinancialReportReview';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';

type Tab = 'overview' | 'confirm-payments' | 'financial-overview' | 'expenditure' | 'approvals' | 'financial-reports' | 'review-reports';

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Overview tab state
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') as Tab | null;
    if (tab === 'expenditure') setActiveTab('expenditure');
    else if (tab === 'approvals' && user?.role === 'admin') setActiveTab('approvals');
    else if (tab === 'confirm-payments') setActiveTab('confirm-payments');
    else if (tab === 'financial-overview') setActiveTab('financial-overview');
  }, [user]);

  const loadOverview = useCallback(async () => {
    if (!user || !['admin', 'accountant'].includes(user.role)) return;
    setOverviewLoading(true);
    try {
      const res = await fetch(
        `/api/finances?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`
      );
      if (res.ok) {
        const d = await res.json();
        setOverviewData(d.financialOverview);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOverviewLoading(false);
    }
  }, [user, selectedSession, selectedTerm]);

  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
  }, [activeTab, loadOverview]);

  if (!user || !['admin', 'accountant', 'parent', 'teacher'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access financial information.</p>
        </div>
      </Layout>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const tabClass = (tab: Tab) =>
    `py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
      activeTab === tab
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">
            {user.role === 'parent'
              ? 'View your payment history and outstanding fees.'
              : 'Manage school finances, fees, and payment tracking.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-6 min-w-max">
            <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>
              Overview
            </button>
            {(user.role === 'admin' || user.role === 'accountant') && (
              <>
                <button onClick={() => setActiveTab('confirm-payments')} className={tabClass('confirm-payments')}>
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  Confirm Payments
                </button>
                <button onClick={() => setActiveTab('financial-overview')} className={tabClass('financial-overview')}>
                  <ChartBarIcon className="h-4 w-4 inline mr-1" />
                  Financial Overview
                </button>
              </>
            )}
            {(user.role === 'admin' || user.role === 'teacher' || user.role === 'accountant') && (
              <button onClick={() => setActiveTab('expenditure')} className={tabClass('expenditure')}>
                <ShoppingCartIcon className="h-4 w-4 inline mr-1" />
                Expenditure Requests
              </button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => setActiveTab('approvals')} className={tabClass('approvals')}>
                <ClipboardDocumentListIcon className="h-4 w-4 inline mr-1" />
                Approve Expenditure
              </button>
            )}
            {user.role === 'accountant' && (
              <button onClick={() => setActiveTab('financial-reports')} className={tabClass('financial-reports')}>
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Financial Reports
              </button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => setActiveTab('review-reports')} className={tabClass('review-reports')}>
                <ClipboardDocumentListIcon className="h-4 w-4 inline mr-1" />
                Review Financial Reports
              </button>
            )}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {(user.role === 'admin' || user.role === 'accountant') && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Select Period</h3>
                    <button onClick={loadOverview} disabled={overviewLoading}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm">
                      <ArrowPathIcon className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
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

                {overviewLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : overviewData ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Total Revenue', value: fmt(overviewData.totalRevenue ?? 0), icon: CurrencyDollarIcon, color: 'text-green-400', vc: '' },
                      { label: 'Approved Expenditures', value: fmt(overviewData.totalExpenditure ?? 0), icon: DocumentTextIcon, color: 'text-red-400', vc: '' },
                      {
                        label: 'Net Balance',
                        value: fmt((overviewData.totalRevenue ?? 0) - (overviewData.totalExpenditure ?? 0)),
                        icon: BanknotesIcon,
                        color: 'text-blue-400',
                        vc: ((overviewData.totalRevenue ?? 0) - (overviewData.totalExpenditure ?? 0)) >= 0 ? 'text-green-600' : 'text-red-600',
                      },
                      { label: 'Total Payments', value: String(overviewData.totalPayments ?? 0), icon: CheckCircleIcon, color: 'text-purple-400', vc: '' },
                    ].map(card => (
                      <div key={card.label} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5 flex items-center">
                          <card.icon className={`h-8 w-8 flex-shrink-0 ${card.color}`} />
                          <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
                            <dd className={`text-lg font-medium ${card.vc || 'text-gray-900'}`}>{card.value}</dd>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg p-8 text-center">
                    <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a period and click Refresh to load financial data.</p>
                  </div>
                )}
              </>
            )}

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(user.role === 'admin' || user.role === 'accountant') && (
                  <>
                    <button onClick={() => setActiveTab('confirm-payments')}
                      className="bg-white p-6 rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-md transition-all text-left">
                      <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700">
                        <CheckCircleIcon className="h-6 w-6" />
                      </span>
                      <div className="mt-4">
                        <h3 className="text-base font-medium text-gray-900">Confirm Payment</h3>
                        <p className="mt-1 text-sm text-gray-500">Record new fee payments from students.</p>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('financial-overview')}
                      className="bg-white p-6 rounded-lg border border-gray-300 hover:border-green-400 hover:shadow-md transition-all text-left">
                      <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700">
                        <ChartBarIcon className="h-6 w-6" />
                      </span>
                      <div className="mt-4">
                        <h3 className="text-base font-medium text-gray-900">Financial Overview</h3>
                        <p className="mt-1 text-sm text-gray-500">View detailed financial reports and balances.</p>
                      </div>
                    </button>
                    <button onClick={() => setActiveTab('expenditure')}
                      className="bg-white p-6 rounded-lg border border-gray-300 hover:border-purple-400 hover:shadow-md transition-all text-left">
                      <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700">
                        <ShoppingCartIcon className="h-6 w-6" />
                      </span>
                      <div className="mt-4">
                        <h3 className="text-base font-medium text-gray-900">Expenditure Requests</h3>
                        <p className="mt-1 text-sm text-gray-500">Create and track expenditure requests.</p>
                      </div>
                    </button>
                  </>
                )}
                {user.role === 'parent' && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700">
                      <BanknotesIcon className="h-6 w-6" />
                    </span>
                    <div className="mt-4">
                      <h3 className="text-base font-medium text-gray-900">Payment History</h3>
                      <p className="mt-1 text-sm text-gray-500">Contact the school office to view payment records.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'confirm-payments' && (user.role === 'admin' || user.role === 'accountant') && <PaymentConfirmationManager />}
        {activeTab === 'financial-overview' && (user.role === 'admin' || user.role === 'accountant') && <FinancialOverview />}
        {activeTab === 'expenditure' && (user.role === 'admin' || user.role === 'teacher' || user.role === 'accountant') && <ExpenditureManager />}
        {activeTab === 'approvals' && user.role === 'admin' && <AdminExpenditureApproval />}
        {activeTab === 'financial-reports' && user.role === 'accountant' && <AccountantFinancialReports />}
        {activeTab === 'review-reports' && user.role === 'admin' && <AdminFinancialReportReview />}
      </div>
    </Layout>
  );
}
