'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reportStorage, ExamOfficerReport } from '@/lib/reportStorage';
import { ACADEMIC_SESSIONS, TERMS, Term } from '@/lib/academicSessions';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ExamOfficerReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ExamOfficerReport[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ExamOfficerReport | null>(null);
  const [viewingReport, setViewingReport] = useState<ExamOfficerReport | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    term: 'First Term' as Term,
    academicSession: '2023/2024',
  });

  useEffect(() => {
    if (user?.role === 'exam_officer') {
      loadReports();
    }
  }, [user]);

  const loadReports = () => {
    const userReports = reportStorage.getReportsByExamOfficer(user!.id);
    setReports(userReports);
  };

  const handleCreateReport = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newReport = reportStorage.createReport({
      ...formData,
      createdBy: user!.id,
      status: 'draft',
    });

    setReports(prev => [newReport, ...prev]);
    setFormData({
      title: '',
      content: '',
      term: 'First Term',
      academicSession: '2023/2024',
    });
    setShowCreateForm(false);
  };

  const handleUpdateReport = () => {
    if (!editingReport || !formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updated = reportStorage.updateReport(editingReport.id, formData);
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingReport(null);
      setFormData({
        title: '',
        content: '',
        term: 'First Term',
        academicSession: '2023/2024',
      });
    }
  };

  const handleSubmitReport = (reportId: string) => {
    const updated = reportStorage.submitReport(reportId);
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      alert('Report submitted for admin review successfully!');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      reportStorage.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const startEdit = (report: ExamOfficerReport) => {
    if (report.status !== 'draft' && report.status !== 'rejected') {
      alert('Only draft or rejected reports can be edited');
      return;
    }
    setEditingReport(report);
    setFormData({
      title: report.title,
      content: report.content,
      term: report.term,
      academicSession: report.academicSession,
    });
    setShowCreateForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      case 'submitted':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'exam_officer') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only exam officers can access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Officer Reports</h2>
          <p className="text-gray-600">Create and manage term reports for admin review</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingReport(null);
            setFormData({
              title: '',
              content: '',
              term: 'First Term',
              academicSession: '2023/2024',
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Report
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReport ? 'Edit Report' : 'Create New Report'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., First Term Examination Analysis 2023/2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value as Term }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {TERMS.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Session</label>
                <select
                  value={formData.academicSession}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicSession: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ACADEMIC_SESSIONS.map(session => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Report Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your detailed report here. You can use markdown formatting..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Tip: Use markdown formatting for better structure (# for headings, ** for bold, etc.)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={editingReport ? handleUpdateReport : handleCreateReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingReport ? 'Update Report' : 'Save as Draft'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingReport(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Reports</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Reports Yet</h3>
              <p className="text-gray-500 mt-2">Create your first report to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.term} • {report.academicSession}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {report.createdAt.toLocaleDateString()}
                        {report.submittedAt && (
                          <span> • Submitted: {report.submittedAt.toLocaleDateString()}</span>
                        )}
                      </p>
                      {report.reviewComments && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-700">Admin Comments:</p>
                          <p className="text-sm text-gray-600">{report.reviewComments}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setViewingReport(report)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {(report.status === 'draft' || report.status === 'rejected') && (
                        <>
                          <button
                            onClick={() => startEdit(report)}
                            className="p-2 text-blue-400 hover:text-blue-600"
                            title="Edit Report"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Delete Report"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {report.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitReport(report.id)}
                          className="p-2 text-green-400 hover:text-green-600"
                          title="Submit for Review"
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Report Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{viewingReport.title}</h3>
              <button
                onClick={() => setViewingReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{viewingReport.term}</span>
                <span>•</span>
                <span>{viewingReport.academicSession}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingReport.status)}`}>
                  {viewingReport.status}
                </span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {viewingReport.content}
              </pre>
            </div>
            
            {viewingReport.reviewComments && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900">Admin Review Comments:</h4>
                <p className="text-blue-800 mt-1">{viewingReport.reviewComments}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}