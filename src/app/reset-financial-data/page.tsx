'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetFinancialDataPage() {
  const { user } = useAuth();
  const [resetStatus, setResetStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addStatus = (operation: string, success: boolean, message: string) => {
    setResetStatus(prev => [...prev, {
      operation,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const resetAllFinancialData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL financial data (payments and expenditures) from both API and localStorage. Are you sure you want to continue?')) {
      return;
    }

    if (!confirm('🚨 FINAL CONFIRMATION: This action cannot be undone. All payment records and expenditure requests will be lost. Continue?')) {
      return;
    }

    setLoading(true);
    setResetStatus([]);

    try {
      // 1. Clear API Payments
      addStatus('API Payments', false, 'Attempting to clear...');
      try {
        const response = await fetch('/api/payments/reset', {
          method: 'DELETE',
        });
        
        if (response.ok) {
          addStatus('API Payments', true, 'Successfully cleared all payments from API');
        } else {
          addStatus('API Payments', false, `Failed to clear API payments: ${response.status}`);
        }
      } catch (error) {
        addStatus('API Payments', false, `Error clearing API payments: ${error}`);
      }

      // 2. Clear API Expenditures
      addStatus('API Expenditures', false, 'Attempting to clear...');
      try {
        const response = await fetch('/api/expenditures/reset', {
          method: 'DELETE',
        });
        
        if (response.ok) {
          addStatus('API Expenditures', true, 'Successfully cleared all expenditures from API');
        } else {
          addStatus('API Expenditures', false, `Failed to clear API expenditures: ${response.status}`);
        }
      } catch (error) {
        addStatus('API Expenditures', false, `Error clearing API expenditures: ${error}`);
      }

      // 3. Clear localStorage Payments
      addStatus('localStorage Payments', false, 'Attempting to clear...');
      try {
        localStorage.removeItem('student_payments');
        addStatus('localStorage Payments', true, 'Successfully cleared payments from localStorage');
      } catch (error) {
        addStatus('localStorage Payments', false, `Error clearing localStorage payments: ${error}`);
      }

      // 4. Clear localStorage Expenditures
      addStatus('localStorage Expenditures', false, 'Attempting to clear...');
      try {
        localStorage.removeItem('expenditure_requests');
        addStatus('localStorage Expenditures', true, 'Successfully cleared expenditures from localStorage');
      } catch (error) {
        addStatus('localStorage Expenditures', false, `Error clearing localStorage expenditures: ${error}`);
      }

      // 5. Clear any other financial localStorage items
      const financialKeys = [
        'financial_overview',
        'payment_confirmations',
        'financial_reports',
        'revenue_data',
        'expense_data'
      ];

      financialKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          addStatus(`localStorage ${key}`, true, `Cleared ${key} from localStorage`);
        } catch (error) {
          addStatus(`localStorage ${key}`, false, `Error clearing ${key}: ${error}`);
        }
      });

      addStatus('Reset Complete', true, '🎉 All financial data has been reset to zero!');

    } catch (error) {
      addStatus('Reset Failed', false, `Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyReset = async () => {
    setLoading(true);
    try {
      // Check API payments
      const paymentsResponse = await fetch('/api/payments');
      const paymentsData = await paymentsResponse.json();
      const apiPaymentsCount = paymentsData.payments?.length || 0;

      // Check API expenditures
      const expendituresResponse = await fetch('/api/expenditures');
      const expendituresData = await expendituresResponse.json();
      const apiExpendituresCount = expendituresData.expenditures?.length || 0;

      // Check localStorage
      const localPayments = localStorage.getItem('student_payments');
      const localExpenditures = localStorage.getItem('expenditure_requests');
      const localPaymentsCount = localPayments ? JSON.parse(localPayments).length : 0;
      const localExpendituresCount = localExpenditures ? JSON.parse(localExpenditures).length : 0;

      addStatus('Verification', true, `API: ${apiPaymentsCount} payments, ${apiExpendituresCount} expenditures | localStorage: ${localPaymentsCount} payments, ${localExpendituresCount} expenditures`);

      if (apiPaymentsCount === 0 && apiExpendituresCount === 0 && localPaymentsCount === 0 && localExpendituresCount === 0) {
        addStatus('Verification Result', true, '✅ All financial data successfully reset to zero!');
      } else {
        addStatus('Verification Result', false, '❌ Some data still exists. Reset may not have been complete.');
      }

    } catch (error) {
      addStatus('Verification', false, `Error verifying reset: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    if (!confirm('Create a small sample dataset for testing?')) {
      return;
    }

    setLoading(true);
    try {
      // Create 2 sample payments
      const samplePayments = [
        {
          studentId: 'student-sample-1',
          studentName: 'John Doe',
          admissionNumber: 'SPA/2024/001',
          receiptNumber: 'SPA/2024/0001',
          amount: 50000,
          paymentMethod: 'Bank Transfer',
          bankName: 'First Bank Nigeria',
          accountNumber: '1234567890',
          transactionId: 'TXN2024001',
          description: 'School Fees Payment - First Term',
          academicSession: '2024/2025',
          term: 'First Term',
          confirmedBy: 'accountant-1'
        },
        {
          studentId: 'student-sample-2',
          studentName: 'Jane Smith',
          admissionNumber: 'SPA/2024/002',
          receiptNumber: 'SPA/2024/0002',
          amount: 45000,
          paymentMethod: 'Cash',
          transactionId: 'CASH2024001',
          description: 'School Fees Payment - First Term',
          academicSession: '2024/2025',
          term: 'First Term',
          confirmedBy: 'accountant-1'
        }
      ];

      for (const payment of samplePayments) {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment)
        });

        if (response.ok) {
          addStatus('Sample Payment', true, `Created payment for ${payment.studentName}: ₦${payment.amount.toLocaleString()}`);
        } else {
          addStatus('Sample Payment', false, `Failed to create payment for ${payment.studentName}`);
        }
      }

      addStatus('Sample Data', true, 'Sample dataset created successfully!');

    } catch (error) {
      addStatus('Sample Data', false, `Error creating sample data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
            <p className="text-red-600">Only administrators can reset financial data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset Financial Data</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">⚠️ Danger Zone</h2>
            <p className="text-red-700">
              This page allows you to completely reset all financial data to zero. This includes:
            </p>
            <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
              <li>All payment records (API and localStorage)</li>
              <li>All expenditure requests (API and localStorage)</li>
              <li>All financial reports and cached data</li>
              <li>Revenue and expense tracking data</li>
            </ul>
            <p className="text-red-800 font-semibold mt-3">
              ⚠️ This action cannot be undone!
            </p>
          </div>

          {/* Current User */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p><strong>Current User:</strong> {user.firstName} {user.lastName} ({user.role})</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 space-x-4">
            <button
              onClick={resetAllFinancialData}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Resetting...' : '🗑️ Reset All Financial Data'}
            </button>
            
            <button
              onClick={verifyReset}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : '🔍 Verify Reset'}
            </button>
            
            <button
              onClick={createSampleData}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '📊 Create Sample Data'}
            </button>
          </div>

          {/* Reset Status */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reset Operations ({resetStatus.length})
            </h2>
            
            {resetStatus.length === 0 ? (
              <p className="text-gray-500">No operations performed yet.</p>
            ) : (
              <div className="space-y-3">
                {resetStatus.map((status, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      status.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          status.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {status.success ? '✅' : '❌'} {status.operation}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          status.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {status.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {status.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Click "Reset All Financial Data" to clear everything</li>
              <li>Click "Verify Reset" to confirm all data has been cleared</li>
              <li>Optionally click "Create Sample Data" to add test data</li>
              <li>Refresh your browser and check the finance pages</li>
              <li>All revenue amounts should now show ₦0</li>
            </ol>
          </div>

          {/* Summary */}
          {resetStatus.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total Operations:</strong> {resetStatus.length}
                </div>
                <div className="text-green-600">
                  <strong>Successful:</strong> {resetStatus.filter(s => s.success).length}
                </div>
                <div className="text-red-600">
                  <strong>Failed:</strong> {resetStatus.filter(s => !s.success).length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}