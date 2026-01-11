'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import { ACADEMIC_SESSIONS } from '@/lib/academicSessions';
import { saveClass } from '@/lib/classStorage';
import { getUsersByRole } from '@/lib/userManagement';
import { useState, useEffect } from 'react';
import { CreatedUser } from '@/lib/demoUsers';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ClassFormData {
  name: string;
  level: string;
  section: string;
  academicYear: string;
  capacity: number;
  subjects: string[];
  description: string;
  classTeacherId: string;
}

export default function NewClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<CreatedUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClassFormData>({
    defaultValues: {
      academicYear: '2023/2024'
    }
  });

  const watchLevel = watch('level');
  const watchSection = watch('section');

  useEffect(() => {
    // Load teachers for class teacher assignment
    const allTeachers = getUsersByRole('teacher');
    setTeachers(allTeachers);
  }, []);

  useEffect(() => {
    // Auto-generate class name when level and section change
    if (watchLevel && watchSection) {
      setValue('name', `${watchLevel}${watchSection}`);
    } else if (watchLevel) {
      setValue('name', watchLevel);
    }
  }, [watchLevel, watchSection, setValue]);

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can create new classes.</p>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: ClassFormData) => {
    try {
      setLoading(true);
      
      // Find selected teacher
      const selectedTeacher = teachers.find(t => t.id === data.classTeacherId);
      
      // Prepare class data
      const classData = {
        name: data.name,
        level: data.level,
        section: data.section || '',
        academicYear: data.academicYear,
        capacity: Number(data.capacity),
        currentEnrollment: 0, // New classes start with 0 enrollment
        subjects: data.subjects,
        description: data.description,
        classTeacher: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : undefined,
        classTeacherId: data.classTeacherId || undefined
      };

      // Save the class
      const newClass = saveClass(classData);
      
      toast.success(`Class "${newClass.name}" created successfully!`);
      
      // Redirect to classes page
      router.push('/classes');
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast.error(error.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
          <p className="text-gray-600">Set up a new class for the academic year.</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level</label>
                    <select
                      {...register('level', { required: 'Class level is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class Level</option>
                      {NIGERIAN_CLASSES.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                    {errors.level && (
                      <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <select
                      {...register('section')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No Section</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Class name is required' })}
                      placeholder="e.g., JSS 1A, SS 2B"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <select
                      {...register('academicYear', { required: 'Academic year is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ACADEMIC_SESSIONS.map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                    {errors.academicYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      {...register('capacity', { 
                        required: 'Class capacity is required',
                        min: { value: 1, message: 'Capacity must be at least 1' },
                        max: { value: 50, message: 'Capacity cannot exceed 50' }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.capacity && (
                      <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Teacher</label>
                    <select
                      {...register('classTeacherId')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      {...register('description')}
                      placeholder="Optional description for the class"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subjects</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                  {NIGERIAN_SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        value={subject}
                        {...register('subjects', { required: 'At least one subject is required' })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
                {errors.subjects && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Select the subjects that will be taught in this class.
                </p>
              </div>

              {/* Demo Mode Notice */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Class Creation System</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>This form is fully functional and will create a new class with proper data storage.</p>
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
                  disabled={loading}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Class'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}