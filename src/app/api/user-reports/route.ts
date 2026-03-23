import { NextRequest, NextResponse } from 'next/server';
import { userReportStorage, UserReport } from '@/lib/userReportStorage';

// GET - Retrieve user reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    let reports: UserReport[];
    
    if (search) {
      reports = userReportStorage.searchReports(search);
    } else if (userId) {
      reports = userReportStorage.getReportsByUser(userId);
    } else if (status) {
      reports = userReportStorage.getReportsByStatus(status as any);
    } else if (reportType) {
      reports = userReportStorage.getReportsByType(reportType as any);
    } else if (role) {
      reports = userReportStorage.getReportsByRole(role as any);
    } else {
      reports = userReportStorage.getAllReports();
    }
    
    return NextResponse.json({ reports, success: true });
  } catch (error) {
    console.error('GET /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();
    
    // Validate required fields
    if (!reportData.title || !reportData.content || !reportData.reportType || !reportData.createdBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, reportType, createdBy' 
      }, { status: 400 });
    }
    
    const newReport = userReportStorage.createReport(reportData);
    
    return NextResponse.json({ report: newReport, success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update report
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    let updatedReport: UserReport | null = null;
    
    switch (action) {
      case 'submit':
        updatedReport = userReportStorage.submitReport(reportId);
        break;
        
      case 'review':
        if (!updateData.adminId || !updateData.adminName) {
          return NextResponse.json({ error: 'Admin ID and name required for review' }, { status: 400 });
        }
        updatedReport = userReportStorage.markUnderReview(reportId, updateData.adminId, updateData.adminName);
        break;
        
      case 'approve':
        if (!updateData.adminId || !updateData.adminName) {
          return NextResponse.json({ error: 'Admin ID and name required for approval' }, { status: 400 });
        }
        updatedReport = userReportStorage.approveReport(
          reportId, 
          updateData.adminId, 
          updateData.adminName, 
          updateData.comments
        );
        break;
        
      case 'reject':
        if (!updateData.adminId || !updateData.adminName || !updateData.comments) {
          return NextResponse.json({ 
            error: 'Admin ID, name, and comments required for rejection' 
          }, { status: 400 });
        }
        updatedReport = userReportStorage.rejectReport(
          reportId, 
          updateData.adminId, 
          updateData.adminName, 
          updateData.comments
        );
        break;
        
      default:
        updatedReport = userReportStorage.updateReport(reportId, updateData);
        break;
    }
    
    if (!updatedReport) {
      return NextResponse.json({ error: 'Report not found or action not allowed' }, { status: 404 });
    }
    
    return NextResponse.json({ report: updatedReport, success: true });
  } catch (error) {
    console.error('PUT /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }
    
    const deleted = userReportStorage.deleteReport(reportId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}