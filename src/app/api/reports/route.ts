import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for reports (in production, use a database)
let reports: any[] = [];

// Initialize with demo reports
const initializeReports = () => {
  if (reports.length === 0) {
    reports = [
      {
        id: 'report-001',
        title: 'First Term Academic Report 2024/2025',
        academicSession: '2024/2025',
        term: 'First Term',
        reportType: 'academic',
        content: 'This term has shown excellent academic progress across all classes. Students have demonstrated strong performance in core subjects.',
        createdBy: 'exam-officer-1',
        createdByName: 'Jennifer Davis',
        createdByRole: 'exam_officer',
        dateCreated: new Date().toISOString(),
        status: 'pending',
        reviewedBy: null,
        reviewedByName: null,
        dateReviewed: null,
        reviewComments: null,
        approvalStatus: 'pending'
      },
      {
        id: 'report-002',
        title: 'Financial Summary Report - First Term',
        academicSession: '2024/2025',
        term: 'First Term',
        reportType: 'financial',
        content: 'Financial performance for the first term shows positive trends with improved collection rates and controlled expenditures.',
        createdBy: 'accountant-1',
        createdByName: 'Michael Brown',
        createdByRole: 'accountant',
        dateCreated: new Date().toISOString(),
        status: 'approved',
        reviewedBy: 'admin-1',
        reviewedByName: 'John Administrator',
        dateReviewed: new Date().toISOString(),
        reviewComments: 'Excellent financial management this term.',
        approvalStatus: 'approved'
      }
    ];
  }
};

// GET - Retrieve reports
export async function GET(request: NextRequest) {
  try {
    initializeReports();
    
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const createdBy = searchParams.get('createdBy');
    
    let filteredReports = reports;
    
    if (session && term) {
      filteredReports = filteredReports.filter(r => 
        r.academicSession === session && r.term === term
      );
    }
    
    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status);
    }
    
    if (reportType) {
      filteredReports = filteredReports.filter(r => r.reportType === reportType);
    }
    
    if (createdBy) {
      filteredReports = filteredReports.filter(r => r.createdBy === createdBy);
    }
    
    // Sort by date created (newest first)
    filteredReports.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    
    return NextResponse.json({ reports: filteredReports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    initializeReports();
    
    const reportData = await request.json();
    
    const newReport = {
      ...reportData,
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dateCreated: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedByName: null,
      dateReviewed: null,
      reviewComments: null,
      approvalStatus: 'pending'
    };
    
    reports.push(newReport);
    
    return NextResponse.json({ report: newReport }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update report (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const updateData = await request.json();
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }
    
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    reports[reportIndex] = {
      ...reports[reportIndex],
      ...updateData,
      dateReviewed: new Date().toISOString()
    };
    
    return NextResponse.json({ report: reports[reportIndex] });
  } catch (error) {
    console.error('PUT /api/reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}