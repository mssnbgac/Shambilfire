'use client';

import Layout from '@/components/Layout';
import AttendanceTracker from '@/components/AttendanceTracker';
import { useAuth } from '@/contexts/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <AttendanceTracker />
      </div>
    </Layout>
  );
}