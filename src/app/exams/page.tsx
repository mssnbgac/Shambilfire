'use client';

import Layout from '@/components/Layout';
import ExamScheduler from '@/components/ExamScheduler';
import { useAuth } from '@/contexts/AuthContext';

export default function ExamsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <ExamScheduler />
      </div>
    </Layout>
  );
}