'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { saveCreatedUser } from '@/lib/demoUsers';
import { addSharedUser } from '@/lib/sharedUserStorage';
import toast from 'react-hot-toast';

interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  occupation: string;
  emergencyContact: string;
  relationship: string;
}

export default function NewParentPage() {
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ParentFormData>();

  const password = watch('password');

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can add new parents.</p>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: ParentFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Create user object
      const newUser = {
        id: `parent-${Date.now()}`,
        email: data.email.toLowerCase().trim(), // Normalize email
        password: data.password.trim(), // Trim password
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: 'parent' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional parent-specific data
        phoneNumber: data.phoneNumber?.trim() || '',
        address: data.address?.trim() || '',
        occupation: data.occupation?.trim() || '',
        emergencyContact: data.emergencyContact?.trim() || '',
        relationship: data.relationship?.trim() || '',
      };

      // Save user using multiple storage methods for reliability
      let saveSuccess = false;
      
      // Method 1: Try API first
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
        
        if (response.ok) {
          console.log('User saved to API successfully');
          saveSuccess = true;
        } else {
          const errorData = await response.json();
          if (errorData.error === 'Email already exists') {
            toast.error('A user with this email already exists');
            return;
          }
          throw new Error('API save failed');
        }
      } catch (apiError) {
        console.log('API not available, trying local storage...');
      }
      
      // Method 2: Save to localStorage (always do this as backup)
      try {
        const localSaved = await saveCreatedUser(newUser);
        if (localSaved) {
          console.log('User saved to localStorage successfully');
          saveSuccess = true;
        } else {
          console.log('Failed to save to localStorage - email might exist');
          if (!saveSuccess) {
            toast.error('A user with this email already exists');
            return;
          }
        }
      } catch (localError) {
        console.log('localStorage save failed:', localError);
      }
      
      // Method 3: Save to shared storage
      try {
        const sharedSaved = await addSharedUser(newUser);
        if (sharedSaved) {
          console.log('User saved to shared storage successfully');
          saveSuccess = true;
        } else {
          console.log('Failed to save to shared storage - email might exist');
        }
      } catch (sharedError) {
        console.log('Shared storage save failed:', sharedError);
      }
      
      if (!saveSuccess) {
        toast.error('Failed to save parent. Please try again.');
        return;
      }
      
      toast.success(`Parent account created successfully!
      
Login Details:
Email: ${data.email}
Password: ${data.password}
Name: ${data.firstName} ${data.lastName}
Phone: ${data.phoneNumber}

The parent can now login with these credentials.
✅ User has been added to the Users management page.
💡 You can link this parent to their children in the Users > Parent-Child Links tab.`);
    } catch (error) {
      toast.error('Failed to register parent');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Parent</h1>
          <p className="text-gray-600">Register a new parent to the school system.</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Login Credentials */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Credentials</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Creating Parent Login</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>You are creating login credentials for this parent. They will use these to access their dashboard and monitor their children's progress.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Login Username)</label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="parent@example.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      placeholder="Create a secure password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      {...register('confirmPassword', { 
                        required: 'Please confirm the password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      placeholder="Confirm the password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      {...register('phoneNumber', { required: 'Phone number is required' })}
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Occupation</label>
                    <input
                      type="text"
                      {...register('occupation')}
                      placeholder="e.g., Engineer, Doctor, Teacher"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship to Student</label>
                    <select
                      {...register('relationship', { required: 'Relationship is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.relationship && (
                      <p className="mt-1 text-sm text-red-600">{errors.relationship.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <input
                      type="tel"
                      {...register('emergencyContact')}
                      placeholder="Alternative contact number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      rows={3}
                      {...register('address', { required: 'Address is required' })}
                      placeholder="Full residential address"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>After creating this parent account, you can link them to their children using the <strong>Users → Parent-Child Links</strong> section.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}