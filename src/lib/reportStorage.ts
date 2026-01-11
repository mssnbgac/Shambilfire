// Report storage and management system
import { Term } from './academicSessions';

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ExamOfficerReport {
  id: string;
  title: string;
  content: string;
  term: Term;
  academicSession: string;
  createdBy: string; // Exam officer ID
  createdAt: Date;
  updatedAt: Date;
  status: ReportStatus;
  submittedAt?: Date;
  reviewedBy?: string; // Admin ID
  reviewedAt?: Date;
  reviewComments?: string;
  attachments?: string[];
}

// In-memory storage for demo purposes
let reports: ExamOfficerReport[] = [];

export const reportStorage = {
  // Create a new report
  createReport: (report: Omit<ExamOfficerReport, 'id' | 'createdAt' | 'updatedAt'>): ExamOfficerReport => {
    const newReport: ExamOfficerReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    reports.push(newReport);
    return newReport;
  },

  // Get all reports
  getAllReports: (): ExamOfficerReport[] => {
    return [...reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get reports by exam officer
  getReportsByExamOfficer: (examOfficerId: string): ExamOfficerReport[] => {
    return reports.filter(report => report.createdBy === examOfficerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Get reports pending admin review
  getPendingReports: (): ExamOfficerReport[] => {
    return reports.filter(report => report.status === 'submitted')
      .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime());
  },

  // Get report by ID
  getReportById: (id: string): ExamOfficerReport | undefined => {
    return reports.find(report => report.id === id);
  },

  // Update report
  updateReport: (id: string, updates: Partial<ExamOfficerReport>): ExamOfficerReport | null => {
    const index = reports.findIndex(report => report.id === id);
    if (index === -1) return null;

    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date(),
    };
    return reports[index];
  },

  // Submit report for review
  submitReport: (id: string): ExamOfficerReport | null => {
    const report = reports.find(r => r.id === id);
    if (!report || report.status !== 'draft') return null;

    return reportStorage.updateReport(id, {
      status: 'submitted',
      submittedAt: new Date(),
    });
  },

  // Approve report
  approveReport: (id: string, adminId: string, comments?: string): ExamOfficerReport | null => {
    const report = reports.find(r => r.id === id);
    if (!report || report.status !== 'submitted') return null;

    return reportStorage.updateReport(id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      reviewComments: comments,
    });
  },

  // Reject report
  rejectReport: (id: string, adminId: string, comments: string): ExamOfficerReport | null => {
    const report = reports.find(r => r.id === id);
    if (!report || report.status !== 'submitted') return null;

    return reportStorage.updateReport(id, {
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      reviewComments: comments,
    });
  },

  // Delete report
  deleteReport: (id: string): boolean => {
    const index = reports.findIndex(report => report.id === id);
    if (index === -1) return false;
    reports.splice(index, 1);
    return true;
  },

  // Get reports by term and session
  getReportsByTermAndSession: (term: Term, academicSession: string): ExamOfficerReport[] => {
    return reports.filter(report => 
      report.term === term && report.academicSession === academicSession
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
};

// Demo data
const demoReports: Omit<ExamOfficerReport, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'First Term Examination Analysis 2023/2024',
    content: `# First Term Examination Analysis - 2023/2024 Academic Session

## Executive Summary
This report provides a comprehensive analysis of the First Term examinations conducted across all classes in Shambil Pride Academy for the 2023/2024 academic session.

## Key Findings
- Overall pass rate: 87.5%
- Average score across all subjects: 72.3%
- Top performing class: SS 3Science (Average: 78.9%)
- Subject with highest performance: Mathematics (Average: 75.2%)

## Detailed Analysis

### Performance by Class Level
- **Primary Classes**: Average performance of 74.1%
- **Junior Secondary**: Average performance of 71.8%
- **Senior Secondary**: Average performance of 70.5%

### Subject Performance Analysis
1. **Mathematics**: 75.2% average, 92% pass rate
2. **English Language**: 73.8% average, 89% pass rate
3. **Basic Science**: 71.5% average, 85% pass rate

## Recommendations
1. Implement additional support for struggling students
2. Review curriculum delivery methods for lower-performing subjects
3. Organize remedial classes for students below 50%

## Conclusion
The First Term results show satisfactory performance across most subjects, with room for improvement in specific areas identified above.`,
    term: 'First Term',
    academicSession: '2023/2024',
    createdBy: 'exam_officer_001',
    status: 'approved',
    submittedAt: new Date('2023-12-15'),
    reviewedBy: 'admin_001',
    reviewedAt: new Date('2023-12-16'),
    reviewComments: 'Excellent comprehensive analysis. Approved for distribution.',
  },
  {
    title: 'Second Term Performance Review 2023/2024',
    content: `# Second Term Performance Review - 2023/2024 Academic Session

## Overview
This report analyzes the Second Term examination results and compares them with First Term performance.

## Performance Trends
- Slight improvement in overall performance: 89.2% (up from 87.5%)
- Consistent performance in core subjects
- Notable improvement in Science subjects

## Areas of Concern
- Decline in Arts subjects performance
- Attendance issues affecting some students' results

## Action Items
1. Address attendance concerns with parents
2. Strengthen Arts curriculum delivery
3. Continue current Science teaching methods`,
    term: 'Second Term',
    academicSession: '2023/2024',
    createdBy: 'exam_officer_001',
    status: 'submitted',
    submittedAt: new Date('2024-04-10'),
  },
];

// Initialize with demo data
demoReports.forEach(report => {
  reportStorage.createReport(report);
});