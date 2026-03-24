import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('user_reports').select('status, priority, report_type, created_by_role');
    if (error) throw error;

    const reports = data || [];

    return NextResponse.json({
      stats: {
        total: reports.length,
        pending: reports.filter(r => r.status === 'submitted' || r.status === 'under_review').length,
        approved: reports.filter(r => r.status === 'approved').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
        urgent: reports.filter(r => r.priority === 'urgent' && r.status !== 'approved').length,
        byType: {
          academic: reports.filter(r => r.report_type === 'academic').length,
          financial: reports.filter(r => r.report_type === 'financial').length,
          disciplinary: reports.filter(r => r.report_type === 'disciplinary').length,
          maintenance: reports.filter(r => r.report_type === 'maintenance').length,
          general: reports.filter(r => r.report_type === 'general').length,
          incident: reports.filter(r => r.report_type === 'incident').length,
          suggestion: reports.filter(r => r.report_type === 'suggestion').length,
          complaint: reports.filter(r => r.report_type === 'complaint').length,
        },
        byRole: {
          teacher: reports.filter(r => r.created_by_role === 'teacher').length,
          exam_officer: reports.filter(r => r.created_by_role === 'exam_officer').length,
          accountant: reports.filter(r => r.created_by_role === 'accountant').length,
          parent: reports.filter(r => r.created_by_role === 'parent').length,
          student: reports.filter(r => r.created_by_role === 'student').length,
        },
      },
      success: true,
    });
  } catch (error) {
    console.error('GET /api/user-reports/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
