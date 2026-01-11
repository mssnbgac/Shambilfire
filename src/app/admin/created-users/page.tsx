'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getCreatedUsers, deleteCreatedUser, clearAllCreatedUsers } from '@/lib/demoUsers';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CreatedUsersPage() {
  const { user } = useAuth();
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);

  useEffect(() => {
    setCreatedUsers(getCreatedUsers());
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can view created users.</p>
        </div>
      </Layout>
    );
  }

  const handleDeleteUser = (email: string) => {
    if (confirm(`Are you sure you want to delete the user with email: ${email}?`)) {
      const deleted = deleteCreatedUser(email);
      if (deleted) {
        setCreatedUsers(getCreatedUsers());
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL created users? This cannot be undone.')) {
      clearAllCreatedUsers();
      setCreatedUsers([]);
      toast.success('All created users cleared');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Created Users (Demo Mode)</h1>
            <p className="text-gray-600">Manage users created through the admin interface.</p>
          </div>
          {createdUsers.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Clear All Users
            </button>
          )}
        </div>

        {createdUsers.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Created Users</h3>
            <p className="text-gray-600 mb-4">
              No users have been created yet. Create students or teachers to see them here.
            </p>
            <div className="space-x-4">
              <a
                href="/students/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
              >
                Create Student
              </a>
              <a
                href="/teachers/new"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block"
              >
                Create Teacher
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {createdUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                            user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'parent' ? 'bg-orange-100 text-orange-800' :
                            user.role === 'accountant' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {user.password}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  These users are stored in localStorage and will be lost when browser data is cleared. 
                  In production, users would be stored in Firebase or another database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}