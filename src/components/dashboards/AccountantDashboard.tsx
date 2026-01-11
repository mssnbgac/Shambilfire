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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PaymentConfirmation from '@/components/PaymentConfirmation';

interface FinancialStats {
  totalRevenue: number;
  pendingPayments: number;
  paidToday: number;
  overduePayments: number;
  recentTransactions: any[];
  monthlyRevenue: any[];
}

export default function AccountantDashboard() {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    paidToday: 0,
    overduePayments: 0,
    recentTransactions: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Mock data for demonstration
      const mockStats: FinancialStats = {
        totalRevenue: 15750000, // ₦15,750,000
        pendingPayments: 2340000, // ₦2,340,000
        paidToday: 450000, // ₦450,000
        overduePayments: 890000, // ₦890,000
        recentTransactions: [
          { id: '1', studentName: 'John Doe', amount: 150000, type: 'School Fees', status: 'completed', date: new Date() },
          { id: '2', studentName: 'Jane Smith', amount: 75000, type: 'Uniform', status: 'completed', date: new Date() },
          { id: '3', studentName: 'Mike Johnson', amount: 200000, type: 'School Fees', status: 'pending', date: new Date() },
          { id: '4', studentName: 'Sarah Wilson', amount: 25000, type: 'Books', status: 'completed', date: new Date() },
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 2500000 },
          { month: 'Feb', revenue: 2800000 },
          { month: 'Mar', revenue: 2600000 },
          { month: 'Apr', revenue: 3200000 },
          { month: 'May', revenue: 2900000 },
          { month: 'Jun', revenue: 1750000 }, // Current month (partial)
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      name: 'Pending Payments',
      value: formatCurrency(stats.pendingPayments),
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: '-5.2%',
      changeType: 'negative'
    },
    {
      name: 'Paid Today',
      value: formatCurrency(stats.paidToday),
      icon: CheckCircleIcon,
      color: 'bg-blue-500',
      change: '+8.1%',
      changeType: 'positive'
    },
    {
      name: 'Overdue Payments',
      value: formatCurrency(stats.overduePayments),
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: '+2.3%',
      changeType: 'negative'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
        <p className="text-gray-600">Financial overview and payment management for Shambil Pride Academy.</p>
        
        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Financial Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
              Payment Confirmation
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${card.color} rounded-md p-3`}>
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-medium text-gray-900">{card.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {card.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button 
                  onClick={() => setActiveTab('payments')}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <MagnifyingGlassIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      Search & Confirm Payment
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Search students by admission number and confirm payments.
                    </p>
                  </div>
                </button>

                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-gray-400">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <DocumentTextIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <a href="/finance" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Generate Report
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create financial reports and statements.
                    </p>
                  </div>
                </button>

                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 rounded-lg border border-gray-300 hover:border-gray-400">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <a href="/finance" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Overdue Payments
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage and follow up on overdue fees.
                    </p>
                  </div>
                </button>

                <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <ChartBarIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <a href="/finance" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Financial Analytics
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      View detailed financial analytics.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions & Monthly Revenue */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            {transaction.status === 'completed' ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ClockIcon className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.studentName}</p>
                          <p className="text-xs text-gray-500">{transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                        <p className={`text-xs capitalize ${
                          transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart Placeholder */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue chart will be displayed here</p>
                    <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Summary by Category</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">School Fees</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(12500000)}</p>
                    </div>
                    <div className="text-blue-600">
                      <CurrencyDollarIcon className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Uniform & Books</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(1850000)}</p>
                    </div>
                    <div className="text-green-600">
                      <DocumentTextIcon className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Extra Activities</p>
                      <p className="text-lg font-bold text-purple-900">{formatCurrency(950000)}</p>
                    </div>
                    <div className="text-purple-600">
                      <BanknotesIcon className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Other Fees</p>
                      <p className="text-lg font-bold text-yellow-900">{formatCurrency(450000)}</p>
                    </div>
                    <div className="text-yellow-600">
                      <ChartBarIcon className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <PaymentConfirmation />
      )}
    </div>
  );
}