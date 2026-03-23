'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestRolesPage() {
  const { login, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState<any>(null);

  const testAccounts = [
    { email: 'student@shambil.edu.ng', password: 'student123', role: 'student' },
    { email: 'parent@shambil.edu.ng', password: 'parent123', role: 'parent' },
    { email: 'admin@shambil.edu.ng', password: 'admin123', role: 'admin' },
    { email: 'teacher@shambil.edu.ng', password: 'teacher123', role: 'teacher' },
    { email: 'accountant@shambil.edu.ng', password: 'accountant123', role: 'accountant' },
  ];

  const handleLogin = async (testEmail?: string, testPassword?: string) => {
    try {
      const loginEmail = testEmail || email;
      const loginPassword = testPassword || password;
      
      console.log('Attempting login with:', loginEmail, loginPassword);
      await login(loginEmail, loginPassword);
      setLoginResult({ success: true, user: user });
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoginResult({ success: false, error: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLoginResult(null);
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Role Recognition Test</h1>
          
          {/* Current User Info */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current User</h2>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Role:</strong> "{user.role}" (type: {typeof user.role})</p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}

          {/* Quick Test Buttons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Test Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleLogin(account.email, account.password)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="font-medium">{account.role}</div>
                  <div className="text-sm text-gray-600">{account.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Login Form */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Manual Login</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                onClick={() => handleLogin()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>

          {/* Login Result */}
          {loginResult && (
            <div className={`p-4 rounded-lg ${loginResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className="text-lg font-semibold mb-2">
                {loginResult.success ? 'Login Successful' : 'Login Failed'}
              </h2>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Debug Information</h2>
            <div className="text-sm space-y-1">
              <p><strong>Current User Object:</strong></p>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                {user ? JSON.stringify(user, null, 2) : 'No user logged in'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}