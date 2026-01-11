'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ExamOfficerReports from '@/components/ExamOfficerReports';
import AdminReportReview from '@/components/AdminReportReview';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  roles: string[];
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'templates' | 'exam-reports' | 'admin-review'>('templates');

  // Handle URL parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'exam-reports' && user?.role === 'exam_officer') {
      setActiveTab('exam-reports');
    } else if (tab === 'admin-review' && user?.role === 'admin') {
      setActiveTab('admin-review');
    }
  }, [user]);

  if (!user || !['admin', 'teacher', 'exam_officer', 'accountant'].includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access reports.</p>
        </div>
      </Layout>
    );
  }

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'student-grades',
      name: 'Student Grade Report',
      description: 'Individual student performance and grades across all subjects',
      icon: AcademicCapIcon,
      category: 'academic',
      roles: ['admin', 'teacher', 'exam_officer']
    },
    {
      id: 'class-performance',
      name: 'Class Performance Report',
      description: 'Overall class performance analysis and statistics',
      icon: ChartBarIcon,
      category: 'academic',
      roles: ['admin', 'teacher', 'exam_officer']
    },
    {
      id: 'attendance-report',
      name: 'Attendance Report',
      description: 'Student attendance tracking and analysis',
      icon: UserGroupIcon,
      category: 'administrative',
      roles: ['admin', 'teacher']
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue, expenses, and payment status overview',
      icon: CurrencyDollarIcon,
      category: 'financial',
      roles: ['admin', 'accountant']
    },
    {
      id: 'term-report',
      name: 'Term Report Cards',
      description: 'Complete term report cards for all students',
      icon: DocumentTextIcon,
      category: 'academic',
      roles: ['admin', 'teacher', 'exam_officer']
    },
    {
      id: 'teacher-workload',
      name: 'Teacher Workload Report',
      description: 'Teaching assignments and class distribution',
      icon: UserGroupIcon,
      category: 'administrative',
      roles: ['admin']
    },
    {
      id: 'fee-defaulters',
      name: 'Fee Defaulters Report',
      description: 'Students with outstanding fee payments',
      icon: CurrencyDollarIcon,
      category: 'financial',
      roles: ['admin', 'accountant']
    },
    {
      id: 'exam-analysis',
      name: 'Examination Analysis',
      description: 'Detailed analysis of examination results and trends',
      icon: ChartBarIcon,
      category: 'academic',
      roles: ['admin', 'exam_officer']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Reports', count: reportTemplates.length },
    { id: 'academic', name: 'Academic', count: reportTemplates.filter(r => r.category === 'academic').length },
    { id: 'financial', name: 'Financial', count: reportTemplates.filter(r => r.category === 'financial').length },
    { id: 'administrative', name: 'Administrative', count: reportTemplates.filter(r => r.category === 'administrative').length }
  ];

  const filteredReports = reportTemplates.filter(report => {
    const hasAccess = report.roles.includes(user.role);
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return hasAccess && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'administrative':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = (reportId: string) => {
    // In demo mode, just show success message
    console.log(`Generating report: ${reportId}`);
    alert(`Report "${reportTemplates.find(r => r.id === reportId)?.name}" generated successfully!`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for academic and administrative purposes.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 inline mr-2" />
              Report Templates
            </button>
            
            {user.role === 'exam_officer' && (
              <button
                onClick={() => setActiveTab('exam-reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'exam-reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
                My Reports
              </button>
            )}
            
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin-review')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin-review'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                Report Review
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'templates' && (
          <>
            {/* Category Filter */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Report Categories</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedCategory === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                        <div className="text-sm text-gray-600">{category.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Templates */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <report.icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{report.description}</p>
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleGenerateReport(report.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Generate
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Reports Available</h3>
                  <p className="text-gray-500 mt-2">
                    No reports are available for your role in the selected category.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Report Generation */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Report Generation</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Custom Date Range</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">From Date</label>
                        <input
                          type="date"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">To Date</label>
                        <input
                          type="date"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Generate Custom Report
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                        📊 Current Term Summary
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                        📈 Monthly Performance
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                        💰 Financial Overview
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                        👥 Attendance Summary
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                        📄 Export to PDF
                      </button>
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                        📊 Export to Excel
                      </button>
                      <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
                        📋 Export to CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'exam-reports' && user.role === 'exam_officer' && (
          <ExamOfficerReports />
        )}

        {activeTab === 'admin-review' && user.role === 'admin' && (
          <AdminReportReview />
        )}

        {/* Demo Notice */}
      </div>
    </Layout>
  );
}