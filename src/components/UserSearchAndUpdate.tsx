'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  searchUserByEmail, 
  updateUser, 
  getAllUsers,
  broadcastUserUpdate,
  UserUpdateData 
} from '@/lib/userManagement';
import { CreatedUser } from '@/lib/demoUsers';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UserSearchAndUpdate() {
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<CreatedUser | null>(null);
  const [allUsers, setAllUsers] = useState<CreatedUser[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Update form state
  const [updateForm, setUpdateForm] = useState<UserUpdateData>({});

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllUsers();
    }
  }, [user]);

  const loadAllUsers = () => {
    try {
      const users = getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const result = searchUserByEmail(searchEmail.trim());
      setSearchResult(result);
      
      if (result) {
        // Initialize update form with current user data
        setUpdateForm({
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phoneNumber: result.phoneNumber || '',
          address: result.address || '',
          role: result.role,
          class: result.class || '',
          admissionNumber: result.admissionNumber || '',
          dateOfBirth: result.dateOfBirth || '',
          bloodGroup: result.bloodGroup || '',
          parentEmail: result.parentEmail || ''
        });
        toast.success('User found!');
      } else {
        toast.error('No user found with this email address');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!searchResult) {
      toast.error('No user selected for update');
      return;
    }

    // Validate required fields
    if (!updateForm.firstName?.trim() || !updateForm.lastName?.trim() || !updateForm.email?.trim()) {
      toast.error('First name, last name, and email are required');
      return;
    }

    setUpdating(true);
    try {
      const updatedUser = updateUser(searchResult.id, updateForm);
      
      if (updatedUser) {
        setSearchResult(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        // Broadcast the update for real-time dashboard updates
        broadcastUserUpdate(updatedUser.id, updateForm);
        
        toast.success('User information updated successfully!');
        setShowUpdateForm(false);
      } else {
        toast.error('Failed to update user information');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user information');
    } finally {
      setUpdating(false);
    }
  };

  const handleUserSelect = (selectedUser: CreatedUser) => {
    setSearchResult(selectedUser);
    setSearchEmail(selectedUser.email);
    setUpdateForm({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      phoneNumber: selectedUser.phoneNumber || '',
      address: selectedUser.address || '',
      role: selectedUser.role,
      class: selectedUser.class || '',
      admissionNumber: selectedUser.admissionNumber || '',
      dateOfBirth: selectedUser.dateOfBirth || '',
      bloodGroup: selectedUser.bloodGroup || '',
      parentEmail: selectedUser.parentEmail || ''
    });
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators can search and update user information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Search & Update</h2>
        <p className="text-gray-600">Search for users by email and update their information</p>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search User</h3>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter user email address..."
              />
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              )}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* All Users List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Users ({allUsers.length})</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {formatRole(user.role)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">User Found</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUserDetails(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-2" />
                  Update Info
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {searchResult.firstName} {searchResult.lastName}</p>
                  <p><span className="font-medium">Email:</span> {searchResult.email}</p>
                  <p><span className="font-medium">Role:</span> {formatRole(searchResult.role)}</p>
                  <p><span className="font-medium">Phone:</span> {searchResult.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Address:</span> {searchResult.address || 'Not provided'}</p>
                  {searchResult.role === 'student' && (
                    <>
                      <p><span className="font-medium">Class:</span> {searchResult.class || 'Not assigned'}</p>
                      <p><span className="font-medium">Admission No:</span> {searchResult.admissionNumber || 'Not assigned'}</p>
                    </>
                  )}
                  <p><span className="font-medium">Last Updated:</span> {searchResult.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Form Modal */}
      {showUpdateForm && searchResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update User Information</h3>
              <button
                onClick={() => setShowUpdateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      value={updateForm.firstName || ''}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      value={updateForm.lastName || ''}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={updateForm.email || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={updateForm.password || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={updateForm.role || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Administrator</option>
                    <option value="accountant">Accountant</option>
                    <option value="exam_officer">Exam Officer</option>
                  </select>
                </div>
              </div>

              {/* Contact & Additional Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Additional Info</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={updateForm.phoneNumber || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={updateForm.address || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Home address"
                  />
                </div>

                {/* Student-specific fields */}
                {updateForm.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class</label>
                      <input
                        type="text"
                        value={updateForm.class || ''}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, class: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., JSS 1A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                      <input
                        type="text"
                        value={updateForm.admissionNumber || ''}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, admissionNumber: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., SPA/2024/001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="date"
                        value={updateForm.dateOfBirth || ''}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                      <select
                        value={updateForm.bloodGroup || ''}
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={() => setShowUpdateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Update Information
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && searchResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {searchResult.firstName} {searchResult.lastName}
                  </h4>
                  <p className="text-gray-600">{formatRole(searchResult.role)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{searchResult.email}</p>
                    </div>
                  </div>

                  {searchResult.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{searchResult.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {searchResult.address && (
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">{searchResult.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {searchResult.role === 'student' && (
                    <>
                      {searchResult.class && (
                        <div className="flex items-center space-x-3">
                          <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Class</p>
                            <p className="text-sm text-gray-600">{searchResult.class}</p>
                          </div>
                        </div>
                      )}

                      {searchResult.admissionNumber && (
                        <div className="flex items-center space-x-3">
                          <KeyIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Admission Number</p>
                            <p className="text-sm text-gray-600">{searchResult.admissionNumber}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-600">{searchResult.createdAt.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">{searchResult.updatedAt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}