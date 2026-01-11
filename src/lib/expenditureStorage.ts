// Expenditure request storage and management system
import { ACADEMIC_SESSIONS } from './academicSessions';

export type ExpenditureStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ExpenditureCategory = 'infrastructure' | 'equipment' | 'supplies' | 'maintenance' | 'utilities' | 'staff' | 'events' | 'other';
export type ExpenditurePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ExpenditureRequest {
  id: string;
  title: string;
  description: string;
  category: ExpenditureCategory;
  priority: ExpenditurePriority;
  amount: number;
  requestedBy: string; // User ID
  requestedByName: string; // User name for display
  requestedAt: Date;
  status: ExpenditureStatus;
  approvedBy?: string; // Admin ID
  approvedByName?: string; // Admin name
  approvedAt?: Date;
  rejectedReason?: string;
  completedAt?: Date;
  academicSession: string;
  term: string; // Added term field
  attachments?: string[];
  notes?: string;
  updatedAt: Date;
}

// In-memory storage for demo purposes
let expenditureRequests: ExpenditureRequest[] = [];

export const expenditureStorage = {
  // Create a new expenditure request
  createRequest: (request: Omit<ExpenditureRequest, 'id' | 'requestedAt' | 'updatedAt' | 'status'>): ExpenditureRequest => {
    const newRequest: ExpenditureRequest = {
      ...request,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
    };
    expenditureRequests.push(newRequest);
    return newRequest;
  },

  // Get all expenditure requests
  getAllRequests: (): ExpenditureRequest[] => {
    return [...expenditureRequests].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get requests by status
  getRequestsByStatus: (status: ExpenditureStatus): ExpenditureRequest[] => {
    return expenditureRequests.filter(request => request.status === status)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get requests by user
  getRequestsByUser: (userId: string): ExpenditureRequest[] => {
    return expenditureRequests.filter(request => request.requestedBy === userId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get request by ID
  getRequestById: (id: string): ExpenditureRequest | undefined => {
    return expenditureRequests.find(request => request.id === id);
  },

  // Update request
  updateRequest: (id: string, updates: Partial<ExpenditureRequest>): ExpenditureRequest | null => {
    const index = expenditureRequests.findIndex(request => request.id === id);
    if (index === -1) return null;

    expenditureRequests[index] = {
      ...expenditureRequests[index],
      ...updates,
      updatedAt: new Date(),
    };
    return expenditureRequests[index];
  },

  // Approve request
  approveRequest: (id: string, adminId: string, adminName: string, notes?: string): ExpenditureRequest | null => {
    const request = expenditureRequests.find(r => r.id === id);
    if (!request || request.status !== 'pending') return null;

    return expenditureStorage.updateRequest(id, {
      status: 'approved',
      approvedBy: adminId,
      approvedByName: adminName,
      approvedAt: new Date(),
      notes: notes,
    });
  },

  // Reject request
  rejectRequest: (id: string, adminId: string, adminName: string, reason: string): ExpenditureRequest | null => {
    const request = expenditureRequests.find(r => r.id === id);
    if (!request || request.status !== 'pending') return null;

    return expenditureStorage.updateRequest(id, {
      status: 'rejected',
      approvedBy: adminId,
      approvedByName: adminName,
      approvedAt: new Date(),
      rejectedReason: reason,
    });
  },

  // Mark request as completed
  completeRequest: (id: string): ExpenditureRequest | null => {
    const request = expenditureRequests.find(r => r.id === id);
    if (!request || request.status !== 'approved') return null;

    return expenditureStorage.updateRequest(id, {
      status: 'completed',
      completedAt: new Date(),
    });
  },

  // Delete request
  deleteRequest: (id: string): boolean => {
    const index = expenditureRequests.findIndex(request => request.id === id);
    if (index === -1) return false;
    expenditureRequests.splice(index, 1);
    return true;
  },

  // Get requests by category
  getRequestsByCategory: (category: ExpenditureCategory): ExpenditureRequest[] => {
    return expenditureRequests.filter(request => request.category === category)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get requests by academic session
  getRequestsBySession: (academicSession: string): ExpenditureRequest[] => {
    return expenditureRequests.filter(request => request.academicSession === academicSession)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get requests by academic session and term
  getRequestsBySessionAndTerm: (academicSession: string, term: string): ExpenditureRequest[] => {
    return expenditureRequests.filter(request => 
      request.academicSession === academicSession && request.term === term
    ).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  // Get total approved expenditures for a session and term
  getApprovedExpendituresTotal: (academicSession: string, term: string): number => {
    return expenditureRequests
      .filter(request => 
        request.academicSession === academicSession && 
        request.term === term &&
        (request.status === 'approved' || request.status === 'completed')
      )
      .reduce((total, request) => total + request.amount, 0);
  },

  // Get total amount by status
  getTotalAmountByStatus: (status: ExpenditureStatus): number => {
    return expenditureRequests
      .filter(request => request.status === status)
      .reduce((total, request) => total + request.amount, 0);
  },

  // Get statistics
  getStatistics: () => {
    const total = expenditureRequests.length;
    const pending = expenditureRequests.filter(r => r.status === 'pending').length;
    const approved = expenditureRequests.filter(r => r.status === 'approved').length;
    const rejected = expenditureRequests.filter(r => r.status === 'rejected').length;
    const completed = expenditureRequests.filter(r => r.status === 'completed').length;

    const totalAmount = expenditureRequests.reduce((sum, r) => sum + r.amount, 0);
    const approvedAmount = expenditureStorage.getTotalAmountByStatus('approved');
    const completedAmount = expenditureStorage.getTotalAmountByStatus('completed');

    return {
      total,
      pending,
      approved,
      rejected,
      completed,
      totalAmount,
      approvedAmount,
      completedAmount,
    };
  },
};

// Demo data
const demoRequests: Omit<ExpenditureRequest, 'id' | 'requestedAt' | 'updatedAt' | 'status'>[] = [
  {
    title: 'New Computer Laboratory Equipment',
    description: 'Purchase of 30 desktop computers, monitors, and accessories for the computer laboratory to enhance ICT education.',
    category: 'equipment',
    priority: 'high',
    amount: 2500000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2023/2024',
    term: 'First Term',
    notes: 'Required for the new ICT curriculum implementation',
  },
  {
    title: 'Library Books and Resources',
    description: 'Acquisition of new textbooks, reference materials, and digital resources for the school library.',
    category: 'supplies',
    priority: 'medium',
    amount: 750000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2023/2024',
    term: 'Second Term',
  },
  {
    title: 'Classroom Air Conditioning Repair',
    description: 'Repair and maintenance of air conditioning units in Senior Secondary classrooms.',
    category: 'maintenance',
    priority: 'urgent',
    amount: 450000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2023/2024',
    term: 'First Term',
  },
  {
    title: 'Science Laboratory Chemicals',
    description: 'Purchase of chemicals and reagents for Physics, Chemistry, and Biology laboratories.',
    category: 'supplies',
    priority: 'high',
    amount: 320000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2023/2024',
    term: 'Third Term',
  },
  {
    title: 'School Bus Maintenance',
    description: 'Comprehensive maintenance and repair of the school transportation fleet.',
    category: 'maintenance',
    priority: 'medium',
    amount: 680000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2024/2025',
    term: 'First Term',
  },
  {
    title: 'Sports Equipment Purchase',
    description: 'New sports equipment for football, basketball, volleyball, and athletics programs.',
    category: 'equipment',
    priority: 'low',
    amount: 280000,
    requestedBy: 'accountant_001',
    requestedByName: 'Mrs. Grace Adebayo',
    academicSession: '2024/2025',
    term: 'Second Term',
  },
];

// Initialize with demo data
demoRequests.forEach((request, index) => {
  const createdRequest = expenditureStorage.createRequest(request);
  
  // Set different statuses for demo
  if (index === 0) {
    expenditureStorage.approveRequest(createdRequest.id, 'admin_001', 'Administrator', 'Approved for immediate procurement');
  } else if (index === 1) {
    expenditureStorage.rejectRequest(createdRequest.id, 'admin_001', 'Administrator', 'Budget allocation insufficient for this quarter');
  } else if (index === 2) {
    const approved = expenditureStorage.approveRequest(createdRequest.id, 'admin_001', 'Administrator', 'Urgent repair approved');
    if (approved) {
      expenditureStorage.completeRequest(approved.id);
    }
  }
  // Others remain pending
});

export const EXPENDITURE_CATEGORIES: { value: ExpenditureCategory; label: string }[] = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'staff', label: 'Staff' },
  { value: 'events', label: 'Events' },
  { value: 'other', label: 'Other' },
];

export const EXPENDITURE_PRIORITIES: { value: ExpenditurePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];