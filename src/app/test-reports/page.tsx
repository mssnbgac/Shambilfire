'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestReportsPage() {
  const { login, user, logout } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports?type=financial');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setTestResult({ success: true, message: 'Reports loaded successfully', count: data.reports?.length || 0 });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error loading reports:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestReport = async () => {
    if (!user) {
      setTestResult({ success: false, error: 'No user logged in' });
      return;
    }

    setLoading(true);
    try {
      const testData = {
        title: `Test Financial Report ${Date.now()}`,
        content: `# Test Financial Report

This is a test financial report created for testing synchronization between accountant and admin.

## Summary
- Test report created by: ${user.firstName} ${user.lastName}
- Created at: ${new Date().toLocaleString()}
- Purpose: Testing API synchronization

## Financial Data
- Revenue: ₦500,000
- Expenditures: ₦200,000
- Net Balance: ₦300,000

## Conclusion
This test report verifies that financial reports are properly synchronized between accountant creation and admin review.`,
        term: 'First Term',
        academicSession: '2023/2024',
        reportType: 'financial',
        createdBy: user.id,
        createdByName: `${user.firstName} ${user.lastName}`,
        createdByRole: user.role,
        totalRevenue: 500000,
        totalExpenditures: 200000,
        netBalance: 300000,
        paymentCount: 10,
        expenditureCount: 5,
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: 'Test report created successfully', report: data.report });
        loadReports(); // Reload to see the new report
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error creating report:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const approveReport = async (reportId: string) => {
    if (!user || user.role !== 'admin') {
      setTestResult({ success: false, error: 'Only admins can approve reports' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approvalStatus: 'approved',
          reviewedBy: user.id,
          reviewedByName: `${user.firstName} ${user.lastName}`,
          reviewComments: 'Approved via test page - report looks good!',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: 'Report approved successfully', report: data.report });
        loadReports(); // Reload to see the updated status
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error approving report:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    const accounts = {
      admin: { email: 'admin@shambil.edu.ng', password: 'admin123' },
      accountant: { email: 'accountant@shambil.edu.ng', password: 'accountant123' },
    };

    const account = accounts[role as keyof typeof accounts];
    if (account) {
      try {
        await login(account.email, account.password);
        setTestResult({ success: true, message: `Logged in as ${role}` });
      } catch (error: any) {
        setTestResult({ success: false, error: error.message });
      }
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Report Synchronization Test</h1>
          
          {/* Current User Info */}
          {user ? (
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
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Not Logged In</h2>
              <div className="space-x-2">
                <button
                  onClick={() => quickLogin('admin')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login as Admin
                </button>
                <button
                  onClick={() => quickLogin('accountant')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Login as Accountant
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 space-x-2">
            <button
              onClick={loadReports}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Reload Reports'}
            </button>
            
            {user && user.role === 'accountant' && (
              <button
                onClick={createTestReport}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Create Test Report
              </button>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`mb-6 p-4 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-lg font-semibold mb-2">
                {testResult.success ? 'Success' : 'Error'}
              </h2>
              <p className="mb-2">{testResult.message || testResult.error}</p>
              {testResult.report && (
                <pre className="text-sm overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(testResult.report, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Reports List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Reports ({reports.length})
            </h2>
            
            {reports.length === 0 ? (
              <p className="text-gray-500">No financial reports found.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.term} • {report.academicSession}
                        </p>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                            report.status === 'approved' || report.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            report.status === 'rejected' || report.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{report.approvalStatus || report.status}</span></div>
                          <div><strong>Created by:</strong> {report.createdByName}</div>
                          <div><strong>Role:</strong> {report.createdByRole}</div>
                          <div><strong>Date:</strong> {new Date(report.dateCreated).toLocaleDateString()}</div>
                        </div>
                        {report.reviewComments && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Review Comments:</strong> {report.reviewComments}
                          </div>
                        )}
                      </div>
                      
                      {user && user.role === 'admin' && (report.status === 'pending' || report.approvalStatus === 'pending') && (
                        <button
                          onClick={() => approveReport(report.id)}
                          disabled={loading}
                          className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}