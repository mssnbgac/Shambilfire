'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { getChildrenByParent } from '@/lib/parentChildLinking';
import { getGradesByStudent } from '@/lib/gradesStorage';
import { getPaymentsByStudent } from '@/lib/paymentsStorage';
import { getAllUsers } from '@/lib/userManagement';
import { CreatedUser } from '@/lib/demoUsers';
import toast from 'react-hot-toast';

interface ChildData {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  averageGrade: number;
  attendance: number;
  recentGrades: any[];
  totalFeesPaid: number;
  pendingFees: number;
  studentInfo: CreatedUser | null;
}

interface ParentStats {
  children: ChildData[];
  totalFeesPaid: number;
  pendingFees: number;
  unreadMessages: number;
  upcomingEvents: any[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    children: [],
    totalFeesPaid: 0,
    pendingFees: 0,
    unreadMessages: 0,
    upcomingEvents: []
  });
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [showChildDetails, setShowChildDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'parent') {
      fetchParentData();
    }
  }, [user]);

  // Listen for real-time user data updates
  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      const { userId, updates } = event.detail;
      
      // Check if any of our children were updated
      const childLinks = getChildrenByParent(user?.id || '');
      const isChildUpdated = childLinks.some(link => link.childId === userId);
      
      if (isChildUpdated) {
        // Refresh parent data to show updated child information
        fetchParentData();
        toast.success('Child information has been updated');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener);
      
      return () => {
        window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener);
      };
    }
  }, [user]);

  const fetchParentData = async () => {
    try {
      if (!user) return;

      // Get children linked to this parent
      const childLinks = getChildrenByParent(user.id);
      const allUsers = getAllUsers();
      
      const childrenData: ChildData[] = [];
      let totalPaid = 0;
      let totalPending = 0;

      for (const link of childLinks) {
        // Get student info
        const studentInfo = allUsers.find(u => u.id === link.childId) || null;
        
        // Get grades for this child
        const grades = getGradesByStudent(link.childId);
        const recentGrades = grades.slice(0, 5);
        
        // Calculate average grade
        const totalScore = grades.reduce((sum, grade) => sum + (grade.total || 0), 0);
        const averageGrade = grades.length > 0 ? Math.round(totalScore / grades.length) : 0;
        
        // Get payments for this child
        const payments = getPaymentsByStudent(link.childId);
        const childFeesPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Mock pending fees (in real system, this would come from fee structure)
        const mockPendingFees = Math.max(0, 150000 - childFeesPaid);
        
        totalPaid += childFeesPaid;
        totalPending += mockPendingFees;

        childrenData.push({
          id: link.childId,
          name: link.childName,
          admissionNumber: link.childAdmissionNumber,
          class: link.childClass,
          averageGrade,
          attendance: 95, // Mock attendance
          recentGrades: recentGrades.map(grade => ({
            subject: grade.subjectName,
            score: grade.total,
            grade: grade.grade
          })),
          totalFeesPaid: childFeesPaid,
          pendingFees: mockPendingFees,
          studentInfo
        });
      }

      setStats({
        children: childrenData,
        totalFeesPaid: totalPaid,
        pendingFees: totalPending,
        unreadMessages: 2, // Mock unread messages
        upcomingEvents: [
          { title: 'Parent-Teacher Conference', date: '2024-02-20', type: 'meeting' },
          { title: 'Mid-term Exams Begin', date: '2024-02-15', type: 'exam' },
          { title: 'School Sports Day', date: '2024-03-01', type: 'event' }
        ]
      });
    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast.error('Failed to load children data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChildDetails = (child: ChildData) => {
    setSelectedChild(child);
    setShowChildDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (stats.children.length === 0) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">No Children Linked</h2>
        <p className="text-gray-600">
          No children have been linked to your parent account. Please contact the school administrator 
          to link your children to your account.
        </p>
        <div className="mt-6">
          <a
            href="/messages"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Contact Administrator
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Monitor your {stats.children.length} {stats.children.length === 1 ? 'child\'s' : 'children\'s'} academic progress and school activities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/messages"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Messages
                {stats.unreadMessages > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats.children.map((child) => (
          <div key={child.id} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{child.name}</h3>
                  <p className="text-green-100">{child.class} • {child.admissionNumber}</p>
                </div>
                <button
                  onClick={() => handleViewChildDetails(child)}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{child.averageGrade}%</div>
                  <div className="text-sm text-gray-600">Average Grade</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{child.attendance}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Grades</h4>
                <div className="space-y-2">
                  {child.recentGrades.slice(0, 3).map((grade, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{grade.subject}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{grade.score}%</span>
                        <span className="px-2 py-1 bg-gray-200 rounded text-xs">{grade.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(child.totalFeesPaid)}</div>
                  <div className="text-xs text-gray-600">Fees Paid</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{formatCurrency(child.pendingFees)}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Overall Financial Overview</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Total Fees Paid</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(stats.totalFeesPaid)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Pending Fees</p>
                  <p className="text-lg font-bold text-yellow-900">{formatCurrency(stats.pendingFees)}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Total Fees</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(stats.totalFeesPaid + stats.pendingFees)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/grades"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View All Grades
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check detailed academic performance for all children.
                </p>
              </div>
            </a>

            <a
              href="/messages"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Contact School
                  {stats.unreadMessages > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {stats.unreadMessages} new
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Send messages to teachers and administrators.
                </p>
              </div>
            </a>

            <a
              href="/finance"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Fee Payment
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Pay school fees and view payment history.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            {stats.upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{event.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Child Details Modal */}
      {showChildDetails && selectedChild && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedChild.name} - Detailed View</h3>
              <button
                onClick={() => setShowChildDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Student Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Full Name</p>
                      <p className="text-sm text-gray-600">{selectedChild.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Class</p>
                      <p className="text-sm text-gray-600">{selectedChild.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admission Number</p>
                      <p className="text-sm text-gray-600">{selectedChild.admissionNumber}</p>
                    </div>
                  </div>

                  {selectedChild.studentInfo && (
                    <>
                      {selectedChild.studentInfo.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                            <p className="text-sm text-gray-600">{selectedChild.studentInfo.dateOfBirth}</p>
                          </div>
                        </div>
                      )}

                      {selectedChild.studentInfo.address && (
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Address</p>
                            <p className="text-sm text-gray-600">{selectedChild.studentInfo.address}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Academic Performance */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Performance</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedChild.averageGrade}%</div>
                    <div className="text-sm text-gray-600">Average Grade</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedChild.attendance}%</div>
                    <div className="text-sm text-gray-600">Attendance</div>
                  </div>
                </div>

                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3">Recent Grades</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedChild.recentGrades.map((grade, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{grade.subject}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{grade.score}%</span>
                          <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">{grade.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">{formatCurrency(selectedChild.totalFeesPaid)}</div>
                  <div className="text-sm text-gray-600">Fees Paid</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-yellow-600">{formatCurrency(selectedChild.pendingFees)}</div>
                  <div className="text-sm text-gray-600">Pending Fees</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(selectedChild.totalFeesPaid + selectedChild.pendingFees)}</div>
                  <div className="text-sm text-gray-600">Total Fees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}