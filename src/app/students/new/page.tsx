'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { NIGERIAN_CLASSES } from '@/types';
import { saveCreatedUser } from '@/lib/demoUsers';
import { addSharedUser } from '@/lib/sharedUserStorage';
import toast from 'react-hot-toast';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  class: string;
  parentEmail: string;
  phoneNumber: string;
  address: string;
  bloodGroup: string;
  medicalConditions: string;
}

export default function NewStudentPage() {
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<StudentFormData>();

  const password = watch('password');

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can add new students.</p>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Generate admission number
      const currentYear = new Date().getFullYear();
      const admissionNumber = `SPA/${currentYear}/${String(Date.now()).slice(-6)}`;

      // Create user object
      const newUser = {
        id: `student-${Date.now()}`,
        email: data.email.toLowerCase().trim(), // Normalize email
        password: data.password.trim(), // Trim password
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: 'student' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Additional student-specific data
        admissionNumber: admissionNumber,
        dateOfBirth: data.dateOfBirth,
        class: data.class,
        parentEmail: data.parentEmail.toLowerCase().trim(),
        phoneNumber: data.phoneNumber?.trim() || '',
        address: data.address?.trim() || '',
        bloodGroup: data.bloodGroup || '',
        medicalConditions: data.medicalConditions?.trim() || '',
      };

      // Save user using API first, then fallback to local storage
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
        } else {
          const errorData = await response.json();
          if (errorData.error === 'Email already exists') {
            toast.error('A user with this email already exists');
            return;
          }
          throw new Error('API save failed');
        }
      } catch (apiError) {
        console.log('API not available, using local storage...');
        // Fallback to local storage
        const saved = saveCreatedUser(newUser);
        if (!saved) {
          toast.error('A user with this email already exists');
          return;
        }
      }

      console.log('New student data:', { ...data, password: '[HIDDEN]' });
      toast.success(`Student account created successfully! 
      
Student Details:
Name: ${data.firstName} ${data.lastName}
Admission Number: ${admissionNumber}
Class: ${data.class}

Login Details:
Email: ${data.email}
Password: ${data.password}

The student can now login with these credentials.
✅ User has been added to the Users management page.`);
    } catch (error) {
      toast.error('Failed to register student');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600">Register a new student to the school system.</p>
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
                      <h3 className="text-sm font-medium text-yellow-800">Creating Student Login</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>You are creating login credentials for this student. They will use these to access their dashboard.</p>
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
                      placeholder="student@shambil.edu.ng"
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
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                      {...register('class', { required: 'Class is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class</option>
                      {NIGERIAN_CLASSES.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                    {errors.class && (
                      <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Email</label>
                    <input
                      type="email"
                      {...register('parentEmail', { required: 'Parent email is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.parentEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      {...register('phoneNumber')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <select
                      {...register('bloodGroup')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Blood Group</option>
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

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      rows={3}
                      {...register('address')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                    <textarea
                      rows={2}
                      {...register('medicalConditions')}
                      placeholder="Any known medical conditions or allergies"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}