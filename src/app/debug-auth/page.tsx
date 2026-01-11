'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCreatedUsers, findCreatedUser, clearAllCreatedUsers, saveCreatedUser } from '@/lib/demoUsers';
import { 
  BugAntIcon, 
  UserIcon, 
  KeyIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: any;
}

export default function DebugAuthPage() {
  const { user, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);
  const [testCredentials, setTestCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as any
  });
  const [loading, setLoading] = useState(false);

  // Demo users for reference
  const DEMO_USERS = [
    { email: 'admin@shambil.edu.ng', password: 'admin123', role: 'admin', name: 'John Administrator' },
    { email: 'teacher@shambil.edu.ng', password: 'teacher123', role: 'teacher', name: 'Mary Johnson' },
    { email: 'student@shambil.edu.ng', password: 'student123', role: 'student', name: 'David Smith' },
    { email: 'parent@shambil.edu.ng', password: 'parent123', role: 'parent', name: 'Sarah Wilson' },
    { email: 'accountant@shambil.edu.ng', password: 'accountant123', role: 'accountant', name: 'Michael Brown' },
    { email: 'examofficer@shambil.edu.ng', password: 'exam123', role: 'exam_officer', name: 'Jennifer Davis' },
  ];

  useEffect(() => {
    runDiagnostics();
    loadCreatedUsers();
  }, []);

  const loadCreatedUsers = () => {
    const users = getCreatedUsers();
    setCreatedUsers(users);
  };

  const runDiagnostics = () => {
    const results: TestResult[] = [];

    // Test 1: Check if we're in demo mode
    const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyExample_Replace_With_Your_Actual_API_Key';
    
    results.push({
      test: 'Demo Mode Detection',
      status: isDemoMode ? 'pass' : 'warning',
      message: isDemoMode ? 'Running in demo mode' : 'Firebase configuration detected',
      details: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set',
        keyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...'
      }
    });

    // Test 2: Check localStorage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({
        test: 'LocalStorage Access',
        status: 'pass',
        message: 'LocalStorage is available and writable'
      });
    } catch (error) {
      results.push({
        test: 'LocalStorage Access',
        status: 'fail',
        message: 'LocalStorage is not available',
        details: error
      });
    }

    // Test 3: Check created users in localStorage
    const storedUsers = getCreatedUsers();
    results.push({
      test: 'Created Users Storage',
      status: storedUsers.length > 0 ? 'pass' : 'info',
      message: `Found ${storedUsers.length} created users in localStorage`,
      details: storedUsers.map(u => ({ email: u.email, role: u.role, hasPassword: !!u.password }))
    });

    // Test 4: Check current user session
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        results.push({
          test: 'Current Session',
          status: 'pass',
          message: `User session found: ${userData.email}`,
          details: userData
        });
      } catch (error) {
        results.push({
          test: 'Current Session',
          status: 'fail',
          message: 'Invalid session data in localStorage',
          details: error
        });
      }
    } else {
      results.push({
        test: 'Current Session',
        status: 'info',
        message: 'No active user session'
      });
    }

    // Test 5: Test demo user credentials
    const demoTestResults = DEMO_USERS.map(demoUser => {
      try {
        const found = findCreatedUser(demoUser.email, demoUser.password);
        return {
          email: demoUser.email,
          found: !!found,
          type: 'hardcoded'
        };
      } catch (error) {
        return {
          email: demoUser.email,
          found: false,
          error: error,
          type: 'hardcoded'
        };
      }
    });

    results.push({
      test: 'Demo User Credentials',
      status: 'info',
      message: 'Demo user credential test results',
      details: demoTestResults
    });

    setTestResults(results);
  };

  const testLogin = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(testCredentials.email, testCredentials.password);
      toast.success('Login test successful!');
      runDiagnostics();
    } catch (error: any) {
      toast.error(`Login test failed: ${error.message}`);
      console.error('Login test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      toast.success('Logout test successful!');
      runDiagnostics();
    } catch (error: any) {
      toast.error(`Logout test failed: ${error.message}`);
    }
  };

  const createTestUser = () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    const testUser = {
      id: `test-${Date.now()}`,
      email: newUser.email.toLowerCase().trim(),
      password: newUser.password,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const success = saveCreatedUser(testUser);
    if (success) {
      toast.success('Test user created successfully!');
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'student' });
      loadCreatedUsers();
      runDiagnostics();
    } else {
      toast.error('Failed to create test user (email might already exist)');
    }
  };

  const clearAllUsers = () => {
    if (confirm('Are you sure you want to clear all created users? This cannot be undone.')) {
      clearAllCreatedUsers();
      toast.success('All created users cleared');
      loadCreatedUsers();
      runDiagnostics();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3">
            <BugAntIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Authentication Debug Center</h1>
              <p className="text-gray-600">Comprehensive testing and diagnostics for login issues</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Authentication Status</span>
                <div className="flex items-center space-x-2">
                  {user ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Logged In</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Not Logged In</span>
                    </>
                  )}
                </div>
              </div>

              {user && (
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="text-sm">
                    <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>ID:</strong> {user.id}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Demo Mode</span>
                <span className="text-sm text-blue-600">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">Created Users</span>
                <span className="text-sm text-gray-600">{createdUsers.length} users</span>
              </div>
            </div>
          </div>

          {/* Quick Login Test */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Login Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={testCredentials.email}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email to test"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={testCredentials.password}
                  onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password to test"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={testLogin}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <KeyIcon className="h-4 w-4" />
                  )}
                  <span>Test Login</span>
                </button>

                {user && (
                  <button
                    onClick={testLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Results */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Diagnostic Results</h2>
            <button
              onClick={runDiagnostics}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Refresh Tests
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{result.test}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.status === 'pass' ? 'bg-green-100 text-green-800' :
                        result.status === 'fail' ? 'bg-red-100 text-red-800' :
                        result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Show Details
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Users Reference */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Demo Users (Hardcoded)</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                {showPasswords ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_USERS.map((demoUser, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {demoUser.name}</div>
                  <div><strong>Email:</strong> {demoUser.email}</div>
                  <div><strong>Password:</strong> {showPasswords ? demoUser.password : '••••••••'}</div>
                  <div><strong>Role:</strong> {demoUser.role}</div>
                </div>
                <button
                  onClick={() => setTestCredentials({ email: demoUser.email, password: demoUser.password })}
                  className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Use for Test
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Created Users Management */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Created Users ({createdUsers.length})</h2>
            <div className="flex space-x-2">
              <button
                onClick={loadCreatedUsers}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
              {createdUsers.length > 0 && (
                <button
                  onClick={clearAllUsers}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center space-x-1"
                >
                  <TrashIcon className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {createdUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No created users found</p>
              <p className="text-sm">Users created through the system will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdUsers.map((user, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Password:</strong> {showPasswords ? user.password : '••••••••'}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => setTestCredentials({ email: user.email, password: user.password })}
                    className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Use for Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Test User */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Test User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={newUser.firstName}
                onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={newUser.lastName}
                onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
                <option value="exam_officer">Exam Officer</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={createTestUser}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Test User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Guide</h2>
          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Common Issues & Solutions</h3>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>• <strong>Login fails with valid credentials:</strong> Check if user exists in created users or use demo accounts</li>
                <li>• <strong>Created user not found:</strong> Verify localStorage is working and user was saved properly</li>
                <li>• <strong>Session not persisting:</strong> Check localStorage permissions and browser settings</li>
                <li>• <strong>Demo users not working:</strong> Ensure exact email/password match (case-sensitive)</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Quick Fixes</h3>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>• Clear browser cache and localStorage</li>
                <li>• Try incognito/private browsing mode</li>
                <li>• Use exact demo credentials from the reference table</li>
                <li>• Create a new test user and try logging in</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}