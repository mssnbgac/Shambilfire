'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { NIGERIAN_CLASSES } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  class: string;
  parentEmail: string;
  parentPhone: string;
  phoneNumber: string;
  address: string;
  bloodGroup: string;
  medicalConditions: string;
}

export default function NewStudentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<StudentFormData>();
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
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const currentYear = new Date().getFullYear();
    const admissionNumber = `SPA/${currentYear}/${String(Date.now()).slice(-6)}`;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.toLowerCase().trim(),
          password: data.password.trim(),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          role: 'student',
          admissionNumber,
          dateOfBirth: data.dateOfBirth,
          class: data.class,
          parentEmail: data.parentEmail.toLowerCase().trim(),
          parentPhone: data.parentPhone?.trim() || '',
          phoneNumber: data.phoneNumber?.trim() || '',
          address: data.address?.trim() || '',
          bloodGroup: data.bloodGroup || '',
          medicalConditions: data.medicalConditions?.trim() || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === 'Email already exists') {
          toast.error('A user with this email already exists');
        } else {
          toast.error(err.error || 'Failed to register student');
        }
        return;
      }

      toast.success(
        `Student registered!\n\nName: ${data.firstName} ${data.lastName}\nAdmission: ${admissionNumber}\nClass: ${data.class}\nEmail: ${data.email}\nPassword: ${data.password}`
      );
      router.push('/students');
    } catch (error) {
      toast.error('Failed to register student. Please try again.');
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Login Username)</label>
                    <input type="email" {...register('email', { required: 'Email is required' })}
                      placeholder="student@shambil.edu.ng"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                      placeholder="Create a secure password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" {...register('confirmPassword', { required: 'Please confirm the password', validate: v => v === password || 'Passwords do not match' })}
                      placeholder="Confirm the password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" {...register('firstName', { required: 'First name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" {...register('lastName', { required: 'Last name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select {...register('class', { required: 'Class is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Class</option>
                      {NIGERIAN_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.class && <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Email</label>
                    <input type="email" {...register('parentEmail', { required: 'Parent email is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.parentEmail && <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
                    <input type="tel" {...register('parentPhone')}
                      placeholder="Parent/Guardian phone number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" {...register('phoneNumber')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                    <select {...register('bloodGroup')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Blood Group</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea rows={3} {...register('address')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                    <textarea rows={2} {...register('medicalConditions')} placeholder="Any known medical conditions or allergies"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => window.history.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
