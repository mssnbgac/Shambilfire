'use client';

import Layout from '@/components/Layout';
import ResultEntryForm from '@/components/ResultEntryForm';
import { useAuth } from '@/contexts/AuthContext';

export default function ResultsPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'teacher' && user.role !== 'exam_officer' && user.role !== 'admin')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Entry</h1>
          <p className="text-gray-600">Enter and manage student examination results.</p>
        </div>
        
        <ResultEntryForm />
      </div>
    </Layout>
  );
}