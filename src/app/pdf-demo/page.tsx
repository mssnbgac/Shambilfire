'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import PDFGenerator from '@/components/PDFGenerator';
import { useAuth } from '@/contexts/AuthContext';
import {
  DocumentArrowDownIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  IdentificationIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function PDFDemoPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!user || !['admin', 'teacher', 'exam_officer'].includes(user.role)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const pdfTypes = [
    {
      id: 'transcript',
      title: 'Student Transcript',
      description: 'Generate comprehensive academic transcripts with grades, statistics, and official formatting',
      icon: DocumentArrowDownIcon,
      category: 'academic',
      color: 'bg-blue-500',
      features: ['Grade breakdown', 'Academic summary', 'Official signatures', 'School branding']
    },
    {
      id: 'receipt',
      title: 'Payment Receipt',
      description: 'Create professional payment receipts with transaction details and verification',
      icon: CreditCardIcon,
      category: 'financial',
      color: 'bg-green-500',
      features: ['Transaction details', 'Amount in words', 'Payment confirmation', 'Security features']
    },
    {
      id: 'reportCard',
      title: 'Report Card',
      description: 'Complete student report cards with grades, conduct, and teacher comments',
      icon: ChartBarIcon,
      category: 'academic',
      color: 'bg-purple-500',
      features: ['Academic performance', 'Conduct assessment', 'Teacher comments', 'Attendance record']
    },
    {
      id: 'idCard',
      title: 'Student ID Card',
      description: 'Generate official student identification cards in standard format',
      icon: IdentificationIcon,
      category: 'administrative',
      color: 'bg-indigo-500',
      features: ['Student photo area', 'Contact information', 'Security features', 'Compact design']
    },
    {
      id: 'classList',
      title: 'Class List',
      description: 'Comprehensive class rosters with student and parent information',
      icon: UserGroupIcon,
      category: 'administrative',
      color: 'bg-orange-500',
      features: ['Student details', 'Parent contacts', 'Admission numbers', 'Organized layout']
    },
    {
      id: 'attendance',
      title: 'Attendance Sheet',
      description: 'Monthly attendance tracking sheets for teachers',
      icon: ClipboardDocumentListIcon,
      category: 'administrative',
      color: 'bg-teal-500',
      features: ['Monthly calendar', 'Student roster', 'Marking legend', 'Landscape format']
    },
    {
      id: 'timetable',
      title: 'Exam Timetable',
      description: 'Professional examination schedules with venues and instructions',
      icon: CalendarIcon,
      category: 'academic',
      color: 'bg-red-500',
      features: ['Exam schedule', 'Venue information', 'Instructions', 'Multi-class support']
    },
    {
      id: 'staffList',
      title: 'Staff Directory',
      description: 'Complete staff listings with contact and qualification details',
      icon: AcademicCapIcon,
      category: 'administrative',
      color: 'bg-gray-500',
      features: ['Staff details', 'Qualifications', 'Contact info', 'Department organization']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Documents', count: pdfTypes.length },
    { id: 'academic', name: 'Academic', count: pdfTypes.filter(t => t.category === 'academic').length },
    { id: 'administrative', name: 'Administrative', count: pdfTypes.filter(t => t.category === 'administrative').length },
    { id: 'financial', name: 'Financial', count: pdfTypes.filter(t => t.category === 'financial').length }
  ];

  const filteredPDFs = selectedCategory === 'all' 
    ? pdfTypes 
    : pdfTypes.filter(pdf => pdf.category === selectedCategory);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3" />
                PDF Generation Center
              </h1>
              <p className="text-blue-100 mt-2">
                Generate professional school documents with comprehensive styling and branding
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{pdfTypes.length}</div>
              <div className="text-blue-100 text-sm">Document Types</div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PDF Generation Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">Professional Styling</div>
              <div className="text-sm text-gray-600 mt-1">School branding, colors, and layouts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Security Features</div>
              <div className="text-sm text-gray-600 mt-1">Watermarks, signatures, and seals</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold">Data Integration</div>
              <div className="text-sm text-gray-600 mt-1">Dynamic content from school database</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-semibold">Multiple Formats</div>
              <div className="text-sm text-gray-600 mt-1">A4, landscape, ID card sizes</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* PDF Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPDFs.map((pdfType) => {
            const IconComponent = pdfType.icon;
            return (
              <div key={pdfType.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${pdfType.color} p-4`}>
                  <div className="flex items-center text-white">
                    <IconComponent className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">{pdfType.title}</h3>
                      <div className="text-sm opacity-90 capitalize">{pdfType.category}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4">{pdfType.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {pdfType.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    <PDFGenerator
                      type={pdfType.id as any}
                      buttonText="Generate Sample"
                      buttonSize="sm"
                      variant="primary"
                      className="flex-1"
                    />
                    <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use PDF Generation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Select Document Type</h3>
              <p className="text-sm text-gray-600">Choose the type of document you want to generate from the available options.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Provide Data</h3>
              <p className="text-sm text-gray-600">The system will use sample data or integrate with your school's database.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Download PDF</h3>
              <p className="text-sm text-gray-600">Your professionally formatted document will be generated and downloaded automatically.</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Document Standards</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• A4 paper size (210 × 297 mm)</li>
                <li>• Professional typography (Helvetica font family)</li>
                <li>• Consistent color scheme and branding</li>
                <li>• High-quality vector graphics</li>
                <li>• Print-ready resolution</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Watermark protection</li>
                <li>• Digital signatures</li>
                <li>• School seal placeholders</li>
                <li>• Unique document identifiers</li>
                <li>• Tamper-evident design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}