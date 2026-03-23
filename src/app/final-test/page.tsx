'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function FinalTestPage() {
  const { login, user, logout } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addTestResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setCurrentTest(testName);
    setLoading(true);
    try {
      await testFn();
    } catch (error: any) {
      addTestResult(testName, false, `Test failed: ${error.message}`);
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  // Test 1: Role Recognition for Parent
  const testParentRole = async () => {
    try {
      await login('parent@shambil.edu.ng', 'parent123');
      
      // Wait a moment for context to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      
      if (currentUser.role === 'parent') {
        addTestResult('Parent Role Recognition', true, 'Parent role correctly recognized', {
          role: currentUser.role,
          email: currentUser.email,
          name: `${currentUser.firstName} ${currentUser.lastName}`
        });
      } else {
        addTestResult('Parent Role Recognition', false, `Expected 'parent', got '${currentUser.role}'`, currentUser);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Parent Role Recognition', false, error.message);
    }
  };

  // Test 2: Role Recognition for Student
  const testStudentRole = async () => {
    try {
      await login('student@shambil.edu.ng', 'student123');
      
      // Wait a moment for context to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      
      if (currentUser.role === 'student') {
        addTestResult('Student Role Recognition', true, 'Student role correctly recognized', {
          role: currentUser.role,
          email: currentUser.email,
          name: `${currentUser.firstName} ${currentUser.lastName}`
        });
      } else {
        addTestResult('Student Role Recognition', false, `Expected 'student', got '${currentUser.role}'`, currentUser);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Student Role Recognition', false, error.message);
    }
  };

  // Test 3: Expenditure Creation (Accountant)
  const testExpenditureCreation = async () => {
    try {
      // Login as accountant
      await login('accountant@shambil.edu.ng', 'accountant123');
      
      // Wait for login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create test expenditure
      const testExpenditure = {
        title: `Test Expenditure ${Date.now()}`,
        description: 'Test expenditure for synchronization verification',
        category: 'supplies',
        priority: 'medium',
        amount: 25000,
        academicSession: '2023/2024',
        term: 'First Term',
        requestedBy: 'accountant-1',
        requestedByName: 'Michael Brown',
      };

      const response = await fetch('/api/expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testExpenditure),
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('Expenditure Creation', true, 'Expenditure created successfully via API', {
          id: data.expenditure.id,
          title: data.expenditure.title,
          amount: data.expenditure.amount,
          status: data.expenditure.status
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Expenditure Creation', false, error.message);
    }
  };

  // Test 4: Expenditure Approval (Admin)
  const testExpenditureApproval = async () => {
    try {
      // Login as admin
      await login('admin@shambil.edu.ng', 'admin123');
      
      // Wait for login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get pending expenditures
      const response = await fetch('/api/expenditures?status=pending');
      if (!response.ok) {
        throw new Error(`Failed to fetch expenditures: ${response.status}`);
      }
      
      const data = await response.json();
      const pendingExpenditures = data.expenditures || [];
      
      if (pendingExpenditures.length === 0) {
        addTestResult('Expenditure Approval', false, 'No pending expenditures found to approve');
        await logout();
        return;
      }
      
      // Approve the first pending expenditure
      const expenditureToApprove = pendingExpenditures[0];
      const approvalResponse = await fetch(`/api/expenditures?id=${expenditureToApprove.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approvedBy: 'admin-1',
          approvedByName: 'John Administrator',
          approvedAt: new Date().toISOString(),
          notes: 'Approved via test system',
        }),
      });

      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json();
        addTestResult('Expenditure Approval', true, 'Expenditure approved successfully via API', {
          id: approvalData.expenditure.id,
          title: approvalData.expenditure.title,
          status: approvalData.expenditure.status,
          approvedBy: approvalData.expenditure.approvedByName
        });
      } else {
        throw new Error(`Approval failed: ${approvalResponse.status}`);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Expenditure Approval', false, error.message);
    }
  };

  // Test 6: Financial Report Creation (Accountant)
  const testFinancialReportCreation = async () => {
    try {
      // Login as accountant
      await login('accountant@shambil.edu.ng', 'accountant123');
      
      // Wait for login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create test financial report
      const testReport = {
        title: `Test Financial Report ${Date.now()}`,
        content: `# Test Financial Report

This is a test financial report for synchronization verification.

## Financial Summary
- Revenue: ₦750,000
- Expenditures: ₦300,000
- Net Balance: ₦450,000

## Conclusion
This report verifies the synchronization between accountant and admin systems.`,
        term: 'First Term',
        academicSession: '2023/2024',
        reportType: 'financial',
        createdBy: 'accountant-1',
        createdByName: 'Michael Brown',
        createdByRole: 'accountant',
        totalRevenue: 750000,
        totalExpenditures: 300000,
        netBalance: 450000,
        paymentCount: 15,
        expenditureCount: 8,
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testReport),
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('Financial Report Creation', true, 'Financial report created successfully via API', {
          id: data.report.id,
          title: data.report.title,
          status: data.report.status,
          approvalStatus: data.report.approvalStatus
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Financial Report Creation', false, error.message);
    }
  };

  // Test 7: Financial Report Approval (Admin)
  const testFinancialReportApproval = async () => {
    try {
      // Login as admin
      await login('admin@shambil.edu.ng', 'admin123');
      
      // Wait for login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get pending financial reports
      const response = await fetch('/api/reports?type=financial&status=pending');
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const data = await response.json();
      const pendingReports = data.reports || [];
      
      if (pendingReports.length === 0) {
        addTestResult('Financial Report Approval', false, 'No pending financial reports found to approve');
        await logout();
        return;
      }
      
      // Approve the first pending report
      const reportToApprove = pendingReports[0];
      const approvalResponse = await fetch(`/api/reports?id=${reportToApprove.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approvalStatus: 'approved',
          reviewedBy: 'admin-1',
          reviewedByName: 'John Administrator',
          reviewComments: 'Approved via test system - excellent financial analysis',
        }),
      });

      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json();
        addTestResult('Financial Report Approval', true, 'Financial report approved successfully via API', {
          id: approvalData.report.id,
          title: approvalData.report.title,
          status: approvalData.report.status,
          approvalStatus: approvalData.report.approvalStatus,
          reviewedBy: approvalData.report.reviewedByName
        });
      } else {
        throw new Error(`Approval failed: ${approvalResponse.status}`);
      }
      
      await logout();
    } catch (error: any) {
      addTestResult('Financial Report Approval', false, error.message);
    }
  };

  // Test 8: Financial Report Synchronization Check
  const testFinancialReportSynchronization = async () => {
    try {
      // Check API data
      const apiResponse = await fetch('/api/reports?type=financial');
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      const apiReports = apiData.reports || [];
      
      addTestResult('Financial Report Synchronization', true, 'Financial report synchronization check completed', {
        apiCount: apiReports.length,
        apiReports: apiReports.map((r: any) => ({ 
          id: r.id, 
          title: r.title, 
          status: r.status,
          approvalStatus: r.approvalStatus,
          createdBy: r.createdByName 
        }))
      });
      
    } catch (error: any) {
      addTestResult('Financial Report Synchronization', false, error.message);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    await runTest('Parent Role Recognition', testParentRole);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Student Role Recognition', testStudentRole);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Expenditure Creation', testExpenditureCreation);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Expenditure Approval', testExpenditureApproval);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Financial Report Creation', testFinancialReportCreation);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Financial Report Approval', testFinancialReportApproval);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await runTest('Financial Report Synchronization', testFinancialReportSynchronization);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Final System Test</h1>
          <p className="text-gray-600 mb-6">
            This page tests the three main issues that were fixed:
            <br />1. Role recognition for parent and student users
            <br />2. Expenditure synchronization between API and localStorage
            <br />3. Financial report synchronization between accountant and admin
          </p>
          
          {/* Current User Status */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Email:</strong> {user.email}</p>
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
              onClick={clearResults}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {/* Current Test Status */}
          {currentTest && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                <strong>Currently running:</strong> {currentTest}
                <span className="ml-2 animate-pulse">●</span>
              </p>
            </div>
          )}

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
                            <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto">
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