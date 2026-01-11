'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { financialReportStorage, FinancialReport } from '@/lib/financialReportStorage';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function AdminFinancialReportReview() {
  const { user } = useAuth();
  const [pendingReports, setPendingReports] = useState<FinancialReport[]>([]);
  const [allReports, setAllReports] = useState<FinancialReport[]>([]);
  const [viewingReport, setViewingReport] = useState<FinancialReport | null>(null);
  const [reviewingReport, setReviewingReport] = useState<FinancialReport | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadReports();
    }
  }, [user]);

  const loadReports = () => {
    const pending = financialReportStorage.getPendingReports();
    const all = financialReportStorage.getAllReports();
    setPendingReports(pending);
    setAllReports(all);
  };

  const handleApprove = (reportId: string, comments?: string) => {
    const updated = financialReportStorage.approveReport(
      reportId, 
      user!.id, 
      `${user!.firstName} ${user!.lastName}`,
      comments
    );
    if (updated) {
      loadReports();
      setReviewingReport(null);
      setReviewComments('');
      alert('Financial report approved successfully!');
    }
  };

  const handleReject = (reportId: string, comments: string) => {
    if (!comments.trim()) {
      alert('Please provide comments for rejection');
      return;
    }

    const updated = financialReportStorage.rejectReport(
      reportId, 
      user!.id, 
      `${user!.firstName} ${user!.lastName}`,
      comments
    );
    if (updated) {
      loadReports();
      setReviewingReport(null);
      setReviewComments('');
      alert('Financial report rejected and sent back for revision');
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators can access this section.</p>
      </div>
    );
  }

  const currentReports = activeTab === 'pending' ? pendingReports : allReports;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financial Report Review Center</h2>
        <p className="text-gray-600">Review and approve accountant financial reports</p>
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
            Pending Review ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Reports ({allReports.length})
          </button>
        </nav>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {currentReports.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'pending' ? 'No Pending Financial Reports' : 'No Financial Reports Available'}
              </h3>
              <p className="text-gray-500 mt-2">
                {activeTab === 'pending' 
                  ? 'All financial reports have been reviewed.' 
                  : 'No financial reports have been created yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(report.status)}
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <strong>Period:</strong> {report.term}, {report.academicSession}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <strong>Accountant:</strong> {report.createdByName}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          <strong>Revenue:</strong> {formatCurrency(report.totalRevenue || 0)}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          <strong>Net Balance:</strong> 
                          <span className={report.netBalance && report.netBalance >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                            {formatCurrency(report.netBalance || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Revenue:</span>
                            <div className="font-semibold text-green-600">{formatCurrency(report.totalRevenue || 0)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Expenditures:</span>
                            <div className="font-semibold text-red-600">{formatCurrency(report.totalExpenditures || 0)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Net Balance:</span>
                            <div className={`font-semibold ${report.netBalance && report.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(report.netBalance || 0)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Payments:</span>
                            <div className="font-semibold text-blue-600">{report.paymentCount || 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        Created: {report.createdAt.toLocaleDateString()}
                        {report.submittedAt && (
                          <span> • Submitted: {report.submittedAt.toLocaleDateString()}</span>
                        )}
                        {report.reviewedAt && (
                          <span> • Reviewed: {report.reviewedAt.toLocaleDateString()}</span>
                        )}
                      </p>
                      
                      {report.reviewComments && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-700">Review Comments:</p>
                          <p className="text-sm text-blue-600">{report.reviewComments}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => setViewingReport(report)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {report.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => {
                              setReviewingReport(report);
                              setReviewComments('');
                            }}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => {
                              const comments = prompt('Add approval comments (optional):');
                              handleApprove(report.id, comments || undefined);
                            }}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Quick Approve
                          </button>
                        </>
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
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span>{viewingReport.term}</span>
                <span>•</span>
                <span>{viewingReport.academicSession}</span>
                <span>•</span>
                <span>By {viewingReport.createdByName}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingReport.status)}`}>
                  {viewingReport.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><strong>Revenue:</strong> {formatCurrency(viewingReport.totalRevenue || 0)}</div>
                <div><strong>Expenditures:</strong> {formatCurrency(viewingReport.totalExpenditures || 0)}</div>
                <div className={viewingReport.netBalance && viewingReport.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  <strong>Net Balance:</strong> {formatCurrency(viewingReport.netBalance || 0)}
                </div>
                <div><strong>Payments:</strong> {viewingReport.paymentCount || 0}</div>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {viewingReport.content}
              </pre>
            </div>
            
            {viewingReport.reviewComments && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900">Review Comments:</h4>
                <p className="text-blue-800 mt-1">{viewingReport.reviewComments}</p>
              </div>
            )}

            {viewingReport.status === 'submitted' && (
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
              <h3 className="text-lg font-bold text-gray-900">Review Financial Report</h3>
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
              <p className="text-sm text-gray-600">{reviewingReport.term} • {reviewingReport.academicSession}</p>
              <p className="text-sm text-gray-600">By {reviewingReport.createdByName}</p>
              
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div><strong>Revenue:</strong> {formatCurrency(reviewingReport.totalRevenue || 0)}</div>
                <div><strong>Expenditures:</strong> {formatCurrency(reviewingReport.totalExpenditures || 0)}</div>
                <div className={reviewingReport.netBalance && reviewingReport.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  <strong>Net Balance:</strong> {formatCurrency(reviewingReport.netBalance || 0)}
                </div>
                <div><strong>Payments:</strong> {reviewingReport.paymentCount || 0}</div>
              </div>
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
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Approve Report
                </button>
                <button
                  onClick={() => handleReject(reviewingReport.id, reviewComments)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Reject Report
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