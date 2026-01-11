// Financial report storage and management system for accountants
import { Term } from './academicSessions';

export type FinancialReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface FinancialReport {
  id: string;
  title: string;
  content: string;
  term: Term;
  academicSession: string;
  createdBy: string; // Accountant ID
  createdByName: string; // Accountant name for display
  createdAt: Date;
  updatedAt: Date;
  status: FinancialReportStatus;
  submittedAt?: Date;
  reviewedBy?: string; // Admin ID
  reviewedByName?: string; // Admin name
  reviewedAt?: Date;
  reviewComments?: string;
  attachments?: string[];
  // Financial data summary
  totalRevenue?: number;
  totalExpenditures?: number;
  netBalance?: number;
  paymentCount?: number;
  expenditureCount?: number;
}

// In-memory storage for demo purposes
let financialReports: FinancialReport[] = [];

export const financialReportStorage = {
  // Create a new financial report
  createReport: (report: Omit<FinancialReport, 'id' | 'createdAt' | 'updatedAt'>): FinancialReport => {
    const newReport: FinancialReport = {
      ...report,
      id: `fin_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    financialReports.push(newReport);
    return newReport;
  },

  // Get all financial reports
  getAllReports: (): FinancialReport[] => {
    return [...financialReports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get reports by accountant
  getReportsByAccountant: (accountantId: string): FinancialReport[] => {
    return financialReports.filter(report => report.createdBy === accountantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get reports pending admin review
  getPendingReports: (): FinancialReport[] => {
    return financialReports.filter(report => report.status === 'submitted')
      .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime());
  },

  // Get report by ID
  getReportById: (id: string): FinancialReport | undefined => {
    return financialReports.find(report => report.id === id);
  },

  // Update report
  updateReport: (id: string, updates: Partial<FinancialReport>): FinancialReport | null => {
    const index = financialReports.findIndex(report => report.id === id);
    if (index === -1) return null;

    financialReports[index] = {
      ...financialReports[index],
      ...updates,
      updatedAt: new Date(),
    };
    return financialReports[index];
  },

  // Submit report for review
  submitReport: (id: string): FinancialReport | null => {
    const report = financialReports.find(r => r.id === id);
    if (!report || report.status !== 'draft') return null;

    return financialReportStorage.updateReport(id, {
      status: 'submitted',
      submittedAt: new Date(),
    });
  },

  // Approve report
  approveReport: (id: string, adminId: string, adminName: string, comments?: string): FinancialReport | null => {
    const report = financialReports.find(r => r.id === id);
    if (!report || report.status !== 'submitted') return null;

    return financialReportStorage.updateReport(id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedByName: adminName,
      reviewedAt: new Date(),
      reviewComments: comments,
    });
  },

  // Reject report
  rejectReport: (id: string, adminId: string, adminName: string, comments: string): FinancialReport | null => {
    const report = financialReports.find(r => r.id === id);
    if (!report || report.status !== 'submitted') return null;

    return financialReportStorage.updateReport(id, {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedByName: adminName,
      reviewedAt: new Date(),
      reviewComments: comments,
    });
  },

  // Delete report
  deleteReport: (id: string): boolean => {
    const index = financialReports.findIndex(report => report.id === id);
    if (index === -1) return false;
    financialReports.splice(index, 1);
    return true;
  },

  // Get reports by term and session
  getReportsByTermAndSession: (term: Term, academicSession: string): FinancialReport[] => {
    return financialReports.filter(report => 
      report.term === term && report.academicSession === academicSession
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get statistics
  getStatistics: () => {
    const total = financialReports.length;
    const pending = financialReports.filter(r => r.status === 'submitted').length;
    const approved = financialReports.filter(r => r.status === 'approved').length;
    const rejected = financialReports.filter(r => r.status === 'rejected').length;
    const draft = financialReports.filter(r => r.status === 'draft').length;

    return {
      total,
      pending,
      approved,
      rejected,
      draft,
    };
  },
};

// Demo data
const demoFinancialReports: Omit<FinancialReport, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'First Term Financial Summary 2023/2024',
    content: `# Financial Report - First Term 2023/2024

## Executive Summary
This report provides a comprehensive financial overview for the First Term of the 2023/2024 academic session at Shambil Pride Academy.

## Revenue Summary
- **Total School Fees Collected**: ₦1,045,000
- **Number of Payments Processed**: 2 payments
- **Payment Methods Used**: Bank Transfer (₦45,000), Cash (₦1,000,000)
- **Collection Rate**: 100% of confirmed payments

## Expenditure Summary
- **Total Approved Expenditures**: ₦450,000
- **Major Expenditures**:
  - Classroom AC Repair: ₦450,000 (Urgent maintenance)
- **Pending Expenditure Requests**: ₦2,500,000 (Computer Lab Equipment)

## Financial Position
- **Net Available Funds**: ₦595,000
- **Budget Utilization**: 43.1% of revenue spent on approved expenditures
- **Cash Flow Status**: Positive

## Key Observations
1. Strong revenue collection with 100% payment confirmation rate
2. Controlled expenditure with focus on urgent maintenance needs
3. Significant pending request for computer lab equipment requires additional funding consideration
4. Healthy cash flow position maintained throughout the term

## Recommendations
1. Continue efficient payment collection processes
2. Evaluate funding options for pending computer lab equipment request
3. Maintain current expenditure approval controls
4. Plan for Second Term budget allocation based on current trends

## Conclusion
The First Term financial performance shows strong revenue collection and controlled expenditure management, resulting in a healthy financial position for the school.`,
    term: 'First Term',
    academicSession: '2023/2024',
    createdBy: 'accountant_001',
    createdByName: 'Mrs. Grace Adebayo',
    status: 'approved',
    submittedAt: new Date('2023-12-20'),
    reviewedBy: 'admin_001',
    reviewedByName: 'Administrator',
    reviewedAt: new Date('2023-12-21'),
    reviewComments: 'Excellent comprehensive financial analysis. Well-structured report with clear recommendations. Approved for board presentation.',
    totalRevenue: 1045000,
    totalExpenditures: 450000,
    netBalance: 595000,
    paymentCount: 2,
    expenditureCount: 1,
  },
  {
    title: 'Second Term Financial Analysis 2023/2024',
    content: `# Financial Report - Second Term 2023/2024

## Executive Summary
Financial analysis for the Second Term of 2023/2024 academic session.

## Revenue Analysis
- **Total Revenue**: ₦125,000
- **Payment Transactions**: 2 confirmed payments
- **Collection Efficiency**: Maintained high collection standards

## Expenditure Control
- **Approved Expenditures**: ₦750,000 (Library Books and Resources)
- **Expenditure Categories**: Educational supplies and resources
- **Budget Compliance**: All expenditures within approved limits

## Financial Health
- **Current Position**: Revenue vs expenditure analysis shows need for additional revenue streams
- **Recommendations**: Focus on increasing enrollment and fee collection for upcoming terms

## Action Items
1. Review fee structure for sustainability
2. Implement cost-saving measures where possible
3. Explore additional revenue opportunities
4. Maintain strict expenditure controls`,
    term: 'Second Term',
    academicSession: '2023/2024',
    createdBy: 'accountant_001',
    createdByName: 'Mrs. Grace Adebayo',
    status: 'submitted',
    submittedAt: new Date('2024-04-15'),
    totalRevenue: 125000,
    totalExpenditures: 750000,
    netBalance: -625000,
    paymentCount: 2,
    expenditureCount: 1,
  },
];

// Initialize with demo data
demoFinancialReports.forEach(report => {
  financialReportStorage.createReport(report);
});