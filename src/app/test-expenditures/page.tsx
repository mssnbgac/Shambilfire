'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestExpendituresPage() {
  const { login, user, logout } = useAuth();
  const [expenditures, setExpenditures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadExpenditures = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenditures');
      if (response.ok) {
        const data = await response.json();
        setExpenditures(data.expenditures || []);
        setTestResult({ success: true, message: 'Expenditures loaded successfully', count: data.expenditures?.length || 0 });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error loading expenditures:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestExpenditure = async () => {
    if (!user) {
      setTestResult({ success: false, error: 'No user logged in' });
      return;
    }

    setLoading(true);
    try {
      const testData = {
        title: `Test Expenditure ${Date.now()}`,
        description: 'This is a test expenditure request created for testing synchronization',
        category: 'supplies',
        priority: 'medium',
        amount: 50000,
        academicSession: '2023/2024',
        term: 'First Term',
        requestedBy: user.id,
        requestedByName: `${user.firstName} ${user.lastName}`,
      };

      const response = await fetch('/api/expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: 'Test expenditure created successfully', expenditure: data.expenditure });
        loadExpenditures(); // Reload to see the new expenditure
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error creating expenditure:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const approveExpenditure = async (expenditureId: string) => {
    if (!user || user.role !== 'admin') {
      setTestResult({ success: false, error: 'Only admins can approve expenditures' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/expenditures?id=${expenditureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approvedBy: user.id,
          approvedByName: `${user.firstName} ${user.lastName}`,
          approvedAt: new Date().toISOString(),
          notes: 'Approved via test page',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: 'Expenditure approved successfully', expenditure: data.expenditure });
        loadExpenditures(); // Reload to see the updated status
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error approving expenditure:', error);
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
    loadExpenditures();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Expenditure Synchronization Test</h1>
          
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
              onClick={loadExpenditures}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Reload Expenditures'}
            </button>
            
            {user && user.role === 'accountant' && (
              <button
                onClick={createTestExpenditure}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Create Test Expenditure
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
              {testResult.expenditure && (
                <pre className="text-sm overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(testResult.expenditure, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Expenditures List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Expenditures ({expenditures.length})
            </h2>
            
            {expenditures.length === 0 ? (
              <p className="text-gray-500">No expenditures found.</p>
            ) : (
              <div className="space-y-4">
                {expenditures.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><strong>Amount:</strong> ₦{exp.amount?.toLocaleString()}</div>
                          <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                            exp.status === 'approved' ? 'bg-green-100 text-green-800' :
                            exp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{exp.status}</span></div>
                          <div><strong>Requested by:</strong> {exp.requestedByName}</div>
                          <div><strong>Date:</strong> {new Date(exp.requestedAt).toLocaleDateString()}</div>
                        </div>
                        {exp.notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Notes:</strong> {exp.notes}
                          </div>
                        )}
                      </div>
                      
                      {user && user.role === 'admin' && exp.status === 'pending' && (
                        <button
                          onClick={() => approveExpenditure(exp.id)}
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