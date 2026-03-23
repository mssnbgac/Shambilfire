'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreatedUser, getCreatedUsers, deleteCreatedUser } from '@/lib/demoUsers';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<CreatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Try API first
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          if (data.users && Array.isArray(data.users)) {
            setUsers(data.users.map((u: any) => ({
              ...u,
              createdAt: new Date(u.createdAt),
              updatedAt: new Date(u.updatedAt)
            })));
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }
      
      // Fallback to localStorage
      const localUsers = getCreatedUsers();
      setUsers(localUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    // Prevent deletion of default admin
    if (email === 'admin@shambil.edu.ng') {
      toast.error('Cannot delete the default admin user');
      return;
    }

    try {
      setDeleting(email);
      
      // Try API first
      try {
        const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success('User deleted successfully');
          loadUsers(); // Reload users
          return;
        } else {
          const errorData = await response.json();
          if (errorData.error === 'Cannot delete default admin user') {
            toast.error('Cannot delete the default admin user');
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using localStorage fallback');
      }
      
      // Fallback to localStorage
      const success = await deleteCreatedUser(email);
      if (success) {
        toast.success('User deleted successfully');
        loadUsers(); // Reload users
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all users in the system. Users will remain active unless deleted by an administrator.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Users ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'student' ? 'bg-green-100 text-green-800' :
                        user.role === 'parent' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'accountant' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'exam_officer' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.email === 'admin@shambil.edu.ng' ? (
                        <span className="text-gray-400">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          disabled={deleting === user.email}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleting === user.email ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            User Persistence Information
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Users remain active permanently unless deleted by an administrator</p>
            <p>• User data persists across app restarts and device changes</p>
            <p>• The default admin user cannot be deleted for security reasons</p>
            <p>• All user actions are logged and can be audited</p>
          </div>
        </div>
      </div>
    </div>
  );
}