'use client';

import Layout from '@/components/Layout';
import LibraryManager from '@/components/LibraryManager';
import { useAuth } from '@/contexts/AuthContext';

export default function LibraryPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <LibraryManager />
      </div>
    </Layout>
  );
}