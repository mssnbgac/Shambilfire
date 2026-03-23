'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { searchUserByEmailUnified, getAllUsersUnified } from '@/lib/userManagement';
import { useState, useEffect } from 'react';

export default function DebugTeacherPage() {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDebugData();
    }
  }, [user]);

  const loadDebugData = async () => {
    // Get data from localStorage
    const localData = searchUserByEmailUnified(user?.email || '');
    setTeacherData(localData);

    // Get all users
    const users = getAllUsersUnified();
    setAllUsers(users);

    // Try API
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(user?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      }
    } catch (error) {
      console.error('API error:', error);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view debug information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Debug Information</h1>
            <p className="text-gray-600">Debug information for teacher data loading</p>
          </div>

          {/* Current User Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User (from Auth Context)</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Teacher Data from localStorage */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teacher Data (from localStorage)</h2>
            {teacherData ? (
              <div>
                <div className="mb-4 p-3 bg-green-50 rounded">
                  <p className="text-green-800">✅ Teacher data found!</p>
                  <p className="text-sm text-green-600">
                    Subjects: {teacherData.subjects?.length || 0} | 
                    Classes: {teacherData.classes?.length || 0}
                  </p>
                </div>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(teacherData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded">
                <p className="text-red-800">❌ No teacher data found for email: {user.email}</p>
              </div>
            )}
          </div>

          {/* API Data */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Data</h2>
            {apiData ? (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            ) : (
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-yellow-800">⚠️ No API data available</p>
              </div>
            )}
          </div>

          {/* All Users */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users in Storage ({allUsers.length})</h2>
            <div className="space-y-2 mb-4">
              {allUsers.filter(u => u.role === 'teacher').map((teacher, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded">
                  <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                  <p className="text-sm text-gray-600">{teacher.email} | Role: {teacher.role}</p>
                  <p className="text-sm text-gray-600">
                    Subjects: {teacher.subjects?.length || 0} | Classes: {teacher.classes?.length || 0}
                  </p>
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <p className="text-xs text-blue-600">Subjects: {teacher.subjects.join(', ')}</p>
                  )}
                  {teacher.classes && teacher.classes.length > 0 && (
                    <p className="text-xs text-green-600">Classes: {teacher.classes.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show all users (raw data)</summary>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-2">
                {JSON.stringify(allUsers, null, 2)}
              </pre>
            </details>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Actions</h2>
            <div className="space-x-4">
              <button
                onClick={loadDebugData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh Data
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('localStorage cleared! Please refresh the page.');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear localStorage
              </button>
              
              <a
                href="/dashboard"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
              >
                Back to Dashboard
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Check if your teacher account has subjects and classes assigned</li>
              <li>If no data is shown, ask admin to recreate your teacher account</li>
              <li>Make sure you're logged in with the correct email</li>
              <li>Try refreshing the data using the button above</li>
              <li>If issues persist, clear localStorage and have admin recreate your account</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}