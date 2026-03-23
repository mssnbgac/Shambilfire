'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getClassById, updateClass, SchoolClass } from '@/lib/classStorage';
import { NIGERIAN_CLASSES, NIGERIAN_SUBJECTS } from '@/types';
import toast from 'react-hot-toast';

export default function EditClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    section: '',
    capacity: 30,
    classTeacher: '',
    subjects: [] as string[],
    description: '',
    academicYear: '2024/2025'
  });

  useEffect(() => {
    if (user && user.role === 'admin' && classId) {
      loadClassData();
    }
  }, [user, classId]);

  const loadClassData = () => {
    try {
      const data = getClassById(classId);
      if (data) {
        setClassData(data);
        setFormData({
          name: data.name,
          level: data.level,
          section: data.section,
          capacity: data.capacity,
          classTeacher: data.classTeacher || '',
          subjects: data.subjects,
          description: data.description || '',
          academicYear: data.academicYear
        });
      } else {
        toast.error('Class not found');
        router.push('/classes');
      }
    } catch (error) {
      console.error('Error loading class:', error);
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.subjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    setSubmitting(true);
    try {
      const success = updateClass(classId, {
        name: formData.name,
        level: formData.level,
        section: formData.section,
        capacity: formData.capacity,
        classTeacher: formData.classTeacher,
        subjects: formData.subjects,
        description: formData.description,
        academicYear: formData.academicYear
      });

      if (success) {
        toast.success('Class updated successfully!');
        router.push('/classes');
      } else {
        toast.error('Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can edit classes.</p>
        </div>
      </Layout>
    );
  }

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
          <p className="text-gray-600">Update class information and assignments</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class Name *</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {NIGERIAN_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SS 1">SS 1</option>
                  <option value="SS 2">SS 2</option>
                  <option value="SS 3">SS 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section *</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A, B, C"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class Teacher</label>
                <input
                  type="text"
                  value={formData.classTeacher}
                  onChange={(e) => setFormData(prev => ({ ...prev, classTeacher: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Teacher name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subjects *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {NIGERIAN_SUBJECTS.map(subject => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional class description"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/classes')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Class'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
