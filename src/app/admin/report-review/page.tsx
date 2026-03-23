'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AdminUserReportReview from '@/components/AdminUserReportReview';

export default function AdminReportReviewPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
              <p className="text-red-600">Only administrators can access the report review system.</p>
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
          <AdminUserReportReview />
        </div>
      </div>
    </Layout>
  );
}