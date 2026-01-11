'use client';

import Layout from '@/components/Layout';
import MessagingSystem from '@/components/MessagingSystem';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();

  if (!user || !['admin', 'teacher', 'parent', 'student', 'exam_officer', 'accountant'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access messaging.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <MessagingSystem />
      </div>
    </Layout>
  );
}