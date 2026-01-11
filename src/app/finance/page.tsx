'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ExpenditureManager from '@/components/ExpenditureManager';
import AdminExpenditureApproval from '@/components/AdminExpenditureApproval';
import FinancialOverview from '@/components/FinancialOverview';
import PaymentConfirmationManager from '@/components/PaymentConfirmationManager';
import AccountantFinancialReports from '@/components/AccountantFinancialReports';
import AdminFinancialReportReview from '@/components/AdminFinancialReportReview';

interface PaymentRecord {
  id: string;
  studentName: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'confirm-payments' | 'financial-overview' | 'expenditure' | 'approvals' | 'financial-reports' | 'review-reports'>('overview');

  // Handle URL parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'expenditure' && (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'accountant')) {
      setActiveTab('expenditure');
    } else if (tab === 'approvals' && user?.role === 'admin') {
      setActiveTab('approvals');
    } else if (tab === 'confirm-payments' && (user?.role === 'admin' || user?.role === 'accountant')) {
      setActiveTab('confirm-payments');
    } else if (tab === 'financial-overview' && (user?.role === 'admin' || user?.role === 'accountant')) {
      setActiveTab('financial-overview');
    }
  }, [user]);

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

  // Mock financial data
  const financialStats = {
    totalRevenue: 15750000,
    pendingPayments: 2340000,
    paidThisMonth: 4500000,
    overduePayments: 890000
  };

  const paymentRecords: PaymentRecord[] = [
    {
      id: '1',
      studentName: 'John Doe',
      amount: 150000,
      type: 'School Fees - Term 1',
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-10'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      amount: 150000,
      type: 'School Fees - Term 1',
      status: 'pending',
      dueDate: '2024-01-15'
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      amount: 75000,
      type: 'Uniform & Books',
      status: 'overdue',
      dueDate: '2024-01-10'
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      amount: 25000,
      type: 'Extra Activities',
      status: 'paid',
      dueDate: '2024-01-20',
      paidDate: '2024-01-18'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
            {(user.role === 'admin' || user.role === 'accountant') && (
              <>
                <button
                  onClick={() => setActiveTab('confirm-payments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'confirm-payments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  Confirm Payments
                </button>
                <button
                  onClick={() => setActiveTab('financial-overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'financial-overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 inline mr-1" />
                  Financial Overview
                </button>
              </>
            )}
            {(user.role === 'admin' || user.role === 'teacher' || user.role === 'accountant') && (
              <button
                onClick={() => setActiveTab('expenditure')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenditure'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCartIcon className="h-4 w-4 inline mr-1" />
                Expenditure Requests
              </button>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approvals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardDocumentListIcon className="h-4 w-4 inline mr-1" />
                Approve Expenditure
              </button>
            )}
            {user.role === 'accountant' && (
              <button
                onClick={() => setActiveTab('financial-reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial-reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Financial Reports
              </button>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('review-reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review-reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardDocumentListIcon className="h-4 w-4 inline mr-1" />
                Review Financial Reports
              </button>
            )}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Stats */}
            {(user.role === 'admin' || user.role === 'accountant') && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialStats.totalRevenue)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-8 w-8 text-yellow-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialStats.pendingPayments)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BanknotesIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Paid This Month</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialStats.paidThisMonth)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Overdue Payments</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialStats.overduePayments)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(user.role === 'admin' || user.role === 'accountant') && (
                    <>
                      <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
                        <div>
                          <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                            <CreditCardIcon className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="mt-8">
                          <h3 className="text-lg font-medium">Record Payment</h3>
                          <p className="mt-2 text-sm text-gray-500">Record new fee payments from students.</p>
                        </div>
                      </button>

                      <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-gray-400">
                        <div>
                          <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                            <DocumentTextIcon className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="mt-8">
                          <h3 className="text-lg font-medium">Generate Invoice</h3>
                          <p className="mt-2 text-sm text-gray-500">Create invoices for student fees.</p>
                        </div>
                      </button>
                    </>
                  )}

                  <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                        <BanknotesIcon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium">
                        {user.role === 'parent' ? 'Make Payment' : 'Payment History'}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {user.role === 'parent' 
                          ? 'Pay outstanding school fees online.'
                          : 'View detailed payment history.'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Records</h3>
                {(user.role === 'admin' || user.role === 'accountant') && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Add Payment
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentRecords.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.status === 'pending' && (
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Mark Paid
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Payments Tab */}
        {activeTab === 'confirm-payments' && (user.role === 'admin' || user.role === 'accountant') && (
          <PaymentConfirmationManager />
        )}

        {/* Financial Overview Tab */}
        {activeTab === 'financial-overview' && (user.role === 'admin' || user.role === 'accountant') && (
          <FinancialOverview />
        )}

        {/* Expenditure Tab */}
        {activeTab === 'expenditure' && (user.role === 'admin' || user.role === 'teacher' || user.role === 'accountant') && (
          <ExpenditureManager />
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && user.role === 'admin' && (
          <AdminExpenditureApproval />
        )}

        {/* Financial Reports Tab (Accountant) */}
        {activeTab === 'financial-reports' && user.role === 'accountant' && (
          <AccountantFinancialReports />
        )}

        {/* Review Financial Reports Tab (Admin) */}
        {activeTab === 'review-reports' && user.role === 'admin' && (
          <AdminFinancialReportReview />
        )}
      </div>
    </Layout>
  );
}