'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getCreatedUsers } from '@/lib/demoUsers';
import { getSharedUsers } from '@/lib/sharedUserStorage';

export default function DebugUsersPage() {
  const { user } = useAuth();
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [apiUsers, setApiUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      // Load from localStorage
      const local = getCreatedUsers();
      setLocalUsers(local);

      // Load from shared storage
      const shared = await getSharedUsers();
      setSharedUsers(shared);

      // Load from API
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setApiUsers(data.users || []);
        }
      } catch (error) {
        console.log('API not available');
        setApiUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('createdUsers');
    localStorage.removeItem('shambil_shared_users');
    setLocalUsers([]);
    setSharedUsers([]);
    alert('Local storage cleared');
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access debug information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Debug Users</h1>
            <p className="text-gray-600">Debug user storage systems.</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={loadAllUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={clearLocalStorage}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Clear Local Storage
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Local Storage Users */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Local Storage ({localUsers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {localUsers.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-blue-600">{user.role}</div>
                  </div>
                ))}
                {localUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No users in localStorage</p>
                )}
              </div>
            </div>

            {/* Shared Storage Users */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Shared Storage ({sharedUsers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sharedUsers.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-blue-600">{user.role}</div>
                  </div>
                ))}
                {sharedUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No users in shared storage</p>
                )}
              </div>
            </div>

            {/* API Users */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                API Storage ({apiUsers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apiUsers.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-blue-600">{user.role}</div>
                  </div>
                ))}
                {apiUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No users in API storage</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Storage Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Storage Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Local Storage:</strong> Browser localStorage (key: 'createdUsers')</p>
            <p>• <strong>Shared Storage:</strong> Cross-device storage (key: 'shambil_shared_users')</p>
            <p>• <strong>API Storage:</strong> In-memory server storage (resets on restart)</p>
            <p>• <strong>Authentication:</strong> Checks all three sources during login</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}