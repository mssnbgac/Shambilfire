'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import AccountantDashboard from '@/components/dashboards/AccountantDashboard';
import ExamOfficerDashboard from '@/components/dashboards/ExamOfficerDashboard';
import { getDashboardRoleForOffice } from '@/lib/teacherOffices';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Debug: Log user data to console
  console.log('Dashboard - Current user:', user);
  console.log('Dashboard - User role:', user.role);
  console.log('Dashboard - User role type:', typeof user.role);

  const renderDashboard = () => {
    // For teachers with administrative offices, redirect to appropriate dashboard
    if (user.role === 'teacher' && user.office && user.office !== 'none') {
      const dashboardRole = getDashboardRoleForOffice(user.office);
      
      switch (dashboardRole) {
        case 'exam_officer':
          return <ExamOfficerDashboard />;
        case 'accountant':
          return <AccountantDashboard />;
        case 'admin':
          return <AdminDashboard />;
        default:
          return <TeacherDashboard />;
      }
    }
    
    // Regular role-based dashboard
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      case 'exam_officer':
        return <ExamOfficerDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Unknown Role</h2>
            <p className="text-gray-600">Your account role is not recognized. Please contact the administrator.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-semibold">Debug Information:</h3>
              <p><strong>User Role:</strong> "{user.role}"</p>
              <p><strong>Role Type:</strong> {typeof user.role}</p>
              <p><strong>User Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Full User Object:</strong></p>
              <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
}