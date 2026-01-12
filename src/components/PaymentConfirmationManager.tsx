'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPaymentsBySessionAndTerm,
  StudentPayment,
  initializeDemoPayments,
  saveStudentPayment,
  resetDemoPayments
} from '@/lib/paymentsStorage';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import {
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BanknotesIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function PaymentConfirmationManager() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2023/2024');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for adding new payment
  const [formData, setFormData] = useState({
    studentName: '',
    admissionNumber: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    transactionId: '',
    description: 'School Fees Payment',
  });

  useEffect(() => {
    loadPayments();
  }, [selectedSession, selectedTerm]);

  // Initialize demo data only once when component mounts
  useEffect(() => {
    initializeDemoPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Try API first
      const response = await fetch(`/api/payments?session=${selectedSession}&term=${selectedTerm}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        // Fallback to localStorage
        const sessionPayments = getPaymentsBySessionAndTerm(selectedSession, selectedTerm);
        setPayments(sessionPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      // Fallback to localStorage on error
      const sessionPayments = getPaymentsBySessionAndTerm(selectedSession, selectedTerm);
      setPayments(sessionPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!formData.studentName.trim() || !formData.admissionNumber.trim() || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newPayment = {
      studentId: `student-${Date.now()}`, // Generate a temporary ID
      studentName: formData.studentName,
      admissionNumber: formData.admissionNumber,
      receiptNumber: `SPA/${selectedSession.split('/')[0]}/${String(payments.length + 1).padStart(4, '0')}`,
      amount,
      paymentMethod: formData.paymentMethod,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      transactionId: formData.transactionId || `TXN${Date.now()}`,
      description: `${formData.description} - ${selectedTerm}`,
      academicSession: selectedSession,
      term: selectedTerm,
      dateIssued: new Date().toISOString(),
      confirmedBy: user!.id,
    };

    try {
      // Try API first
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPayment),
      });
      
      if (response.ok) {
        console.log('Payment saved to API successfully');
      } else {
        throw new Error('API save failed');
      }
    } catch (apiError) {
      console.log('API not available, using local storage...');
      // Fallback to localStorage
      saveStudentPayment(newPayment);
    }

    loadPayments();
    resetForm();
    setShowAddForm(false);
    alert('Payment confirmed successfully!');
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      admissionNumber: '',
      amount: '',
      paymentMethod: 'Bank Transfer',
      bankName: '',
      accountNumber: '',
      transactionId: '',
      description: 'School Fees Payment',
    });
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
        return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
      case 'cash':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!user || !['admin', 'accountant'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators and accountants can confirm payments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Confirmation</h2>
          <p className="text-gray-600">Confirm and manage student payments by session and term</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Confirm Payment
        </button>
      </div>

      {/* Session and Term Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Period</h3>
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

      {/* Add Payment Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm New Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
              <input
                type="text"
                value={formData.admissionNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, admissionNumber: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SPA/2023/001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₦) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>

            {formData.paymentMethod === 'Bank Transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., First Bank Nigeria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Account number"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transaction reference (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payment description"
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleAddPayment}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Confirm Payment
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Confirmed Payments ({selectedTerm}, {selectedSession})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Payments Found</h3>
              <p className="text-gray-500 mt-2">
                No payments have been confirmed for {selectedTerm} of {selectedSession}.
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
                      Date Confirmed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                            <div className="text-sm text-gray-500">{payment.admissionNumber}</div>
                          </div>
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
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm text-gray-900">{payment.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.dateIssued).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {payments.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Total: {payments.length} payments worth{' '}
                <span className="font-medium">
                  {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}