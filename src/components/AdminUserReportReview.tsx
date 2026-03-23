'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserReport } from '@/lib/userReportStorage';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  urgent: number;
  byType: Record<string, number>;
  byRole: Record<string, number>;
}

export default function AdminUserReportReview() {
  const { user } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState<UserReport | null>(null);
  const [reviewingReport, setReviewingReport] = useState<UserReport | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  
  // Filters
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'urgent'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadReports();
      loadStats();
    }
  }, [user, activeTab, statusFilter, typeFilter, roleFilter, searchQuery]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      let url = '/api/user-reports?';
      const params = new URLSearchParams();
      
      if (activeTab === 'pending') {
        params.append('status', 'submitted');
      } else if (activeTab === 'urgent') {
        // We'll filter urgent reports on the frontend
      }
      
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      url += params.toString();
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        let filteredReports = data.reports;
        
        // Filter urgent reports if needed
        if (activeTab === 'urgent') {
          filteredReports = filteredReports.filter((r: UserReport) => 
            r.priority === 'urgent' || r.isUrgent
          );
        }
        
        setReports(filteredReports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/user-reports/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleMarkUnderReview = async (reportId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?id=${reportId}&action=review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          adminName: `${user.firstName} ${user.lastName}`,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadReports();
        await loadStats();
        alert('Report marked as under review');
      } else {
        alert('Error updating report: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string, comments?: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?id=${reportId}&action=approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          adminName: `${user.firstName} ${user.lastName}`,
          comments,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadReports();
        await loadStats();
        setReviewingReport(null);
        setReviewComments('');
        alert('Report approved successfully!');
      } else {
        alert('Error approving report: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Error approving report');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reportId: string, comments: string) => {
    if (!comments.trim()) {
      alert('Please provide comments for rejection');
      return;
    }

    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-reports?id=${reportId}&action=reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          adminName: `${user.firstName} ${user.lastName}`,
          comments,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadReports();
        await loadStats();
        setReviewingReport(null);
        setReviewComments('');
        alert('Report rejected and sent back for revision');
      } else {
        alert('Error rejecting report: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Error rejecting report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      case 'submitted':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
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
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators can access this section.</p>
      </div>
    );
  }

  const pendingCount = stats?.pending || 0;
  const urgentCount = stats?.urgent || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Report Review Center</h2>
        <p className="text-gray-600">Review and manage reports from all users</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Urgent</p>
                <p className="text-2xl font-semibold text-red-600">{stats.urgent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, content, or author..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="disciplinary">Disciplinary</option>
              <option value="maintenance">Maintenance</option>
              <option value="incident">Incident</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="general">General</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="teacher">Teacher</option>
              <option value="exam_officer">Exam Officer</option>
              <option value="accountant">Accountant</option>
              <option value="parent">Parent</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('urgent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'urgent'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Urgent ({urgentCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Reports ({stats?.total || 0})
          </button>
        </nav>
      </div>

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
              <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
              <p className="text-gray-500 mt-2">
                {activeTab === 'pending' 
                  ? 'All reports have been reviewed.' 
                  : 'No reports match your current filters.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(report.status)}
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        {(report.isUrgent || report.priority === 'urgent') && (
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
                        <span className="text-sm text-gray-500">by {report.createdByName} ({report.createdByRole})</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {report.content.substring(0, 200)}
                        {report.content.length > 200 && '...'}
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
                          <p className="text-sm font-medium text-gray-700">Review Comments:</p>
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
                      
                      {report.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleMarkUnderReview(report.id)}
                            className="p-2 text-blue-400 hover:text-blue-600"
                            title="Mark Under Review"
                          >
                            <ClockIcon className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setReviewingReport(report);
                              setReviewComments('');
                            }}
                            className="p-2 text-green-400 hover:text-green-600"
                            title="Review Report"
                          >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {report.status === 'under_review' && (
                        <button
                          onClick={() => {
                            setReviewingReport(report);
                            setReviewComments('');
                          }}
                          className="p-2 text-green-400 hover:text-green-600"
                          title="Complete Review"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
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
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingReport.status)}`}>
                  {viewingReport.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(viewingReport.priority)}`}>
                  {viewingReport.priority}
                </span>
                <span>{viewingReport.reportType}</span>
                <span>by {viewingReport.createdByName} ({viewingReport.createdByRole})</span>
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
                <h4 className="font-medium text-blue-900">Review Comments:</h4>
                <p className="text-blue-800 mt-1">{viewingReport.reviewComments}</p>
                {viewingReport.reviewedByName && (
                  <p className="text-xs text-blue-600 mt-2">
                    Reviewed by {viewingReport.reviewedByName} on {new Date(viewingReport.reviewedAt!).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {(viewingReport.status === 'submitted' || viewingReport.status === 'under_review') && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setViewingReport(null);
                    setReviewingReport(viewingReport);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review This Report
                </button>
                
                {viewingReport.status === 'submitted' && (
                  <button
                    onClick={() => {
                      setViewingReport(null);
                      handleMarkUnderReview(viewingReport.id);
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Mark Under Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Report Modal */}
      {reviewingReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Review Report</h3>
              <button
                onClick={() => {
                  setReviewingReport(null);
                  setReviewComments('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-900">{reviewingReport.title}</h4>
              <p className="text-sm text-gray-600">
                {reviewingReport.reportType} • by {reviewingReport.createdByName} ({reviewingReport.createdByRole})
              </p>
              <p className="text-sm text-gray-600">
                {reviewingReport.academicSession} • {reviewingReport.term}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Review Comments</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add your review comments here..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Comments are optional for approval but required for rejection
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprove(reviewingReport.id, reviewComments)}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Approve Report'}
                </button>
                <button
                  onClick={() => handleReject(reviewingReport.id, reviewComments)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Reject Report'}
                </button>
                <button
                  onClick={() => {
                    setReviewingReport(null);
                    setReviewComments('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}