'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import { ACADEMIC_SESSIONS } from '@/lib/academicSessions';
import { useState, useEffect } from 'react';
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

interface TeacherOption {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClassFormData>({
    defaultValues: { academicYear: '2025/2026' }
  });

  const watchLevel = watch('level');
  const watchSection = watch('section');

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => {
      const allUsers: any[] = d.users || [];
      setTeachers(allUsers.filter(u => u.role === 'teacher').map(u => ({
        id: u.id, firstName: u.firstName, lastName: u.lastName,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (watchLevel && watchSection) setValue('name', `${watchLevel}${watchSection}`);
    else if (watchLevel) setValue('name', watchLevel);
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
    setLoading(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === data.classTeacherId);
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          level: data.level,
          section: data.section || '',
          academicYear: data.academicYear,
          capacity: Number(data.capacity),
          currentEnrollment: 0,
          subjects: data.subjects,
          description: data.description || '',
          classTeacher: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : null,
          classTeacherId: data.classTeacherId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create class');
      }

      const result = await res.json();
      toast.success(`Class "${result.class.name}" created successfully!`);
      router.push('/classes');
    } catch (error: any) {
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
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level</label>
                    <select {...register('level', { required: 'Class level is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Class Level</option>
                      {NIGERIAN_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <select {...register('section')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">No Section</option>
                      {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input type="text" {...register('name', { required: 'Class name is required' })}
                      placeholder="e.g., JSS 1A, SS 2B"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <select {...register('academicYear', { required: 'Academic year is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Capacity</label>
                    <input type="number" min="1" max="50"
                      {...register('capacity', { required: 'Capacity is required', min: { value: 1, message: 'Min 1' }, max: { value: 50, message: 'Max 50' } })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Teacher</label>
                    <select {...register('classTeacherId')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Class Teacher (Optional)</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={3} {...register('description')} placeholder="Optional description"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subjects</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
                  {NIGERIAN_SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input type="checkbox" value={subject} {...register('subjects', { required: 'At least one subject is required' })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
                {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>}
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => window.history.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center">
                  {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</> : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
