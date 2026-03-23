'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFinancialOverview, getPaymentsBySessionAndTerm, debugPayments } from '@/lib/paymentsStorage';

export default function DebugFinancialDataPage() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState('2024/2025');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [apiData, setApiData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [expenditureData, setExpenditureData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Get data from API (what admin sees)
      console.log('=== FETCHING API DATA ===');
      
      // Payments from API
      const paymentsResponse = await fetch(`/api/payments?session=${selectedSession}&term=${selectedTerm}`);
      const paymentsApiData = await paymentsResponse.json();
      console.log('API Payments:', paymentsApiData);
      
      // Financial overview from API
      const financesResponse = await fetch(`/api/finances?session=${selectedSession}&term=${selectedTerm}`);
      const financesApiData = await financesResponse.json();
      console.log('API Finances:', financesApiData);
      
      // Expenditures from API
      const expendituresResponse = await fetch(`/api/expenditures?session=${selectedSession}&term=${selectedTerm}`);
      const expendituresApiData = await expendituresResponse.json();
      console.log('API Expenditures:', expendituresApiData);
      
      setApiData({
        payments: paymentsApiData.payments || [],
        finances: financesApiData.financialOverview || {},
        expenditures: expendituresApiData.expenditures || []
      });
      
      // 2. Get data from localStorage (what accountant sees)
      console.log('=== FETCHING LOCALSTORAGE DATA ===');
      
      const localPayments = getPaymentsBySessionAndTerm(selectedSession, selectedTerm);
      console.log('LocalStorage Payments:', localPayments);
      
      const localFinances = getFinancialOverview(selectedSession, selectedTerm);
      console.log('LocalStorage Finances:', localFinances);
      
      // Get expenditures from localStorage
      const localExpenditures = localStorage.getItem('expenditure_requests');
      const parsedExpenditures = localExpenditures ? JSON.parse(localExpenditures) : [];
      const sessionExpenditures = parsedExpenditures.filter((exp: any) => 
        exp.academicSession === selectedSession
      );
      console.log('LocalStorage Expenditures:', sessionExpenditures);
      
      setLocalStorageData({
        payments: localPayments,
        finances: localFinances,
        expenditures: sessionExpenditures
      });
      
      // 3. Debug payments storage
      const debugInfo = debugPayments();
      console.log('=== PAYMENTS DEBUG INFO ===', debugInfo);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncApiToLocalStorage = async () => {
    try {
      // Get API payments and save to localStorage
      const paymentsResponse = await fetch(`/api/payments`);
      const paymentsData = await paymentsResponse.json();
      
      if (paymentsData.payments && paymentsData.payments.length > 0) {
        // Clear existing payments
        localStorage.removeItem('student_payments');
        
        // Save API payments to localStorage
        paymentsData.payments.forEach((payment: any) => {
          const existingPayments = JSON.parse(localStorage.getItem('student_payments') || '[]');
          existingPayments.push(payment);
          localStorage.setItem('student_payments', JSON.stringify(existingPayments));
        });
        
        alert('Synced API payments to localStorage. Reloading data...');
        loadAllData();
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('Failed to sync data');
    }
  };

  const addMorePaymentsToAPI = async () => {
    try {
      const additionalPayments = [
        {
          studentId: 'student-2',
          studentName: 'Sarah Johnson',
          admissionNumber: 'SPA/2024/002',
          receiptNumber: 'SPA/2024/0003',
          amount: 120000,
          paymentMethod: 'Bank Transfer',
          bankName: 'GTBank',
          accountNumber: '0123456789',
          transactionId: 'TXN2024003',
          description: 'School Fees Payment - First Term',
          academicSession: '2024/2025',
          term: 'First Term',
          confirmedBy: 'accountant-1'
        },
        {
          studentId: 'student-3',
          studentName: 'Ahmed Ibrahim',
          admissionNumber: 'SPA/2024/003',
          receiptNumber: 'SPA/2024/0004',
          amount: 110000,
          paymentMethod: 'Cash',
          transactionId: 'CASH2024002',
          description: 'School Fees Payment - First Term',
          academicSession: '2024/2025',
          term: 'First Term',
          confirmedBy: 'accountant-1'
        },
        {
          studentId: 'student-4',
          studentName: 'Fatima Usman',
          admissionNumber: 'SPA/2024/004',
          receiptNumber: 'SPA/2024/0005',
          amount: 100000,
          paymentMethod: 'Bank Transfer',
          bankName: 'Access Bank',
          accountNumber: '9876543210',
          transactionId: 'TXN2024004',
          description: 'School Fees Payment - First Term',
          academicSession: '2024/2025',
          term: 'First Term',
          confirmedBy: 'accountant-1'
        }
      ];

      for (const payment of additionalPayments) {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to add payment: ${response.status}`);
        }
      }
      
      alert('Added more payments to API. Reloading data...');
      loadAllData();
    } catch (error) {
      console.error('Error adding payments:', error);
      alert('Failed to add payments');
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedSession, selectedTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Data Debug</h1>
          <p className="text-gray-600 mb-6">
            This page shows the difference between API data (what admin sees) and localStorage data (what accountant sees)
          </p>
          
          {/* Current User */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p><strong>Current User:</strong> {user.firstName} {user.lastName} ({user.role})</p>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>
            
            <div className="space-x-4">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Reload Data'}
              </button>
              
              <button
                onClick={syncApiToLocalStorage}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Sync API → localStorage
              </button>
              
              <button
                onClick={addMorePaymentsToAPI}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Add More Payments to API
              </button>
            </div>
          </div>

          {/* Data Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Data (Admin View) */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-900 mb-4">API Data (Admin View)</h2>
              
              {apiData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-red-800">Financial Summary</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Total Revenue:</strong> {formatCurrency(apiData.finances.totalIncome || 0)}</p>
                      <p><strong>Total Payments:</strong> {apiData.payments.length}</p>
                      <p><strong>Available Funds:</strong> {formatCurrency(apiData.finances.availableFunds || 0)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-red-800">Payments ({apiData.payments.length})</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {apiData.payments.map((payment: any, index: number) => (
                        <div key={index} className="text-xs border-b border-red-200 py-1">
                          <p><strong>{payment.studentName}</strong> - {formatCurrency(payment.amount)}</p>
                          <p>{payment.description} ({payment.paymentMethod})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-red-800">Expenditures ({apiData.expenditures.length})</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {apiData.expenditures.map((exp: any, index: number) => (
                        <div key={index} className="text-xs border-b border-red-200 py-1">
                          <p><strong>{exp.title}</strong> - {formatCurrency(exp.amount)} ({exp.status})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Loading API data...</p>
              )}
            </div>

            {/* localStorage Data (Accountant View) */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-4">localStorage Data (Accountant View)</h2>
              
              {localStorageData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-green-800">Financial Summary</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Total Revenue:</strong> {formatCurrency(localStorageData.finances.totalRevenue || 0)}</p>
                      <p><strong>Total Payments:</strong> {localStorageData.payments.length}</p>
                      <p><strong>Average Payment:</strong> {formatCurrency(localStorageData.finances.averagePayment || 0)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-green-800">Payments ({localStorageData.payments.length})</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {localStorageData.payments.map((payment: any, index: number) => (
                        <div key={index} className="text-xs border-b border-green-200 py-1">
                          <p><strong>{payment.studentName}</strong> - {formatCurrency(payment.amount)}</p>
                          <p>{payment.description} ({payment.paymentMethod})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-green-800">Expenditures ({localStorageData.expenditures.length})</h3>
                    <div className="max-h-40 overflow-y-auto">
                      {localStorageData.expenditures.map((exp: any, index: number) => (
                        <div key={index} className="text-xs border-b border-green-200 py-1">
                          <p><strong>{exp.title}</strong> - {formatCurrency(exp.amount)} ({exp.status})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-green-600">Loading localStorage data...</p>
              )}
            </div>
          </div>

          {/* Raw Data Display */}
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw API Data</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw localStorage Data</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}