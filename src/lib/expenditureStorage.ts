export type ExpenditureStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type ExpenditureCategory = 
  | 'supplies'
  | 'equipment'
  | 'maintenance'
  | 'utilities'
  | 'salaries'
  | 'transportation'
  | 'events'
  | 'other';

export type ExpenditurePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ExpenditureRequest {
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

export const EXPENDITURE_CATEGORIES = [
  { value: 'supplies', label: 'Office Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'events', label: 'Events & Activities' },
  { value: 'other', label: 'Other' },
];

export const EXPENDITURE_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

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

export const expenditureStorage = {
  getAllRequests(): ExpenditureRequest[] {
    return loadFromStorage();
  },

  getRequestsByUser(userId: string): ExpenditureRequest[] {
    const requests = loadFromStorage();
    return requests.filter(req => req.requestedBy === userId);
  },

  getRequestById(requestId: string): ExpenditureRequest | undefined {
    const requests = loadFromStorage();
    return requests.find(req => req.id === requestId);
  },

  getRequestsByStatus(status: ExpenditureStatus): ExpenditureRequest[] {
    const requests = loadFromStorage();
    return requests.filter(req => req.status === status);
  },

  getRequestsBySession(session: string): ExpenditureRequest[] {
    const requests = loadFromStorage();
    return requests.filter(req => req.academicSession === session);
  },

  getRequestsBySessionAndTerm(session: string, term?: string): ExpenditureRequest[] {
    const requests = loadFromStorage();
    return requests.filter(req => 
      req.academicSession === session && 
      (!term || !req.term || req.term === term)
    );
  },

  createRequest(data: Omit<ExpenditureRequest, 'id' | 'status' | 'requestedAt' | 'updatedAt'>): ExpenditureRequest {
    const requests = loadFromStorage();
    
    const newRequest: ExpenditureRequest = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      requestedAt: new Date(),
      updatedAt: new Date(),
    };
    
    requests.push(newRequest);
    saveToStorage(requests);
    
    return newRequest;
  },

  updateRequest(requestId: string, updates: Partial<ExpenditureRequest>): ExpenditureRequest | null {
    const requests = loadFromStorage();
    const index = requests.findIndex(req => req.id === requestId);
    
    if (index === -1) return null;
    
    if (requests[index].status !== 'pending' && requests[index].status !== 'rejected') {
      console.error('Cannot update request with status:', requests[index].status);
      return null;
    }
    
    requests[index] = {
      ...requests[index],
      ...updates,
      id: requestId,
      updatedAt: new Date(),
    };
    
    saveToStorage(requests);
    return requests[index];
  },

  approveRequest(
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
  },

  rejectRequest(
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
  },

  completeRequest(requestId: string): ExpenditureRequest | null {
    const requests = loadFromStorage();
    const index = requests.findIndex(req => req.id === requestId);
    
    if (index === -1) return null;
    
    requests[index] = {
      ...requests[index],
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveToStorage(requests);
    return requests[index];
  },

  deleteRequest(requestId: string): boolean {
    const requests = loadFromStorage();
    const index = requests.findIndex(req => req.id === requestId);
    
    if (index === -1) return false;
    
    if (requests[index].status !== 'pending' && requests[index].status !== 'rejected') {
      console.error('Cannot delete request with status:', requests[index].status);
      return false;
    }
    
    requests.splice(index, 1);
    saveToStorage(requests);
    return true;
  },

  getTotalExpenditure(session: string, term?: string): number {
    const requests = loadFromStorage();
    return requests
      .filter(req => 
        req.academicSession === session &&
        (req.status === 'approved' || req.status === 'completed') &&
        (!term || req.term === term)
      )
      .reduce((total, req) => total + (Number(req.amount) || 0), 0);
  },

  getTotalExpenditureBySessionAndTerm(session: string, term: string): number {
    return this.getTotalExpenditure(session, term);
  },

  getExpenditureByCategory(session: string, term?: string): Record<ExpenditureCategory, number> {
    const requests = loadFromStorage();
    const result: Record<ExpenditureCategory, number> = {
      supplies: 0,
      equipment: 0,
      maintenance: 0,
      utilities: 0,
      salaries: 0,
      transportation: 0,
      events: 0,
      other: 0,
    };
    
    requests
      .filter(req => 
        req.academicSession === session &&
        (req.status === 'approved' || req.status === 'completed') &&
        (!term || req.term === term)
      )
      .forEach(req => {
        result[req.category] += Number(req.amount) || 0;
      });
    
    return result;
  },

  initializeDemoData(): void {
    // Don't automatically initialize demo data
    // Users can manually create expenditures as needed
    return;
  },
};

if (typeof window !== 'undefined') {
  expenditureStorage.initializeDemoData();
}