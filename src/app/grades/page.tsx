'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function GradesPage() {
  const { user } = useAuth();

  if (!user || !['admin', 'teacher', 'student', 'parent', 'exam_officer'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access grades.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades & Results</h1>
          <p className="text-gray-600">
            {user.role === 'student' ? 'View your academic performance and grades.' :
             user.role === 'parent' ? 'View your children\'s academic performance.' :
             'Manage and view student grades and results.'}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No grades available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Grade viewing and management features will be available here.
            </p>
            <div className="mt-6">
              <p className="text-sm text-blue-600">
                🚧 This page is under development
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}