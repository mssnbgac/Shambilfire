'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import UserReportSubmission from '@/components/UserReportSubmission';

export default function UserReportsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
              <p className="text-gray-600">Please log in to access the reports system.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <UserReportSubmission />
        </div>
      </div>
    </Layout>
  );
}