// Enhanced report storage system for all user types
import fs from 'fs';
import path from 'path';

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'under_review';
export type ReportType = 'academic' | 'financial' | 'disciplinary' | 'maintenance' | 'general' | 'incident' | 'suggestion' | 'complaint';
export type UserRole = 'admin' | 'teacher' | 'exam_officer' | 'accountant' | 'parent' | 'student';

export interface UserReport {
  id: string;
  title: string;
  content: string;
  reportType: ReportType;
  academicSession?: string;
  term?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Creator information
  createdBy: string;
  createdByName: string;
  createdByRole: UserRole;
  createdAt: string;
  updatedAt: string;
  
  // Status and workflow
  status: ReportStatus;
  submittedAt?: string;
  
  // Review information
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewComments?: string;
  
  // Additional metadata
  attachments?: string[];
  tags?: string[];
  isUrgent?: boolean;
  followUpRequired?: boolean;
  relatedUsers?: string[]; // IDs of users mentioned in the report
}

// File-based storage
const REPORTS_FILE = path.join(process.cwd(), 'data', 'user_reports.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(REPORTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load reports from file
function loadReports(): UserReport[] {
  try {
    ensureDataDirectory();
    
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // Initialize with empty array
      const emptyData: UserReport[] = [];
      saveReports(emptyData);
      return emptyData;
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    return [];
  }
}

// Save reports to file
function saveReports(reports: UserReport[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  } catch (error) {
    console.error('Error saving reports:', error);
  }
}

export const userReportStorage = {
  // Create a new report
  createReport: (reportData: Omit<UserReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): UserReport => {
    const reports = loadReports();
    
    const newReport: UserReport = {
      ...reportData,
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    reports.push(newReport);
    saveReports(reports);
    return newReport;
  },

  // Get all reports
  getAllReports: (): UserReport[] => {
    const reports = loadReports();
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reports by user
  getReportsByUser: (userId: string): UserReport[] => {
    const reports = loadReports();
    return reports
      .filter(report => report.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reports by status
  getReportsByStatus: (status: ReportStatus): UserReport[] => {
    const reports = loadReports();
    return reports
      .filter(report => report.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reports by type
  getReportsByType: (reportType: ReportType): UserReport[] => {
    const reports = loadReports();
    return reports
      .filter(report => report.reportType === reportType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get reports by role
  getReportsByRole: (role: UserRole): UserReport[] => {
    const reports = loadReports();
    return reports
      .filter(report => report.createdByRole === role)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get pending reports for admin review
  getPendingReports: (): UserReport[] => {
    const reports = loadReports();
    return reports
      .filter(report => report.status === 'submitted' || report.status === 'under_review')
      .sort((a, b) => {
        // Prioritize urgent reports
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
        return new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime();
      });
  },

  // Get report by ID
  getReportById: (id: string): UserReport | undefined => {
    const reports = loadReports();
    return reports.find(report => report.id === id);
  },

  // Update report
  updateReport: (id: string, updates: Partial<UserReport>): UserReport | null => {
    const reports = loadReports();
    const index = reports.findIndex(report => report.id === id);
    
    if (index === -1) return null;
    
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    saveReports(reports);
    return reports[index];
  },

  // Submit report for review
  submitReport: (id: string): UserReport | null => {
    const reports = loadReports();
    const report = reports.find(r => r.id === id);
    
    if (!report || (report.status !== 'draft' && report.status !== 'rejected')) {
      return null;
    }
    
    return userReportStorage.updateReport(id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });
  },

  // Mark report as under review
  markUnderReview: (id: string, adminId: string, adminName: string): UserReport | null => {
    const reports = loadReports();
    const report = reports.find(r => r.id === id);
    
    if (!report || report.status !== 'submitted') return null;
    
    return userReportStorage.updateReport(id, {
      status: 'under_review',
      reviewedBy: adminId,
      reviewedByName: adminName,
      reviewedAt: new Date().toISOString(),
    });
  },

  // Approve report
  approveReport: (id: string, adminId: string, adminName: string, comments?: string): UserReport | null => {
    const reports = loadReports();
    const report = reports.find(r => r.id === id);
    
    if (!report || (report.status !== 'submitted' && report.status !== 'under_review')) {
      return null;
    }
    
    return userReportStorage.updateReport(id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedByName: adminName,
      reviewedAt: new Date().toISOString(),
      reviewComments: comments,
    });
  },

  // Reject report
  rejectReport: (id: string, adminId: string, adminName: string, comments: string): UserReport | null => {
    const reports = loadReports();
    const report = reports.find(r => r.id === id);
    
    if (!report || (report.status !== 'submitted' && report.status !== 'under_review')) {
      return null;
    }
    
    return userReportStorage.updateReport(id, {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedByName: adminName,
      reviewedAt: new Date().toISOString(),
      reviewComments: comments,
    });
  },

  // Delete report
  deleteReport: (id: string): boolean => {
    const reports = loadReports();
    const index = reports.findIndex(report => report.id === id);
    
    if (index === -1) return false;
    
    reports.splice(index, 1);
    saveReports(reports);
    return true;
  },

  // Get reports statistics
  getReportsStats: () => {
    const reports = loadReports();
    
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'submitted' || r.status === 'under_review').length,
      approved: reports.filter(r => r.status === 'approved').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
      urgent: reports.filter(r => r.priority === 'urgent' && r.status !== 'approved').length,
      byType: {
        academic: reports.filter(r => r.reportType === 'academic').length,
        financial: reports.filter(r => r.reportType === 'financial').length,
        disciplinary: reports.filter(r => r.reportType === 'disciplinary').length,
        maintenance: reports.filter(r => r.reportType === 'maintenance').length,
        general: reports.filter(r => r.reportType === 'general').length,
        incident: reports.filter(r => r.reportType === 'incident').length,
        suggestion: reports.filter(r => r.reportType === 'suggestion').length,
        complaint: reports.filter(r => r.reportType === 'complaint').length,
      },
      byRole: {
        teacher: reports.filter(r => r.createdByRole === 'teacher').length,
        exam_officer: reports.filter(r => r.createdByRole === 'exam_officer').length,
        accountant: reports.filter(r => r.createdByRole === 'accountant').length,
        parent: reports.filter(r => r.createdByRole === 'parent').length,
        student: reports.filter(r => r.createdByRole === 'student').length,
      }
    };
  },

  // Search reports
  searchReports: (query: string): UserReport[] => {
    const reports = loadReports();
    const searchTerm = query.toLowerCase();
    
    return reports.filter(report => 
      report.title.toLowerCase().includes(searchTerm) ||
      report.content.toLowerCase().includes(searchTerm) ||
      report.createdByName.toLowerCase().includes(searchTerm) ||
      report.reportType.toLowerCase().includes(searchTerm) ||
      (report.tags && report.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};