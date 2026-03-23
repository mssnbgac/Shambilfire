'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugRolePage() {
  const { login, user, logout } = useAuth();
  const [loginStatus, setLoginStatus] = useState<any>(null);

  const testLogin = async (email: string, password: string, expectedRole: string) => {
    try {
      setLoginStatus({ loading: true, email, expectedRole });
      
      console.log(`=== Testing login for ${expectedRole} ===`);
      console.log('Email:', email);
      console.log('Password:', password);
      
      await login(email, password);
      
      // Check the user object after login
      const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
      console.log('User from localStorage:', currentUser);
      console.log('User from context:', user);
      
      setLoginStatus({
        success: true,
        email,
        expectedRole,
        actualRole: currentUser.role,
        roleMatch: currentUser.role === expectedRole,
        userObject: currentUser,
        contextUser: user
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginStatus({
        success: false,
        email,
        expectedRole,
        error: error.message
      });
    }
  };

  const testAccounts = [
    { email: 'student@shambil.edu.ng', password: 'student123', role: 'student' },
    { email: 'parent@shambil.edu.ng', password: 'parent123', role: 'parent' },
    { email: 'admin@shambil.edu.ng', password: 'admin123', role: 'admin' },
    { email: 'teacher@shambil.edu.ng', password: 'teacher123', role: 'teacher' },
    { email: 'accountant@shambil.edu.ng', password: 'accountant123', role: 'accountant' },
  ];

  const checkDashboardRole = (role: string) => {
    const validRoles = ['admin', 'teacher', 'student', 'parent', 'accountant', 'exam_officer'];
    return {
      isValid: validRoles.includes(role),
      validRoles,
      providedRole: role,
      roleType: typeof role
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Role Debug Page</h1>
          
          {/* Current User */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Role:</strong> "{user.role}"</p>
                  <p><strong>Role Type:</strong> {typeof user.role}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
                <div>
                  <p><strong>Dashboard Role Check:</strong></p>
                  <pre className="text-xs bg-white p-2 rounded border">
                    {JSON.stringify(checkDashboardRole(user.role), null, 2)}
                  </pre>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}

          {/* Test Buttons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Test Login for Each Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => testLogin(account.email, account.password, account.role)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  disabled={loginStatus?.loading}
                >
                  <div className="font-medium text-blue-600">{account.role}</div>
                  <div className="text-sm text-gray-600">{account.email}</div>
                  <div className="text-xs text-gray-500">{account.password}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Status */}
          {loginStatus && !loginStatus.loading && (
            <div className={`p-4 rounded-lg ${loginStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-lg font-semibold mb-3">
                {loginStatus.success ? 'Login Test Result' : 'Login Failed'}
              </h2>
              
              {loginStatus.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Email:</strong> {loginStatus.email}</p>
                      <p><strong>Expected Role:</strong> {loginStatus.expectedRole}</p>
                      <p><strong>Actual Role:</strong> "{loginStatus.actualRole}"</p>
                      <p><strong>Role Match:</strong> {loginStatus.roleMatch ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    <div>
                      <p><strong>Dashboard Check:</strong></p>
                      <pre className="text-xs bg-white p-2 rounded border">
                        {JSON.stringify(checkDashboardRole(loginStatus.actualRole), null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <p><strong>User Object from localStorage:</strong></p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                      {JSON.stringify(loginStatus.userObject, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <p><strong>User Object from Context:</strong></p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                      {JSON.stringify(loginStatus.contextUser, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <p><strong>Email:</strong> {loginStatus.email}</p>
                  <p><strong>Expected Role:</strong> {loginStatus.expectedRole}</p>
                  <p><strong>Error:</strong> {loginStatus.error}</p>
                </div>
              )}
            </div>
          )}

          {loginStatus?.loading && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p>Testing login for {loginStatus.expectedRole}...</p>
            </div>
          )}

          {/* Manual API Test */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Manual API Test</h2>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/users');
                  const data = await response.json();
                  console.log('All users from API:', data);
                  alert(`Found ${data.users?.length || 0} users. Check console for details.`);
                } catch (error) {
                  console.error('API test error:', error);
                  alert('API test failed. Check console for details.');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Users API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}