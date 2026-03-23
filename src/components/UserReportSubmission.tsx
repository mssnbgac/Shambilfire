'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReportType, UserReport } from '@/lib/userReportStorage';
import {
  PlusIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'academic', label: 'Academic Report', description: 'Student performance, curriculum, teaching methods' },
  { value: 'financial', label: 'Financial Report', description: 'Budget, expenses, payment issues' },
  { value: 'disciplinary', label: 'Disciplinary Report', description: 'Student behavior, rule violations' },
  { value: 'maintenance', label: 'Maintenance Request', description: 'Facility repairs, equipment issues' },
  { value: 'incident', label: 'Incident Report', description: 'Accidents, emergencies, safety concerns' },
  { value: 'complaint', label: 'Complaint', description: 'Service issues, grievances' },
  { value: 'suggestion', label: 'Suggestion', description: 'Improvements, new ideas' },
  { value: 'general', label: 'General Report', description: 'Other matters not covered above' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export default function UserReportSubmission() {
  const { user } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<UserReport | null>(null);
  const [viewingReport, setViewingReport] = useState<UserReport | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reportType: 'general' as ReportType,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    academicSession: '2024/2025',
    term: 'First Term',
    tags: '',
    isUrgent: false,
  });

  useEffect(() => {
    if (user) {
      loadUserReports();
    }
  }, [user]);

  const loadUserReports = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const reportData = {
        ...formData,
        createdBy: user.id,
        createdByName: `${user.firstName} ${user.lastName}`,
        createdByRole: user.role,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };

      const url = editingReport 
        ? `/api/user-reports?id=${editingReport.id}`
        : '/api/user-reports';
      
      const method = editingReport ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUserReports();
        resetForm();
        alert(editingReport ? 'Report updated successfully!' : 'Report created successfully!');
      } else {
        alert('Error saving report: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (reportId: string) => {
    if (!confirm('Submit this report for admin review? You won\'t be able to edit it after submission.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?id=${reportId}&action=submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUserReports();
        alert('Report submitted for review successfully!');
      } else {
        alert('Error submitting report: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?id=${reportId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await loadUserReports();
        alert('Report deleted successfully!');
      } else {
        alert('Error deleting report: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      reportType: 'general',
      priority: 'medium',
      academicSession: '2024/2025',
      term: 'First Term',
      tags: '',
      isUrgent: false,
    });
    setShowForm(false);
    setEditingReport(null);
  };

  const startEdit = (report: UserReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      content: report.content,
      reportType: report.reportType,
      priority: report.priority,
      academicSession: report.academicSession || '2024/2025',
      term: report.term || 'First Term',
      tags: report.tags?.join(', ') || '',
      isUrgent: report.isUrgent || false,
    });
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityLevel = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityLevel?.color || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Please log in</h2>
        <p className="text-gray-600">You need to be logged in to submit reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reports</h2>
          <p className="text-gray-600">Submit reports to administration for review</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Report
        </button>
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingReport ? 'Edit Report' : 'Create New Report'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => setFormData({ ...formData, reportType: e.target.value as ReportType })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {REPORT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {REPORT_TYPES.find(t => t.value === formData.reportType)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {PRIORITY_LEVELS.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief, descriptive title for your report"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of the issue, situation, or information you want to report..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Session</label>
                  <input
                    type="text"
                    value={formData.academicSession}
                    onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2024/2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (optional)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Comma-separated tags (e.g., urgent, classroom, equipment)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-900">
                  Mark as urgent (requires immediate attention)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingReport ? 'Update Report' : 'Save as Draft')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading && reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
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
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        {report.isUrgent && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Urgent" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                        <span className="text-sm text-gray-500">{report.reportType}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {report.content.substring(0, 150)}
                        {report.content.length > 150 && '...'}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                        {report.submittedAt && (
                          <span> • Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                        )}
                        {report.reviewedAt && (
                          <span> • Reviewed: {new Date(report.reviewedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      
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
                            onClick={() => handleSubmitForReview(report.id)}
                            className="p-2 text-green-400 hover:text-green-600"
                            title="Submit for Review"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {report.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete Report"
                        >
                          <TrashIcon className="h-5 w-5" />
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
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingReport.status)}`}>
                  {viewingReport.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(viewingReport.priority)}`}>
                  {viewingReport.priority}
                </span>
                <span>{viewingReport.reportType}</span>
                {viewingReport.academicSession && (
                  <span>{viewingReport.academicSession} • {viewingReport.term}</span>
                )}
              </div>
            </div>
            
            <div className="prose max-w-none mb-4">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {viewingReport.content}
              </pre>
            </div>
            
            {viewingReport.tags && viewingReport.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {viewingReport.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {viewingReport.reviewComments && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900">Admin Review:</h4>
                <p className="text-blue-800 mt-1">{viewingReport.reviewComments}</p>
                {viewingReport.reviewedByName && (
                  <p className="text-xs text-blue-600 mt-2">
                    Reviewed by {viewingReport.reviewedByName} on {new Date(viewingReport.reviewedAt!).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}