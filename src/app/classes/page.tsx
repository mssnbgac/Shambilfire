'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getClasses, initializeDemoClasses, deleteClass, SchoolClass } from '@/lib/classStorage';
import { 
  PlusIcon,
  AcademicCapIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && ['admin', 'teacher'].includes(user.role)) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = () => {
    try {
      setLoading(true);
      initializeDemoClasses();
      const allClasses = getClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete class "${className}"? This action cannot be undone.`)) {
      try {
        const success = deleteClass(classId);
        if (success) {
          setClasses(prev => prev.filter(cls => cls.id !== classId));
          toast.success('Class deleted successfully');
        } else {
          toast.error('Failed to delete class');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const handleViewDetails = (classData: SchoolClass) => {
    setSelectedClass(classData);
    setShowDetails(true);
  };

  const getEnrollmentStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-600 bg-red-100', status: 'Full' };
    if (percentage >= 75) return { color: 'text-yellow-600 bg-yellow-100', status: 'High' };
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
            <Link
              href="/classes/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Class
            </Link>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                    <dd className="text-lg font-medium text-gray-900">{classes.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Capacity</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {classes.reduce((sum, cls) => sum + (cls.capacity - cls.currentEnrollment), 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Classes List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new class.
                </p>
                {user.role === 'admin' && (
                  <div className="mt-6">
                    <Link
                      href="/classes/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create New Class
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classes.map((classData) => {
                      const enrollmentStatus = getEnrollmentStatus(classData.currentEnrollment, classData.capacity);
                      return (
                        <tr key={classData.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{classData.name}</div>
                              <div className="text-sm text-gray-500">{classData.level}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {classData.classTeacher || 'Not assigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {classData.currentEnrollment}/{classData.capacity}
                              </div>
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${enrollmentStatus.color}`}>
                                {enrollmentStatus.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {classData.subjects.length} subjects
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{classData.academicYear}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(classData)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {user.role === 'admin' && (
                                <>
                                  <button
                                    className="text-green-600 hover:text-green-900"
                                    title="Edit Class"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClass(classData.id, classData.name)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete Class"
                                  >
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

        {/* Class Details Modal */}
        {showDetails && selectedClass && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedClass.name} - Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Class Information</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Class Name</p>
                      <p className="text-sm text-gray-600">{selectedClass.name}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Level & Section</p>
                      <p className="text-sm text-gray-600">{selectedClass.level} - Section {selectedClass.section}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Academic Year</p>
                      <p className="text-sm text-gray-600">{selectedClass.academicYear}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Class Teacher</p>
                      <p className="text-sm text-gray-600">{selectedClass.classTeacher || 'Not assigned'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">Enrollment</p>
                      <p className="text-sm text-gray-600">
                        {selectedClass.currentEnrollment} / {selectedClass.capacity} students
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(selectedClass.currentEnrollment / selectedClass.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {selectedClass.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Description</p>
                        <p className="text-sm text-gray-600">{selectedClass.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Subjects ({selectedClass.subjects.length})</h4>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {selectedClass.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <BookOpenIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {selectedClass.createdAt.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {selectedClass.updatedAt.toLocaleString()}
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