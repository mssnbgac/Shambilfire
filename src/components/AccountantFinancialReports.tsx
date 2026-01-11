'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { financialReportStorage, FinancialReport } from '@/lib/financialReportStorage';
import { getFinancialOverview } from '@/lib/paymentsStorage';
import { expenditureStorage } from '@/lib/expenditureStorage';
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
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AccountantFinancialReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(null);
  const [viewingReport, setViewingReport] = useState<FinancialReport | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    term: 'First Term' as Term,
    academicSession: '2023/2024',
  });

  useEffect(() => {
    if (user?.role === 'accountant') {
      loadReports();
    }
  }, [user]);

  useEffect(() => {
    if (formData.term && formData.academicSession) {
      loadFinancialDataForReport();
    }
  }, [formData.term, formData.academicSession]);

  const loadReports = () => {
    const userReports = financialReportStorage.getReportsByAccountant(user!.id);
    setReports(userReports);
  };

  const loadFinancialDataForReport = () => {
    try {
      const overview = getFinancialOverview(formData.academicSession, formData.term);
      const expenditures = expenditureStorage.getRequestsBySessionAndTerm(formData.academicSession, formData.term);
      const approvedExpenditures = expenditures.filter(e => e.status === 'approved' || e.status === 'completed');
      const totalExpenditures = approvedExpenditures.reduce((sum, e) => sum + e.amount, 0);
      
      setFinancialData({
        ...overview,
        expenditures: approvedExpenditures,
        totalExpenditures,
        netBalance: overview.totalRevenue - totalExpenditures,
        expenditureCount: approvedExpenditures.length,
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const generateReportTemplate = () => {
    if (!financialData) return '';

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return `# Financial Report - ${formData.term} ${formData.academicSession}

## Executive Summary
This report provides a comprehensive financial overview for the ${formData.term} of the ${formData.academicSession} academic session at Shambil Pride Academy.

## Revenue Summary
- **Total School Fees Collected**: ${formatCurrency(financialData.totalRevenue)}
- **Number of Payments Processed**: ${financialData.totalPayments} payments
- **Average Payment Amount**: ${formatCurrency(financialData.averagePayment)}
- **Collection Rate**: 100% of confirmed payments

### Payment Methods Breakdown
${Object.entries(financialData.paymentMethods || {}).map(([method, amount]) => 
  `- **${method}**: ${formatCurrency(amount as number)}`
).join('\n')}

## Expenditure Summary
- **Total Approved Expenditures**: ${formatCurrency(financialData.totalExpenditures)}
- **Number of Expenditure Items**: ${financialData.expenditureCount}
${financialData.expenditures.length > 0 ? `
### Major Expenditures:
${financialData.expenditures.map((exp: any) => 
  `- **${exp.title}**: ${formatCurrency(exp.amount)} (${exp.category})`
).join('\n')}` : '- No expenditures recorded for this period'}

## Financial Position
- **Net Available Funds**: ${formatCurrency(financialData.netBalance)}
- **Budget Utilization**: ${financialData.totalRevenue > 0 ? ((financialData.totalExpenditures / financialData.totalRevenue) * 100).toFixed(1) : 0}% of revenue spent on approved expenditures
- **Cash Flow Status**: ${financialData.netBalance >= 0 ? 'Positive' : 'Negative - Requires Attention'}

## Key Observations
1. ${financialData.totalRevenue > 0 ? 'Revenue collection maintained' : 'No revenue recorded for this period'}
2. ${financialData.totalExpenditures > 0 ? 'Expenditure control measures in place' : 'No expenditures recorded'}
3. ${financialData.netBalance >= 0 ? 'Healthy financial position maintained' : 'Financial deficit requires immediate attention'}

## Recommendations
1. ${financialData.netBalance >= 0 ? 'Continue current financial management practices' : 'Implement cost reduction measures'}
2. ${financialData.totalPayments > 0 ? 'Maintain efficient payment collection processes' : 'Focus on improving payment collection'}
3. Monitor expenditure approvals to ensure budget compliance
4. Plan for next term budget allocation based on current trends

## Conclusion
${financialData.netBalance >= 0 ? 
  'The financial performance shows controlled management with positive cash flow.' : 
  'The financial position requires attention to address the deficit and improve cash flow.'}

---
*Report generated on ${new Date().toLocaleDateString()} by ${user?.firstName} ${user?.lastName}*`;
  };

  const handleCreateReport = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newReport = financialReportStorage.createReport({
      ...formData,
      createdBy: user!.id,
      createdByName: `${user!.firstName} ${user!.lastName}`,
      status: 'draft',
      totalRevenue: financialData?.totalRevenue || 0,
      totalExpenditures: financialData?.totalExpenditures || 0,
      netBalance: financialData?.netBalance || 0,
      paymentCount: financialData?.totalPayments || 0,
      expenditureCount: financialData?.expenditureCount || 0,
    });

    setReports(prev => [newReport, ...prev]);
    resetForm();
    setShowCreateForm(false);
    alert('Financial report created successfully!');
  };

  const handleUpdateReport = () => {
    if (!editingReport || !formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updated = financialReportStorage.updateReport(editingReport.id, {
      ...formData,
      totalRevenue: financialData?.totalRevenue || 0,
      totalExpenditures: financialData?.totalExpenditures || 0,
      netBalance: financialData?.netBalance || 0,
      paymentCount: financialData?.totalPayments || 0,
      expenditureCount: financialData?.expenditureCount || 0,
    });
    
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingReport(null);
      resetForm();
      setShowCreateForm(false);
      alert('Report updated successfully!');
    }
  };

  const handleSubmitReport = (reportId: string) => {
    const updated = financialReportStorage.submitReport(reportId);
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      alert('Financial report submitted for admin review successfully!');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this financial report?')) {
      financialReportStorage.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      term: 'First Term',
      academicSession: '2023/2024',
    });
  };

  const startEdit = (report: FinancialReport) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (user?.role !== 'accountant') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only accountants can access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-600">Create and manage financial reports for admin review</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingReport(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Financial Report
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReport ? 'Edit Financial Report' : 'Create New Financial Report'}
          </h3>
          
          {/* Financial Data Summary */}
          {financialData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Financial Data for {formData.term}, {formData.academicSession}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Revenue:</span>
                  <div className="text-blue-900 font-semibold">{formatCurrency(financialData.totalRevenue)}</div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Expenditures:</span>
                  <div className="text-blue-900 font-semibold">{formatCurrency(financialData.totalExpenditures)}</div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Net Balance:</span>
                  <div className={`font-semibold ${financialData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialData.netBalance)}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Payments:</span>
                  <div className="text-blue-900 font-semibold">{financialData.totalPayments}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., First Term Financial Summary 2023/2024"
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

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, content: generateReportTemplate() }))}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Generate Template
              </button>
              <span className="text-sm text-gray-500 py-2">Click to auto-generate report content based on financial data</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Report Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your detailed financial report here. You can use markdown formatting..."
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
                  resetForm();
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
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Financial Reports</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Financial Reports Yet</h3>
              <p className="text-gray-500 mt-2">Create your first financial report to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(report.status)}
                        <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
                        <div><strong>Period:</strong> {report.term}, {report.academicSession}</div>
                        <div><strong>Revenue:</strong> {formatCurrency(report.totalRevenue || 0)}</div>
                        <div><strong>Expenditures:</strong> {formatCurrency(report.totalExpenditures || 0)}</div>
                        <div className={report.netBalance && report.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <strong>Net Balance:</strong> {formatCurrency(report.netBalance || 0)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        Created: {report.createdAt.toLocaleDateString()}
                        {report.submittedAt && (
                          <span> • Submitted: {report.submittedAt.toLocaleDateString()}</span>
                        )}
                        {report.reviewedAt && (
                          <span> • Reviewed: {report.reviewedAt.toLocaleDateString()}</span>
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
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>{viewingReport.term}</span>
                <span>•</span>
                <span>{viewingReport.academicSession}</span>
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