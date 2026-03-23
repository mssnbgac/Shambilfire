import { NextRequest, NextResponse } from 'next/server';
import { userReportStorage } from '@/lib/userReportStorage';

// GET - Get reports statistics
export async function GET(request: NextRequest) {
  try {
    const stats = userReportStorage.getReportsStats();
    const pendingReports = userReportStorage.getPendingReports();
    
    return NextResponse.json({ 
      stats, 
      pendingReports: pendingReports.slice(0, 5), // Latest 5 pending reports
      success: true 
    });
  } catch (error) {
    console.error('GET /api/user-reports/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}