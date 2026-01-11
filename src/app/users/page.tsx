'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import ParentChildManager from '@/components/ParentChildManager';
import UserSearchAndUpdate from '@/components/UserSearchAndUpdate';
import { getCreatedUsers, CreatedUser, initializeDemoUsers } from '@/lib/demoUsers';
import toast from 'react-hot-toast';
import { 
  UserCircleIcon, 
  PencilIcon, 
  TrashIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: string;
  status: 'active' | 'inactive';
  [key: string]: any;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'users' | 'search' | 'parent-child'>('users');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllUsers();
    }
  }, [user, activeTab]);

  // Listen for new user creation events
  useEffect(() => {
    const handleUserCreated = (event: CustomEvent) => {
      // Reload users when a new user is created
      loadAllUsers();
      
      // Show notification
      const { user: newUser } = event.detail;
      toast.success(`New ${newUser.role} "${newUser.firstName} ${newUser.lastName}" has been added to the system!`);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('userCreated', handleUserCreated as EventListener);
      
      return () => {
        window.removeEventListener('userCreated', handleUserCreated as EventListener);
      };
    }
  }, []);

  const loadAllUsers = () => {
    try {
      setLoading(true);
      
      // Initialize demo users first
      initializeDemoUsers();
      
      // Get all users from the created users system
      const createdUsers = getCreatedUsers();
      
      // Convert CreatedUser to User format and add demo data
      const formattedUsers: User[] = createdUsers.map(createdUser => ({
        ...createdUser, // Include all fields from createdUser
        lastLogin: getLastLoginDate(createdUser.email),
        status: 'active' as const
      }));

      setAllUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastLoginDate = (email: string): string | undefined => {
    // Mock last login dates - in a real system this would come from login tracking
    const mockLastLogins: {[key: string]: string} = {
      'admin@shambil.edu.ng': '2024-02-10',
      'teacher@shambil.edu.ng': '2024-02-09',
      'student@shambil.edu.ng': '2024-02-08',
      'parent@shambil.edu.ng': '2024-02-07',
      'accountant@shambil.edu.ng': '2024-02-06',
      'examofficer@shambil.edu.ng': '2024-02-05'
    };
    return mockLastLogins[email];
  };

  // Get password for display (in demo mode only)
  const getUserPassword = (email: string): string => {
    // First check hardcoded demo passwords
    const demoPasswords: {[key: string]: string} = {
      'admin@shambil.edu.ng': 'admin123',
      'teacher@shambil.edu.ng': 'teacher123',
      'student@shambil.edu.ng': 'student123',
      'parent@shambil.edu.ng': 'parent123',
      'accountant@shambil.edu.ng': 'accountant123',
      'examofficer@shambil.edu.ng': 'exam123'
    };

    if (demoPasswords[email]) {
      return demoPasswords[email];
    }

    // For created users, try to get password from the user object
    const createdUser = allUsers.find(u => u.email === email);
    return createdUser?.password || '••••••••';
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </Layout>
    );
  }

  const togglePasswordVisibility = (email: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'teacher': 'Teacher',
      'student': 'Student',
      'parent': 'Parent',
      'accountant': 'Accountant',
      'exam_officer': 'Exam Officer'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-blue-100 text-blue-800',
      parent: 'bg-purple-100 text-purple-800',
      accountant: 'bg-yellow-100 text-yellow-800',
      exam_officer: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts, parent-child relationships, and user information.</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Add New User
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Export Users
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                <span>All Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                <span>Search & Update</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('parent-child')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'parent-child'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                <span>Parent-Child Links</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <>
            {/* Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    All Users ({allUsers.length})
                  </h3>
                  <button
                    onClick={loadAllUsers}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Refresh
                  </button>
                </div>
                
                {allUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Users Found</h3>
                    <p className="text-gray-500">No users have been created yet.</p>
                  </div>
                ) : (
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
                            Login Credentials
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((currentUser) => (
                          <tr key={currentUser.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {currentUser.firstName} {currentUser.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{currentUser.email}</div>
                                  {currentUser.class && (
                                    <div className="text-xs text-gray-400">Class: {currentUser.class}</div>
                                  )}
                                  {currentUser.admissionNumber && (
                                    <div className="text-xs text-gray-400">Admission: {currentUser.admissionNumber}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(currentUser.role)}`}>
                                {formatRole(currentUser.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="mb-1">
                                  <span className="font-medium">Email:</span> {currentUser.email}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Password:</span>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {showPasswords[currentUser.email] 
                                      ? getUserPassword(currentUser.email)
                                      : '••••••••'
                                    }
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(currentUser.email)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    {showPasswords[currentUser.email] ? (
                                      <EyeSlashIcon className="h-4 w-4" />
                                    ) : (
                                      <EyeIcon className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                currentUser.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {currentUser.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div>{currentUser.createdAt.toLocaleDateString()}</div>
                                {currentUser.lastLogin && (
                                  <div className="text-xs text-gray-400">
                                    Last login: {new Date(currentUser.lastLogin).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => {
                                    setActiveTab('search');
                                    // You could also pre-populate the search with this user's email
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit User"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-yellow-600 hover:text-yellow-900" title="Reset Password">
                                  <KeyIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900" title="Delete User">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Admin User Management</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>You can view all user login credentials as the administrator</li>
                      <li>Use the eye icon to show/hide passwords</li>
                      <li>Create new users through the "Add New Student" or "Add New Teacher" forms</li>
                      <li>Users will receive their login credentials to access their respective dashboards</li>
                      <li>In production, passwords should be securely hashed and not visible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'search' && <UserSearchAndUpdate />}

        {activeTab === 'parent-child' && <ParentChildManager />}
      </div>
    </Layout>
  );
}