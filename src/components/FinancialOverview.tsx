'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFinancialOverview, 
  getSessionsWithPayments, 
  getTermsWithPayments,
  getPaymentsBySessionAndTerm,
  StudentPayment,
  initializeDemoPayments,
  resetDemoPayments,
  debugPayments,
  forceRefreshDemoData
} from '@/lib/paymentsStorage';
import { expenditureStorage } from '@/lib/expenditureStorage';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface FinancialData {
  totalRevenue: number;
  totalPayments: number;
  paymentMethods: Record<string, number>;
  feeTypes: Record<string, number>;
  recentPayments: StudentPayment[];
  averagePayment: number;
}

export default function FinancialOverview() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2023/2024');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [expenditures, setExpenditures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, [selectedSession, selectedTerm]);

  // Initialize demo data only once when component mounts
  useEffect(() => {
    initializeDemoPayments();
  }, []);

  const loadFinancialData = () => {
    setLoading(true);
    try {
      const overview = getFinancialOverview(selectedSession, selectedTerm);
      const sessionPayments = getPaymentsBySessionAndTerm(selectedSession, selectedTerm);
      const sessionExpenditures = expenditureStorage.getRequestsBySessionAndTerm(selectedSession, selectedTerm);
      
      setFinancialData(overview);
      setPayments(sessionPayments);
      setExpenditures(sessionExpenditures);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugPayments = () => {
    const result = debugPayments();
    const sessionCount = Object.keys(result.sessionSummary || {}).length;
    alert(`Found ${result.payments.length} payments across ${sessionCount} academic sessions. Check browser console for detailed breakdown.`);
  };

  const handleForceRefresh = () => {
    const result = forceRefreshDemoData();
    const sessionCount = Object.keys(result.sessionSummary || {}).length;
    alert(`Demo data refreshed! Generated ${result.payments.length} payments across ${sessionCount} sessions and all terms. Page will reload to show updated data.`);
    window.location.reload();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank transfer':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'cash':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'card':
      case 'debit card':
      case 'credit card':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
        <p className="text-gray-600">View detailed financial data by academic session and term</p>
      </div>

      {/* Session and Term Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select Period</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDebugPayments}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Debug Payments
            </button>
            <button
              onClick={handleForceRefresh}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh Demo Data
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {ACADEMIC_SESSIONS.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {TERMS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
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
          {/* Financial Statistics */}
          {financialData && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialData.totalRevenue)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-red-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Approved Expenditures</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(expenditures.filter(e => e.status === 'approved' || e.status === 'completed').reduce((sum, e) => sum + e.amount, 0))}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Net Available Funds</dt>
                          <dd className={`text-lg font-medium ${
                            (financialData.totalRevenue - expenditures.filter(e => e.status === 'approved' || e.status === 'completed').reduce((sum, e) => sum + e.amount, 0)) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(financialData.totalRevenue - expenditures.filter(e => e.status === 'approved' || e.status === 'completed').reduce((sum, e) => sum + e.amount, 0))}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserGroupIcon className="h-8 w-8 text-purple-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                          <dd className="text-lg font-medium text-gray-900">{financialData.totalPayments}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                          <dd className="text-lg font-medium text-gray-900">{expenditures.filter(e => e.status === 'pending').length}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Methods Breakdown */}
          {financialData && Object.keys(financialData.paymentMethods).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {Object.entries(financialData.paymentMethods).map(([method, amount]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-400">
                            {getPaymentMethodIcon(method)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{method}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {((amount / financialData.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Fee Types</h3>
                  <div className="space-y-3">
                    {Object.entries(financialData.feeTypes).map(([feeType, amount]) => (
                      <div key={feeType} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-400">
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{feeType}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</div>
                          <div className="text-xs text-gray-500">
                            {((amount / financialData.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Payments ({selectedTerm}, {selectedSession})
              </h3>
              
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Payments Found</h3>
                  <p className="text-gray-500 mt-2">
                    No payments have been recorded for {selectedTerm} of {selectedSession}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-500">{payment.admissionNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.receiptNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="text-gray-400">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                              </div>
                              <span className="text-sm text-gray-900">{payment.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.dateIssued).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Financial Summary</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Showing financial data for <strong>{selectedTerm}</strong> of academic session <strong>{selectedSession}</strong>.
                    {financialData && (
                      <span> Total of {financialData.totalPayments} payments worth {formatCurrency(financialData.totalRevenue)} have been confirmed.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}