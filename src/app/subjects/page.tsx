'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { NIGERIAN_SUBJECTS } from '@/types';

export default function SubjectsPage() {
  const { user } = useAuth();

  if (!user || !['admin', 'teacher'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access subject management.</p>
        </div>
      </Layout>
    );
  }

  const subjectCategories = {
    core: NIGERIAN_SUBJECTS.slice(0, 10),
    science: NIGERIAN_SUBJECTS.slice(10, 17),
    arts: NIGERIAN_SUBJECTS.slice(17, 26),
    commercial: NIGERIAN_SUBJECTS.slice(26, 31),
    technical: NIGERIAN_SUBJECTS.slice(31)
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600">Nigerian curriculum subjects available in the school.</p>
          </div>
          {user.role === 'admin' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add Custom Subject
            </button>
          )}
        </div>

        {/* Subject Categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Object.entries(subjectCategories).map(([category, subjects]) => (
            <div key={category} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {category} Subjects
                </h3>
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <div key={subject} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{subject}</span>
                      <span className="text-xs text-gray-500">
                        {category.toUpperCase().substring(0, 3)}{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Nigerian Curriculum</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Total of {NIGERIAN_SUBJECTS.length} subjects covering all categories: 
                  Core ({subjectCategories.core.length}), 
                  Science ({subjectCategories.science.length}), 
                  Arts ({subjectCategories.arts.length}), 
                  Commercial ({subjectCategories.commercial.length}), 
                  and Technical ({subjectCategories.technical.length}) subjects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}