'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getCreatedUsers } from '@/lib/demoUsers';
import Link from 'next/link';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  subjects?: string[];
  classes?: string[];
  employmentDate?: string;
  qualifications?: string;
  createdAt?: Date;
}

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    try {
      // Get created teachers from localStorage
      const createdUsers = getCreatedUsers();
      const createdTeachers = createdUsers
        .filter(user => user.role === 'teacher')
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          subjects: user.subjects || [],
          classes: user.classes || [],
          employmentDate: user.employmentDate,
          qualifications: user.qualifications,
          createdAt: new Date(user.createdAt)
        }));

      // Get hardcoded demo teachers (only if not already in created users)
      const createdEmails = new Set(createdTeachers.map(t => t.email.toLowerCase()));
      const demoTeachers: Teacher[] = [
        {
          id: 'demo-teacher-1',
          firstName: 'Mary',
          lastName: 'Johnson',
          email: 'teacher@shambil.edu.ng',
          phoneNumber: '+234 803 401 2480',
          subjects: ['Mathematics', 'Physics'],
          classes: ['JSS 1A', 'JSS 2B'],
          employmentDate: '2020-09-01',
          qualifications: 'B.Sc Mathematics, M.Ed Educational Technology',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'demo-teacher-2',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@shambil.edu.ng',
          phoneNumber: '+234 807 938 7958',
          subjects: ['English Language', 'Literature'],
          classes: ['SS 1A', 'SS 2A'],
          employmentDate: '2019-08-15',
          qualifications: 'B.A English, PGDE',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'demo-teacher-3',
          firstName: 'Lisa',
          lastName: 'Garcia',
          email: 'lisa.garcia@shambil.edu.ng',
          phoneNumber: '+234 803 401 2480',
          subjects: ['Biology', 'Chemistry'],
          classes: ['JSS 3A', 'SS 1B'],
          employmentDate: '2021-01-10',
          qualifications: 'B.Sc Biology, M.Sc Biochemistry',
          createdAt: new Date('2024-01-01')
        }
      ].filter(demo => !createdEmails.has(demo.email.toLowerCase()));

      // Combine created teachers first, then demo teachers
      const allTeachers = [...createdTeachers, ...demoTeachers];
      setTeachers(allTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.subjects && teacher.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )) ||
    (teacher.classes && teacher.classes.some(className => 
      className.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access teacher management.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
            <p className="text-gray-600">Manage teaching staff and their information.</p>
          </div>
          <Link
            href="/teachers/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Teacher
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search teachers by name, email, subjects, or classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadTeachers}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No teachers match your search' : 'No teachers found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first teacher.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/teachers/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add New Teacher
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  All Teachers ({filteredTeachers.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Teacher
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{teacher.email}</span>
                            {teacher.phoneNumber && (
                              <>
                                <span>•</span>
                                <span>{teacher.phoneNumber}</span>
                              </>
                            )}
                          </div>
                          {teacher.subjects && teacher.subjects.length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Subjects:</span> {teacher.subjects.join(', ')}
                            </div>
                          )}
                          {teacher.classes && teacher.classes.length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Classes:</span> {teacher.classes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {teacher.employmentDate && (
                          <span className="text-xs text-gray-400">
                            Employed {new Date(teacher.employmentDate).toLocaleDateString()}
                          </span>
                        )}
                        {teacher.createdAt && (
                          <span className="text-xs text-gray-400">
                            Added {teacher.createdAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}