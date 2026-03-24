'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { PlusIcon, AcademicCapIcon, UsersIcon, PencilIcon, TrashIcon, EyeIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SchoolClass {
  id: string;
  name: string;
  level: string;
  section: string;
  academicYear: string;
  capacity: number;
  currentEnrollment: number;
  subjects: string[];
  description: string;
  classTeacher?: string;
  classTeacherId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && ['admin', 'teacher'].includes(user.role)) loadClasses();
  }, [user]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      } else {
        toast.error('Failed to load classes');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete class "${className}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/classes?id=${classId}`, { method: 'DELETE' });
      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== classId));
        toast.success('Class deleted successfully');
      } else {
        toast.error('Failed to delete class');
      }
    } catch {
      toast.error('Failed to delete class');
    }
  };

  const getEnrollmentStatus = (current: number, capacity: number) => {
    const pct = (current / capacity) * 100;
    if (pct >= 90) return { color: 'text-red-600 bg-red-100', status: 'Full' };
    if (pct >= 75) return { color: 'text-yellow-600 bg-yellow-100', status: 'High' };
    return { color: 'text-green-600 bg-green-100', status: 'Available' };
  };

  if (!user || !['admin', 'teacher'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access class management.</p>
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-gray-600">Manage school classes and their assignments.</p>
          </div>
          {user.role === 'admin' && (
            <Link href="/classes/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />Create New Class
            </Link>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Total Classes</dt>
              <dd className="text-lg font-medium text-gray-900">{classes.length}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
            <UsersIcon className="h-8 w-8 text-green-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Total Students</dt>
              <dd className="text-lg font-medium text-gray-900">{classes.reduce((s, c) => s + c.currentEnrollment, 0)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-400" />
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Available Capacity</dt>
              <dd className="text-lg font-medium text-gray-900">{classes.reduce((s, c) => s + (c.capacity - c.currentEnrollment), 0)}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
                {user.role === 'admin' && (
                  <div className="mt-6">
                    <Link href="/classes/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <PlusIcon className="h-5 w-5 mr-2" />Create New Class
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Class', 'Class Teacher', 'Enrollment', 'Subjects', 'Academic Year', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((cls) => {
                      const status = getEnrollmentStatus(cls.currentEnrollment, cls.capacity);
                      return (
                        <tr key={cls.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                            <div className="text-sm text-gray-500">{cls.level}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.classTeacher || 'Not assigned'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{cls.currentEnrollment}/{cls.capacity}</span>
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.subjects.length} subjects</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.academicYear}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button onClick={() => { setSelectedClass(cls); setShowDetails(true); }} className="text-blue-600 hover:text-blue-900" title="View Details">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {user.role === 'admin' && (
                                <>
                                  <Link href={`/classes/edit/${cls.id}`} className="text-green-600 hover:text-green-900" title="Edit Class">
                                    <PencilIcon className="h-4 w-4" />
                                  </Link>
                                  <button onClick={() => handleDeleteClass(cls.id, cls.name)} className="text-red-600 hover:text-red-900" title="Delete Class">
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && selectedClass && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedClass.name} - Details</h3>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Class Information</h4>
                  {[
                    ['Class Name', selectedClass.name],
                    ['Level & Section', `${selectedClass.level} - Section ${selectedClass.section}`],
                    ['Academic Year', selectedClass.academicYear],
                    ['Class Teacher', selectedClass.classTeacher || 'Not assigned'],
                    ['Enrollment', `${selectedClass.currentEnrollment} / ${selectedClass.capacity} students`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Subjects ({selectedClass.subjects.length})</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {selectedClass.subjects.map((subject, i) => (
                      <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <BookOpenIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
