import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Ensure notifications table exists (graceful fallback if not)
async function ensureTable() {
  // We'll just try queries and handle errors gracefully
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query;
    if (error) {
      // Table may not exist yet
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ notifications: [] });
      }
      throw error;
    }

    const notifications = (data || []).map(toAppNotification);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const row = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      student_id: body.studentId || body.student_id,
      student_name: body.studentName || body.student_name || null,
      type: body.type || 'payment',
      academic_session: body.academicSession || body.academic_session || null,
      term: body.term || null,
      message: body.message,
      read: false,
    };

    const { data, error } = await supabaseAdmin.from('notifications').insert(row).select().single();
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        // Table doesn't exist yet — return success silently
        return NextResponse.json({ notification: { ...row, createdAt: new Date().toISOString() } }, { status: 201 });
      }
      throw error;
    }

    return NextResponse.json({ notification: toAppNotification(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    // Non-fatal — don't break payment flow
    return NextResponse.json({ notification: null }, { status: 201 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ notification: null });
      }
      throw error;
    }

    return NextResponse.json({ notification: toAppNotification(data) });
  } catch (error) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function toAppNotification(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    type: row.type,
    academicSession: row.academic_session,
    term: row.term,
    message: row.message,
    read: row.read || false,
    createdAt: row.created_at,
  };
}
