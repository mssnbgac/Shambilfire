'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugLoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState<any>(null);

  const handleTestLogin = async () => {
    try {
      console.log('Testing login with:', email, password);
      await login(email, password);
      setLoginResult({ success: true, message: 'Login successful' });
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLoginResult({ success: false, message: errorMessage });
    }
  };

  const checkLocalStorage = () => {
    const keys = ['demoUser', 'created_users', 'createdUsers', 'shambil_shared_users'];
    const data: any = {};
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      data[key] = value ? JSON.parse(value) : null;
    });
    
    console.log('LocalStorage data:', data);
    return data;
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      console.log('API users:', data);
      return data;
    } catch (error) {
      console.error('API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: errorMessage };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Login System</h1>
        
        {/* Current User Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Current User Status</h2>
          <div className="space-y-2">
            <p><strong>User exists:</strong> {user ? 'Yes' : 'No'}</p>
            <p><strong>User data:</strong></p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Test Login */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., parent@shambil.edu.ng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., parent123"
              />
            </div>
            <button
              onClick={handleTestLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Login
            </button>
            
            {loginResult && (
              <div className={`p-4 rounded ${loginResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p><strong>Result:</strong> {loginResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Tests</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                const data = checkLocalStorage();
                alert('Check console for localStorage data');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Check localStorage
            </button>
            
            <button
              onClick={async () => {
                const data = await testAPI();
                alert('Check console for API data');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test API
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                alert('localStorage cleared');
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear localStorage
            </button>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Demo Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Parent Account:</h3>
              <p>Email: parent@shambil.edu.ng</p>
              <p>Password: parent123</p>
              <button
                onClick={() => {
                  setEmail('parent@shambil.edu.ng');
                  setPassword('parent123');
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Use this account
              </button>
            </div>
            
            <div>
              <h3 className="font-medium">Student Account:</h3>
              <p>Email: student@shambil.edu.ng</p>
              <p>Password: student123</p>
              <button
                onClick={() => {
                  setEmail('student@shambil.edu.ng');
                  setPassword('student123');
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Use this account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}