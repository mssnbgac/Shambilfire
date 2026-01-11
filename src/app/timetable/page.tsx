'use client';

import Layout from '@/components/Layout';
import TimetableManager from '@/components/TimetableManager';
import { useAuth } from '@/contexts/AuthContext';

export default function TimetablePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <TimetableManager />
      </div>
    </Layout>
  );
}