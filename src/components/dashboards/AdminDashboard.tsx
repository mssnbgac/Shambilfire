'use client';

import React, { useState, useEffect } from 'react';
import QuickActions from '@/components/QuickActions';
import SchoolCalendar from '@/components/SchoolCalendar';
import SystemHealth from '@/components/SystemHealth';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentTextIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  pendingFees: number;
  recentActivities: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    pendingFees: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch students count
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      // Fetch teachers count
      const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      
      // Fetch classes count
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      
      // Fetch subjects count
      const subjectsSnapshot = await getDocs(collection(db, 'subjects'));

      setStats({
        totalStudents: studentsSnapshot.size,
        totalTeachers: teachersSnapshot.size,
        totalClasses: classesSnapshot.size,
        totalSubjects: subjectsSnapshot.size,
        pendingFees: 0, // This would be calculated from fee records
        recentActivities: [] // This would be fetched from activity logs
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
      href: '/students'
    },
    {
      name: 'Total Teachers',
      value: stats.totalTeachers,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      href: '/teachers'
    },
    {
      name: 'Total Classes',
      value: stats.totalClasses,
      icon: BookOpenIcon,
      color: 'bg-purple-500',
      href: '/classes'
    },
    {
      name: 'Total Subjects',
      value: stats.totalSubjects,
      icon: ChartBarIcon,
      color: 'bg-yellow-500',
      href: '/subjects'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                Admin Dashboard 👨‍💼
              </h1>
              <p className="text-blue-100 text-lg">
                Welcome back! Here's what's happening at Shambil Pride Academy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/homepage-manager"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                Manage Homepage
              </a>
              <a
                href="/pdf-demo"
                className="inline-flex items-center px-6 py-3 bg-green-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                PDF Generator
              </a>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.name} className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <CogIcon className="h-6 w-6 mr-3" />
            Quick Actions
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/students/new" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <AcademicCapIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Add New Student
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Register a new student to the school system with complete profile information.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full"></div>
            </a>

            <a href="/teachers/new" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-2xl border border-gray-200/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <UserGroupIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  Add New Teacher
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Add a new teacher to the school staff with qualifications and assignments.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-green-100/50 to-transparent rounded-full"></div>
            </a>

            <a href="/classes/new" className="group relative bg-white/50 p-8 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-2xl border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="mb-6">
                <span className="rounded-2xl inline-flex p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BookOpenIcon className="h-8 w-8" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  Create New Class
                </h3>
                <p className="mt-3 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Set up a new class for the academic year with subjects and schedules.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full"></div>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activities & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ClockIcon className="h-6 w-6 mr-3" />
              Recent Activities
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">New student registration completed</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Grade reports generated for Term 1</p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100/50">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Fee payment received</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-3" />
              System Alerts
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border border-yellow-200/50 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-yellow-900">
                      Term End Approaching
                    </h3>
                    <div className="mt-2 text-sm text-yellow-800">
                      <p>First term ends in 2 weeks. Prepare grade reports and assessments.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200/50 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <InformationCircleIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-blue-900">
                      Backup Reminder
                    </h3>
                    <div className="mt-2 text-sm text-blue-800">
                      <p>Weekly system backup scheduled for tonight at 11:00 PM.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Calendar */}
      <SchoolCalendar />

      {/* System Health */}
      <SystemHealth />
    </div>
  );
}