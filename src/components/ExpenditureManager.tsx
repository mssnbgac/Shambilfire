'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  expenditureStorage, 
  ExpenditureRequest, 
  EXPENDITURE_CATEGORIES,
  EXPENDITURE_PRIORITIES,
  ExpenditureCategory,
  ExpenditurePriority
} from '@/lib/expenditureStorage';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function ExpenditureManager() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExpenditureRequest[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ExpenditureRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<ExpenditureRequest | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'supplies' as ExpenditureCategory,
    priority: 'medium' as ExpenditurePriority,
    amount: '',
    academicSession: '2023/2024',
    term: 'First Term',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = () => {
    const userRequests = expenditureStorage.getRequestsByUser(user!.id);
    setRequests(userRequests);
  };

  const handleCreateRequest = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newRequest = expenditureStorage.createRequest({
      ...formData,
      amount,
      requestedBy: user!.id,
      requestedByName: `${user!.firstName} ${user!.lastName}`,
    });

    setRequests(prev => [newRequest, ...prev]);
    resetForm();
    setShowCreateForm(false);
    alert('Expenditure request created successfully!');
  };

  const handleUpdateRequest = () => {
    if (!editingRequest || !formData.title.trim() || !formData.description.trim() || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const updated = expenditureStorage.updateRequest(editingRequest.id, {
      ...formData,
      amount,
    });

    if (updated) {
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      resetForm();
      setEditingRequest(null);
      setShowCreateForm(false);
      alert('Request updated successfully!');
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      expenditureStorage.deleteRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'supplies',
      priority: 'medium',
      amount: '',
      academicSession: '2023/2024',
      term: 'First Term',
      notes: '',
    });
  };

  const startEdit = (request: ExpenditureRequest) => {
    if (request.status !== 'pending' && request.status !== 'rejected') {
      alert('Only pending or rejected requests can be edited');
      return;
    }
    setEditingRequest(request);
    setFormData({
      title: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      amount: request.amount.toString(),
      academicSession: request.academicSession,
      term: request.term || 'First Term',
      notes: request.notes || '',
    });
    setShowCreateForm(true);
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

  if (!user || user.role !== 'accountant') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600">Only accountants can create expenditure requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenditure Requests</h2>
          <p className="text-gray-600">Create and manage your expenditure requests</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingRequest(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingRequest ? 'Edit Request' : 'Create New Expenditure Request'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Request Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., New Computer Laboratory Equipment"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExpenditureCategory }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {EXPENDITURE_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ExpenditurePriority }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {EXPENDITURE_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₦) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {TERMS.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide detailed description of the expenditure request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information or justification..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={editingRequest ? handleUpdateRequest : handleCreateRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingRequest ? 'Update Request' : 'Submit Request'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRequest(null);
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

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Requests</h3>
          
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Requests Yet</h3>
              <p className="text-gray-500 mt-2">Create your first expenditure request to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                        <div><strong>Amount:</strong> {formatCurrency(request.amount)}</div>
                        <div><strong>Category:</strong> {EXPENDITURE_CATEGORIES.find(c => c.value === request.category)?.label}</div>
                        <div><strong>Requested:</strong> {request.requestedAt.toLocaleDateString()}</div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                      
                      {request.rejectedReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                          <p className="text-sm text-red-600">{request.rejectedReason}</p>
                        </div>
                      )}
                      
                      {request.notes && request.status !== 'pending' && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-sm font-medium text-blue-700">Admin Notes:</p>
                          <p className="text-sm text-blue-600">{request.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setViewingRequest(request)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {(request.status === 'pending' || request.status === 'rejected') && (
                        <>
                          <button
                            onClick={() => startEdit(request)}
                            className="p-2 text-blue-400 hover:text-blue-600"
                            title="Edit Request"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Delete Request"
                          >
                            <TrashIcon className="h-5 w-5" />
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
          </div>
        </div>
      )}
    </div>
  );
}