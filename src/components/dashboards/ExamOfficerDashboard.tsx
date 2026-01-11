'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ExamStats {
  totalExams: number;
  pendingResults: number;
  completedResults: number;
  studentsExamined: number;
  upcomingExams: any[];
  recentActivities: any[];
  gradeDistribution: any[];
}

export default function ExamOfficerDashboard() {
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    pendingResults: 0,
    completedResults: 0,
    studentsExamined: 0,
    upcomingExams: [],
    recentActivities: [],
    gradeDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      // Mock data for demonstration
      const mockStats: ExamStats = {
        totalExams: 45,
        pendingResults: 12,
        completedResults: 33,
        studentsExamined: 1250,
        upcomingExams: [
          { 
            id: '1', 
            subject: 'Mathematics', 
            class: 'JSS 2A', 
            date: '2024-02-15', 
            time: '9:00 AM',
            duration: '2 hours',
            venue: 'Hall A'
          },
          { 
            id: '2', 
            subject: 'English Language', 
            class: 'SS 3B', 
            date: '2024-02-16', 
            time: '10:00 AM',
            duration: '3 hours',
            venue: 'Hall B'
          },
          { 
            id: '3', 
            subject: 'Physics', 
            class: 'SS 2A', 
            date: '2024-02-17', 
            time: '9:00 AM',
            duration: '2.5 hours',
            venue: 'Lab 1'
          },
        ],
        recentActivities: [
          { type: 'result_entry', description: 'Results entered for JSS 1A Mathematics', time: '2 hours ago' },
          { type: 'exam_scheduled', description: 'Mid-term exam scheduled for SS 3', time: '5 hours ago' },
          { type: 'result_published', description: 'First term results published for JSS 2', time: '1 day ago' },
        ],
        gradeDistribution: [
          { grade: 'A', count: 245, percentage: 19.6 },
          { grade: 'B', count: 387, percentage: 31.0 },
          { grade: 'C', count: 298, percentage: 23.8 },
          { grade: 'D', count: 201, percentage: 16.1 },
          { grade: 'F', count: 119, percentage: 9.5 },
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Exams',
      value: stats.totalExams,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      description: 'This academic year'
    },
    {
      name: 'Pending Results',
      value: stats.pendingResults,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      description: 'Awaiting entry'
    },
    {
      name: 'Completed Results',
      value: stats.completedResults,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      description: 'Published results'
    },
    {
      name: 'Students Examined',
      value: stats.studentsExamined,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      description: 'Total examinations'
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Officer Dashboard</h1>
        <p className="text-gray-600">Examination management and results processing for Shambil Pride Academy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                    <dd className="text-xs text-gray-500">{card.description}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <CalendarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <a href="/exams" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Schedule Exam
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create new examination schedules.
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <a href="/results" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Enter Results
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Input and manage exam results.
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <DocumentTextIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <a href="/reports?tab=exam-reports" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    My Reports
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create and manage term reports.
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <a href="/reports" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Performance Analytics
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View detailed performance metrics.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Exams & Grade Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Exams</h3>
            </div>
            <div className="space-y-4">
              {stats.upcomingExams.map((exam) => (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{exam.subject}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {exam.class}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>📅 {new Date(exam.date).toLocaleDateString()}</div>
                    <div>🕐 {exam.time}</div>
                    <div>⏱️ {exam.duration}</div>
                    <div>📍 {exam.venue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Grade Distribution</h3>
            <div className="space-y-3">
              {stats.gradeDistribution.map((grade) => (
                <div key={grade.grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      grade.grade === 'A' ? 'bg-green-500' :
                      grade.grade === 'B' ? 'bg-blue-500' :
                      grade.grade === 'C' ? 'bg-yellow-500' :
                      grade.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      {grade.grade}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Grade {grade.grade}</p>
                      <p className="text-xs text-gray-500">{grade.count} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{grade.percentage}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          grade.grade === 'A' ? 'bg-green-500' :
                          grade.grade === 'B' ? 'bg-blue-500' :
                          grade.grade === 'C' ? 'bg-yellow-500' :
                          grade.grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grade.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {stats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'result_entry' ? 'bg-blue-100' :
                    activity.type === 'exam_scheduled' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'result_entry' ? (
                      <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600" />
                    ) : activity.type === 'exam_scheduled' ? (
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Reminders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Alerts & Reminders</h3>
          <div className="space-y-3">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Result Entry
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>12 exam results are pending entry. Deadline: February 20, 2024</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Upcoming Exam Week
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Mid-term examinations begin in 3 days. Ensure all preparations are complete.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}