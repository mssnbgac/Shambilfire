'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
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

// Local type definitions to avoid import issues
type ExpenditureStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type ExpenditureCategory = 
  | 'supplies'
  | 'equipment'
  | 'maintenance'
  | 'utilities'
  | 'salaries'
  | 'transportation'
  | 'events'
  | 'other';

type ExpenditurePriority = 'low' | 'medium' | 'high' | 'urgent';

interface ExpenditureRequest {
  id: string;
  title: string;
  description: string;
  category: ExpenditureCategory;
  priority: ExpenditurePriority;
  amount: number;
  academicSession: string;
  term?: string;
  status: ExpenditureStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  completedAt?: Date;
  notes?: string;
  updatedAt: Date;
}

// Local constants to avoid import issues
const EXPENDITURE_CATEGORIES = [
  { value: 'supplies', label: 'Office Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'events', label: 'Events & Activities' },
  { value: 'other', label: 'Other' },
] as const;

const EXPENDITURE_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

// Local storage functions to avoid import issues
const STORAGE_KEY = 'expenditure_requests';

function loadFromStorage(): ExpenditureRequest[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((req: any) => ({
      ...req,
      requestedAt: req.requestedAt ? new Date(req.requestedAt) : new Date(),
      approvedAt: req.approvedAt ? new Date(req.approvedAt) : undefined,
      completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
      updatedAt: req.updatedAt ? new Date(req.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error('Error loading expenditure requests from storage:', error);
    return [];
  }
}

function saveToStorage(requests: ExpenditureRequest[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving expenditure requests to storage:', error);
  }
}

function approveRequest(
  requestId: string,
  approvedBy: string,
  approvedByName: string,
  notes?: string
): ExpenditureRequest | null {
  const requests = loadFromStorage();
  const index = requests.findIndex(req => req.id === requestId);
  
  if (index === -1) return null;
  
  requests[index] = {
    ...requests[index],
    status: 'approved',
    approvedBy,
    approvedByName,
    approvedAt: new Date(),
    notes,
    updatedAt: new Date(),
  };
  
  saveToStorage(requests);
  return requests[index];
}

function rejectRequest(
  requestId: string,
  rejectedBy: string,
  rejectedByName: string,
  reason: string
): ExpenditureRequest | null {
  const requests = loadFromStorage();
  const index = requests.findIndex(req => req.id === requestId);
  
  if (index === -1) return null;
  
  requests[index] = {
    ...requests[index],
    status: 'rejected',
    approvedBy: rejectedBy,
    approvedByName: rejectedByName,
    approvedAt: new Date(),
    rejectedReason: reason,
    updatedAt: new Date(),
  };
  
  saveToStorage(requests);
  return requests[index];
}

function getRequestById(requestId: string): ExpenditureRequest | undefined {
  // First try localStorage
  const requests = loadFromStorage();
  const localRequest = requests.find(req => req.id === requestId);
  if (localRequest) {
    return localRequest;
  }
  
  // If not found in localStorage, we'll need to check API in the component
  return undefined;
}

export default function AdminExpenditureApproval() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExpenditureRequest[]>([]);
  const [selectedSession, setSelectedSession] = useState('2025/2026');
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const interval = setInterval(() => {
      loadRequests();
      loadFinancialData();
    }, 30_000);
    return () => clearInterval(interval);
  }, [user, selectedSession, selectedTerm]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Try API first
      const response = await fetch(`/api/expenditures?session=${selectedSession}`);
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const expenditures = (data.expenditures || []).map((req: any) => ({
          ...req,
          requestedAt: req.requestedAt ? new Date(req.requestedAt) : new Date(),
          approvedAt: req.approvedAt ? new Date(req.approvedAt) : undefined,
          completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
          updatedAt: req.updatedAt ? new Date(req.updatedAt) : new Date(),
        }));
        setRequests(expenditures);
      } else {
        // Fallback to localStorage
        const allRequests = loadFromStorage();
        const sessionRequests = allRequests.filter(req => 
          req.academicSession === selectedSession
        );
        setRequests(sessionRequests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      // Fallback to localStorage on error
      const allRequests = loadFromStorage();
      const sessionRequests = allRequests.filter(req => 
        req.academicSession === selectedSession
      );
      setRequests(sessionRequests);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = async () => {
    try {
      const res = await fetch(
        `/api/finances?session=${encodeURIComponent(selectedSession)}&term=${encodeURIComponent(selectedTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFinancialData(data.financialOverview);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const handleApproveRequest = async (requestId: string, notes?: string) => {
    if (!user) return;

    // First try to find request in current state
    let request = requests.find(r => r.id === requestId);
    
    // If not found in state, try localStorage
    if (!request) {
      request = getRequestById(requestId);
    }
    
    // If still not found, try to fetch from API
    if (!request) {
      try {
        const response = await fetch(`/api/expenditures`);
        if (response.ok) {
          const data = await response.json();
          const allExpenditures = data.expenditures || [];
          request = allExpenditures.find((exp: any) => exp.id === requestId);
        }
      } catch (error) {
        console.error('Error fetching expenditure from API:', error);
      }
    }

    if (!request) {
      alert('Request not found! The expenditure may have been deleted or does not exist.');
      console.error('Request not found:', requestId);
      console.log('Available requests:', requests.map(r => ({ id: r.id, title: r.title })));
      return;
    }

    // Check if there are sufficient funds
    const availableFunds = financialData?.availableFunds ?? (financialData?.totalRevenue ?? 0);
    if (financialData && request.amount > availableFunds) {
      alert(`Insufficient funds! Available: ₦${availableFunds.toLocaleString()}, Requested: ₦${request.amount.toLocaleString()}`);
      return;
    }

    try {
      console.log('Attempting to approve request:', requestId, 'Request data:', request);
      
      // First try to update via API
      const response = await fetch(`/api/expenditures?id=${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approvedBy: user.id,
          approvedByName: `${user.firstName} ${user.lastName}`,
          approvedAt: new Date().toISOString(),
          notes,
        }),
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        
        const updatedRequest = {
          ...data.expenditure,
          requestedAt: new Date(data.expenditure.requestedAt),
          approvedAt: new Date(data.expenditure.approvedAt),
          updatedAt: new Date(data.expenditure.updatedAt),
        };
        
        // Update localStorage as well
        approveRequest(requestId, user.id, `${user.firstName} ${user.lastName}`, notes);
        
        // Update the request in the list
        setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
        
        // Reload financial data to reflect the expenditure
        loadFinancialData();
        
        alert(`Request approved successfully! Amount: ₦${updatedRequest.amount.toLocaleString()}`);
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error approving request via API:', error);
      
      // Fallback to localStorage only
      const approved = approveRequest(
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
        
        alert(`Request approved successfully (saved locally)! Amount: ₦${approved.amount.toLocaleString()}`);
      } else {
        alert('Failed to approve request. The request may not exist or cannot be modified.');
      }
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!user || !reason.trim()) return;

    try {
      // First try to update via API
      const response = await fetch(`/api/expenditures?id=${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          approvedBy: user.id,
          approvedByName: `${user.firstName} ${user.lastName}`,
          approvedAt: new Date().toISOString(),
          rejectedReason: reason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedRequest = {
          ...data.expenditure,
          requestedAt: new Date(data.expenditure.requestedAt),
          approvedAt: new Date(data.expenditure.approvedAt),
          updatedAt: new Date(data.expenditure.updatedAt),
        };
        
        // Update localStorage as well
        rejectRequest(requestId, user.id, `${user.firstName} ${user.lastName}`, reason);
        
        // Update the request in the list
        setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
        
        alert('Request rejected successfully!');
      } else {
        throw new Error('Failed to update via API');
      }
    } catch (error) {
      console.error('Error rejecting request via API:', error);
      
      // Fallback to localStorage only
      const rejected = rejectRequest(
        requestId, 
        user.id, 
        `${user.firstName} ${user.lastName}`,
        reason
      );

      if (rejected) {
        setRequests(prev => prev.map(r => r.id === requestId ? rejected : r));
        alert('Request rejected successfully (saved locally)!');
      }
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
    // Use the server-calculated availableFunds (totalRevenue - approvedExpenditures)
    return financialData.availableFunds ?? (financialData.totalRevenue - getApprovedExpenditures());
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenditure Approval</h2>
          <p className="text-gray-600">Review and approve expenditure requests from staff</p>
        </div>
        <button
          onClick={() => { loadRequests(); loadFinancialData(); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
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
                          <strong>Date:</strong> {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'N/A'}
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
                <div><strong>Request Date:</strong> {viewingRequest.requestedAt ? new Date(viewingRequest.requestedAt).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(viewingRequest.status)}`}>{viewingRequest.status}</span></div>
                {viewingRequest.approvedByName && (
                  <div><strong>Reviewed by:</strong> {viewingRequest.approvedByName}</div>
                )}
                {viewingRequest.approvedAt && (
                  <div><strong>Review Date:</strong> {new Date(viewingRequest.approvedAt).toLocaleDateString()}</div>
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