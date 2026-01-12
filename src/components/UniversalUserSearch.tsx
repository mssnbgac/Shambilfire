'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any;
}

interface UniversalUserSearchProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  allowedRoles?: string[];
  showUserDetails?: boolean;
}

export default function UniversalUserSearch({ 
  onUserSelect, 
  placeholder = "Search by name or email...",
  allowedRoles = [],
  showUserDetails = true
}: UniversalUserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load all users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = fullName.includes(search) || email.includes(search);
      const matchesRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);
      
      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users, allowedRoles]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Try API first
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // Fallback to localStorage
        const { getCreatedUsers } = await import('@/lib/demoUsers');
        const localUsers = getCreatedUsers();
        setUsers(localUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to localStorage on error
      try {
        const { getCreatedUsers } = await import('@/lib/demoUsers');
        const localUsers = getCreatedUsers();
        setUsers(localUsers);
      } catch (fallbackError) {
        console.error('Error loading local users:', fallbackError);
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setFilteredUsers([]);
    
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setFilteredUsers([]);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'teacher':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case 'admin':
        return <UserIcon className="h-5 w-5 text-purple-500" />;
      case 'parent':
        return <UserIcon className="h-5 w-5 text-orange-500" />;
      case 'accountant':
        return <UserIcon className="h-5 w-5 text-yellow-500" />;
      case 'exam_officer':
        return <UserIcon className="h-5 w-5 text-red-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'parent':
        return 'bg-orange-100 text-orange-800';
      case 'accountant':
        return 'bg-yellow-100 text-yellow-800';
      case 'exam_officer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {selectedUser && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading users...</p>
        </div>
      )}

      {/* Search Results */}
      {filteredUsers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                {getRoleIcon(user.role)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchTerm.trim() && filteredUsers.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No users found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Selected User Details */}
      {selectedUser && showUserDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            {getRoleIcon(selectedUser.role)}
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </h4>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
              {selectedUser.role.replace('_', ' ')}
            </span>
          </div>
          
          {/* Role-specific details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {selectedUser.admissionNumber && (
              <div>
                <span className="font-medium text-gray-700">Admission Number:</span>
                <span className="ml-2 text-gray-600">{selectedUser.admissionNumber}</span>
              </div>
            )}
            {selectedUser.class && (
              <div>
                <span className="font-medium text-gray-700">Class:</span>
                <span className="ml-2 text-gray-600">{selectedUser.class}</span>
              </div>
            )}
            {selectedUser.phoneNumber && (
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-600">{selectedUser.phoneNumber}</span>
              </div>
            )}
            {selectedUser.subjects && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Subjects:</span>
                <span className="ml-2 text-gray-600">{selectedUser.subjects.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}