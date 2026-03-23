'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  transactionId: string;
  description: string;
  academicSession: string;
  term: string;
  dateIssued: string;
  confirmedBy: string;
}

const EMPTY_FORM = {
  studentName: '',
  admissionNumber: '',
  amount: '',
  paymentMethod: 'Bank Transfer',
  bankName: '',
  accountNumber: '',
  transactionId: '',
  description: 'School Fees Payment',
};

export default function PaymentConfirmationManager() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(
        `/api/payments?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedSession, selectedTerm]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  // Auto-refresh every 30 seconds — only when form is NOT open
  useEffect(() => {
    if (showAddForm) return; // don't refresh while user is filling the form
    const interval = setInterval(() => loadPayments(true), 30_000);
    return () => clearInterval(interval);
  }, [loadPayments, showAddForm]);

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

    setSaving(true);
    try {
      const payload = {
        studentId: `student-${Date.now()}`,
        studentName: formData.studentName.trim(),
        admissionNumber: formData.admissionNumber.trim(),
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

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadPayments();
        setFormData(EMPTY_FORM);
        setShowAddForm(false);
        alert('Payment confirmed successfully!');
      } else {
        const err = await res.json();
        alert(`Failed to save payment: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const methodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank transfer': return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
      case 'cash': return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
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
          <p className="text-gray-600">Confirm and manage student payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadPayments(true)} disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => { setShowAddForm(true); setFormData(EMPTY_FORM); }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
            <PlusIcon className="h-5 w-5" />
            Confirm Payment
          </button>
        </div>
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

      {/* Add Payment Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm New Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name *</label>
              <input type="text" value={formData.studentName}
                onChange={e => setFormData(p => ({ ...p, studentName: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
              <input type="text" value={formData.admissionNumber}
                onChange={e => setFormData(p => ({ ...p, admissionNumber: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SPA/2023/001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₦) *</label>
              <input type="number" value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
              <select value={formData.paymentMethod}
                onChange={e => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Debit Card</option>
                <option>Credit Card</option>
                <option>Mobile Money</option>
              </select>
            </div>
            {formData.paymentMethod === 'Bank Transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input type="text" value={formData.bankName}
                    onChange={e => setFormData(p => ({ ...p, bankName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., First Bank Nigeria" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input type="text" value={formData.accountNumber}
                    onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Account number" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <input type="text" value={formData.transactionId}
                onChange={e => setFormData(p => ({ ...p, transactionId: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transaction reference (optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payment description" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleAddPayment} disabled={saving}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-60">
              <CheckCircleIcon className="h-5 w-5" />
              {saving ? 'Saving...' : 'Confirm Payment'}
            </button>
            <button onClick={() => { setShowAddForm(false); setFormData(EMPTY_FORM); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Confirmed Payments — {selectedTerm}, {selectedSession}
            <span className="ml-2 text-sm font-normal text-gray-500">({payments.length} records)</span>
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No Payments Found</h3>
              <p className="text-gray-500 mt-1">No payments confirmed for {selectedTerm} of {selectedSession}.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Student', 'Receipt No.', 'Amount', 'Method', 'Date Confirmed', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{p.studentName}</div>
                              <div className="text-sm text-gray-500">{p.admissionNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.receiptNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{fmt(p.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {methodIcon(p.paymentMethod)}
                            <span className="text-sm text-gray-900">{p.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(p.dateIssued).toLocaleDateString()}
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
              <div className="mt-4 text-sm font-medium text-gray-700">
                Total: {payments.length} payments — {fmt(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
