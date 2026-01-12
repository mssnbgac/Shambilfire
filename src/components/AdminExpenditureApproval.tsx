'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expenditureStorage, 
  ExpenditureRequest, 
  EXPENDITURE_CATEGORIES,
  EXPENDITURE_PRIORITIES
} from '@/lib/expenditureStorage';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import { getFinancialOverview } from '@/lib/paymentsStorage';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function AdminExpenditureApproval() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExpenditureRequest[]>([]);
  const [selectedSession, setSelectedSession] = useState('2023/2024');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [viewingRequest, setViewingRequest] = useState<ExpenditureRequest | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadRequests();
      loadFinancialData();
    }
  }, [user, selectedSession, selectedTerm]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Try API first
      const response = await fetch(`/api/expenditures?session=${selectedSession}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.expenditures || []);
      } else {
        // Fallback to localStorage
        const allRequests = expenditureStorage.getAllRequests();
        const sessionRequests = allRequests.filter(req => 
          req.academicSession === selectedSession
        );
        setRequests(sessionRequests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      // Fallback to localStorage on error
      const allRequests = expenditureStorage.getAllRequests();
      const sessionRequests = allRequests.filter(req => 
        req.academicSession === selectedSession
      );
      setRequests(sessionRequests);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = () => {
    try {
      const overview = getFinancialOverview(selectedSession, selectedTerm);
      setFinancialData(overview);
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const handleApproveRequest = (requestId: string, notes?: string) => {
    if (!user) return;

    const request = expenditureStorage.getRequestById(requestId);
    if (!request) return;

    // Check if there are sufficient funds
    if (financialData && request.amount > financialData.totalRevenue) {
      alert(`Insufficient funds! Available: ₦${financialData.totalRevenue.toLocaleString()}, Requested: ₦${request.amount.toLocaleString()}`);
      return;
    }

    const approved = expenditureStorage.approveRequest(
      requestId, 
      user.id, 
      `${user.firstName} ${user.lastName}`,
      notes
    );

    if (approved) {
      // Update the request in the list
      setRequests(prev => prev.map(r => r.id === requestId ? approved : r));
      
      // Reload financial data to reflect the expenditure
      loadFinancialData();
      
      alert(`Request approved successfully! Amount: ₦${approved.amount.toLocaleString()}`);
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    if (!user || !reason.trim()) return;

    const rejected = expenditureStorage.rejectRequest(
      requestId, 
      user.id, 
      `${user.firstName} ${user.lastName}`,
      reason
    );

    if (rejected) {
      setRequests(prev => prev.map(r => r.id === requestId ? rejected : r));
      alert('Request rejected successfully!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = EXPENDITURE_PRIORITIES.find(p => p.value === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total approved expenditures for the selected session/term
  const getApprovedExpenditures = () => {
    return requests
      .filter(req => req.status === 'approved' || req.status === 'completed')
      .reduce((total, req) => total + req.amount, 0);
  };

  const getAvailableFunds = () => {
    if (!financialData) return 0;
    return financialData.totalRevenue - getApprovedExpenditures();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only administrators can approve expenditure requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Expenditure Approval</h2>
        <p className="text-gray-600">Review and approve expenditure requests from staff</p>
      </div>

      {/* Session and Term Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {ACADEMIC_SESSIONS.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term (for financial data)</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {TERMS.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {financialData && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue ({selectedTerm})</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(financialData.totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved Expenditures</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(getApprovedExpenditures())}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Funds</dt>
                    <dd className={`text-lg font-medium ${getAvailableFunds() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(getAvailableFunds())}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Expenditure Requests ({selectedSession})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Requests Found</h3>
              <p className="text-gray-500 mt-2">
                No expenditure requests for {selectedSession}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(request.status)}
                        <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          <strong>Amount:</strong> {formatCurrency(request.amount)}
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <strong>Category:</strong> {EXPENDITURE_CATEGORIES.find(c => c.value === request.category)?.label}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <strong>Requested by:</strong> {request.requestedByName}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <strong>Date:</strong> {request.requestedAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                      
                      {/* Fund availability check */}
                      {request.status === 'pending' && financialData && (
                        <div className={`p-3 rounded-md mb-3 ${
                          request.amount <= getAvailableFunds() 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {request.amount <= getAvailableFunds() ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span className={`text-sm font-medium ${
                              request.amount <= getAvailableFunds() ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {request.amount <= getAvailableFunds() 
                                ? 'Sufficient funds available' 
                                : `Insufficient funds! Need additional ₦${(request.amount - getAvailableFunds()).toLocaleString()}`
                              }
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {request.rejectedReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                          <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                          <p className="text-sm text-red-600">{request.rejectedReason}</p>
                        </div>
                      )}
                      
                      {request.notes && request.status !== 'pending' && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-700">Admin Notes:</p>
                          <p className="text-sm text-blue-600">{request.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => setViewingRequest(request)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt('Add approval notes (optional):');
                              handleApproveRequest(request.id, notes || undefined);
                            }}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) handleRejectRequest(request.id, reason);
                            }}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
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

      {/* View Request Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{viewingRequest.title}</h3>
              <button
                onClick={() => setViewingRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div><strong>Amount:</strong> {formatCurrency(viewingRequest.amount)}</div>
                <div><strong>Category:</strong> {EXPENDITURE_CATEGORIES.find(c => c.value === viewingRequest.category)?.label}</div>
                <div><strong>Priority:</strong> {viewingRequest.priority}</div>
                <div><strong>Academic Session:</strong> {viewingRequest.academicSession}</div>
                <div><strong>Requested by:</strong> {viewingRequest.requestedByName}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Request Date:</strong> {viewingRequest.requestedAt.toLocaleDateString()}</div>
                <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(viewingRequest.status)}`}>{viewingRequest.status}</span></div>
                {viewingRequest.approvedByName && (
                  <div><strong>Reviewed by:</strong> {viewingRequest.approvedByName}</div>
                )}
                {viewingRequest.approvedAt && (
                  <div><strong>Review Date:</strong> {viewingRequest.approvedAt.toLocaleDateString()}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
              <p className="text-gray-700">{viewingRequest.description}</p>
            </div>
            
            {viewingRequest.notes && viewingRequest.status !== 'pending' && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-900">Admin Notes:</h4>
                <p className="text-blue-800 mt-1">{viewingRequest.notes}</p>
              </div>
            )}
            
            {viewingRequest.rejectedReason && (
              <div className="mb-4 p-3 bg-red-50 rounded">
                <h4 className="font-medium text-red-900">Rejection Reason:</h4>
                <p className="text-red-800 mt-1">{viewingRequest.rejectedReason}</p>
              </div>
            )}

            {viewingRequest.status === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    const notes = prompt('Add approval notes (optional):');
                    handleApproveRequest(viewingRequest.id, notes || undefined);
                    setViewingRequest(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) {
                      handleRejectRequest(viewingRequest.id, reason);
                      setViewingRequest(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
