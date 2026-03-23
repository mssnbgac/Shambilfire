'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestFixesPage() {
  const { login, user, logout } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testFinancialDataConsistency = async () => {
    try {
      // Test as Admin
      await login('admin@shambil.edu.ng', 'admin123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const adminResponse = await fetch('/api/finances?session=2023/2024&term=First Term');
      const adminData = await adminResponse.json();
      
      await logout();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test as Accountant
      await login('accountant@shambil.edu.ng', 'accountant123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const accountantResponse = await fetch('/api/finances?session=2023/2024&term=First Term');
      const accountantData = await accountantResponse.json();

      // Compare the data
      const adminRevenue = adminData.financialOverview?.totalRevenue || adminData.financialOverview?.totalIncome || 0;
      const accountantRevenue = accountantData.financialOverview?.totalRevenue || accountantData.financialOverview?.totalIncome || 0;

      if (adminRevenue === accountantRevenue) {
        addResult('Financial Data Consistency', true, `Both admin and accountant see the same revenue: ₦${adminRevenue.toLocaleString()}`, {
          adminData: adminData.financialOverview,
          accountantData: accountantData.financialOverview
        });
      } else {
        addResult('Financial Data Consistency', false, `Revenue mismatch - Admin: ₦${adminRevenue.toLocaleString()}, Accountant: ₦${accountantRevenue.toLocaleString()}`, {
          adminRevenue,
          accountantRevenue,
          adminData: adminData.financialOverview,
          accountantData: accountantData.financialOverview
        });
      }

      await logout();
    } catch (error: any) {
      addResult('Financial Data Consistency', false, `Test failed: ${error.message}`);
    }
  };

  const testExpenditureApproval = async () => {
    try {
      // Login as accountant and create a test expenditure
      await login('accountant@shambil.edu.ng', 'accountant123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const testExpenditure = {
        title: `Test Approval ${Date.now()}`,
        description: 'Test expenditure for approval testing',
        category: 'supplies',
        priority: 'medium',
        amount: 15000,
        academicSession: '2023/2024',
        term: 'First Term',
        requestedBy: 'accountant-1',
        requestedByName: 'Michael Brown',
      };

      const createResponse = await fetch('/api/expenditures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testExpenditure),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create test expenditure');
      }

      const createData = await createResponse.json();
      const expenditureId = createData.expenditure.id;

      await logout();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Login as admin and try to approve
      await login('admin@shambil.edu.ng', 'admin123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const approveResponse = await fetch(`/api/expenditures?id=${expenditureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          approvedBy: 'admin-1',
          approvedByName: 'John Administrator',
          approvedAt: new Date().toISOString(),
          notes: 'Approved via test system',
        }),
      });

      console.log('Approval response status:', approveResponse.status);
      const approveResponseText = await approveResponse.text();
      console.log('Approval response text:', approveResponseText);

      if (approveResponse.ok) {
        const approveData = JSON.parse(approveResponseText);
        if (approveData.expenditure.status === 'approved') {
          addResult('Expenditure Approval', true, `Successfully approved expenditure: ${approveData.expenditure.title}`, {
            expenditureId,
            status: approveData.expenditure.status,
            approvedBy: approveData.expenditure.approvedByName
          });
        } else {
          addResult('Expenditure Approval', false, `Expenditure status not updated correctly: ${approveData.expenditure.status}`);
        }
      } else {
        addResult('Expenditure Approval', false, `Approval failed with status ${approveResponse.status}: ${approveResponseText}`);
      }

      await logout();
    } catch (error: any) {
      addResult('Expenditure Approval', false, `Test failed: ${error.message}`);
      console.error('Expenditure approval test error:', error);
    }
  };

  const testExpenditureRejection = async () => {
    try {
      // Login as accountant and create a test expenditure
      await login('accountant@shambil.edu.ng', 'accountant123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const testExpenditure = {
        title: `Test Rejection ${Date.now()}`,
        description: 'Test expenditure for rejection testing',
        category: 'supplies',
        priority: 'low',
        amount: 5000,
        academicSession: '2023/2024',
        term: 'First Term',
        requestedBy: 'accountant-1',
        requestedByName: 'Michael Brown',
      };

      const createResponse = await fetch('/api/expenditures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testExpenditure),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create test expenditure');
      }

      const createData = await createResponse.json();
      const expenditureId = createData.expenditure.id;

      await logout();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Login as admin and try to reject
      await login('admin@shambil.edu.ng', 'admin123');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const rejectResponse = await fetch(`/api/expenditures?id=${expenditureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          approvedBy: 'admin-1',
          approvedByName: 'John Administrator',
          approvedAt: new Date().toISOString(),
          rejectedReason: 'Test rejection via automated test',
        }),
      });

      if (rejectResponse.ok) {
        const rejectData = await rejectResponse.json();
        if (rejectData.expenditure.status === 'rejected') {
          addResult('Expenditure Rejection', true, `Successfully rejected expenditure: ${rejectData.expenditure.title}`, {
            expenditureId,
            status: rejectData.expenditure.status,
            rejectedReason: rejectData.expenditure.rejectedReason
          });
        } else {
          addResult('Expenditure Rejection', false, `Expenditure status not updated correctly: ${rejectData.expenditure.status}`);
        }
      } else {
        const errorText = await rejectResponse.text();
        addResult('Expenditure Rejection', false, `Rejection failed with status ${rejectResponse.status}: ${errorText}`);
      }

      await logout();
    } catch (error: any) {
      addResult('Expenditure Rejection', false, `Test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      await testFinancialDataConsistency();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await testExpenditureApproval();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await testExpenditureRejection();
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Fix Verification Tests</h1>
          <p className="text-gray-600 mb-6">
            Testing the fixes for:
            <br />1. Financial data consistency between admin and accountant
            <br />2. Expenditure approval functionality
          </p>
          
          {/* Current User */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <button
                onClick={logout}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}

          {/* Test Controls */}
          <div className="mb-6 space-x-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {/* Individual Test Buttons */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testFinancialDataConsistency}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Financial Data
            </button>
            
            <button
              onClick={testExpenditureApproval}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Test Approval
            </button>
            
            <button
              onClick={testExpenditureRejection}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Test Rejection
            </button>
          </div>

          {/* Test Results */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Test Results ({testResults.length})
            </h2>
            
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click "Run All Tests" to begin.</p>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.success ? '✅' : '❌'} {result.test}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.message}
                        </p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-gray-600">
                              View Details
                            </summary>
                            <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-40">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-4">
                        {result.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total Tests:</strong> {testResults.length}
                </div>
                <div className="text-green-600">
                  <strong>Passed:</strong> {testResults.filter(r => r.success).length}
                </div>
                <div className="text-red-600">
                  <strong>Failed:</strong> {testResults.filter(r => !r.success).length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}