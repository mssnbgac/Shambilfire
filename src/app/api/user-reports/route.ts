import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function toAppReport(row: any) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    reportType: row.report_type,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdByRole: row.created_by_role,
    academicSession: row.academic_session,
    term: row.term,
    reviewedBy: row.reviewed_by,
    reviewedByName: row.reviewed_by_name,
    reviewedAt: row.reviewed_at,
    reviewComments: row.review_comments,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query = supabaseAdmin.from('user_reports').select('*').order('created_at', { ascending: false });

    if (userId) query = query.eq('created_by', userId);
    if (status) query = query.eq('status', status);
    if (reportType) query = query.eq('report_type', reportType);
    if (role) query = query.eq('created_by_role', role);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ reports: (data || []).map(toAppReport), success: true });
  } catch (error) {
    console.error('GET /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.content || !body.reportType || !body.createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const row = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: body.title,
      content: body.content,
      report_type: body.reportType,
      priority: body.priority || 'medium',
      status: 'draft',
      created_by: body.createdBy,
      created_by_name: body.createdByName || '',
      created_by_role: body.createdByRole || '',
      academic_session: body.academicSession || null,
      term: body.term || null,
    };

    const { data, error } = await supabaseAdmin.from('user_reports').insert(row).select().single();
    if (error) throw error;

    return NextResponse.json({ report: toAppReport(data), success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 });

    const body = await request.json();
    const now = new Date().toISOString();
    let updates: any = { updated_at: now };

    switch (action) {
      case 'submit':
        updates = { ...updates, status: 'submitted', submitted_at: now };
        break;
      case 'review':
        updates = { ...updates, status: 'under_review', reviewed_by: body.adminId, reviewed_by_name: body.adminName, reviewed_at: now };
        break;
      case 'approve':
        updates = { ...updates, status: 'approved', reviewed_by: body.adminId, reviewed_by_name: body.adminName, reviewed_at: now, review_comments: body.comments || null };
        break;
      case 'reject':
        updates = { ...updates, status: 'rejected', reviewed_by: body.adminId, reviewed_by_name: body.adminName, reviewed_at: now, review_comments: body.comments };
        break;
      default:
        if (body.title) updates.title = body.title;
        if (body.content) updates.content = body.content;
        if (body.priority) updates.priority = body.priority;
        if (body.status) updates.status = body.status;
    }

    const { data, error } = await supabaseAdmin.from('user_reports').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ report: toAppReport(data), success: true });
  } catch (error) {
    console.error('PUT /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('user_reports').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('DELETE /api/user-reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
