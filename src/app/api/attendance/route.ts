import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function toAppRecord(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    admissionNumber: row.admission_number,
    classId: row.class_id,
    className: row.class_name,
    date: row.date,
    status: row.status,
    timeIn: row.time_in || null,
    timeOut: row.time_out || null,
    notes: row.notes || null,
    markedBy: row.marked_by,
    markedByName: row.marked_by_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin.from('attendance').select('*');

    if (date) query = query.eq('date', date);
    if (studentId) query = query.eq('student_id', studentId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ records: (data || []).map(toAppRecord) });
  } catch (error) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const row = {
      id,
      student_id: body.studentId,
      student_name: body.studentName,
      student_email: body.studentEmail || null,
      admission_number: body.admissionNumber || null,
      class_id: body.classId || null,
      class_name: body.className || null,
      date: body.date,
      status: body.status,
      time_in: body.timeIn || null,
      time_out: body.timeOut || null,
      notes: body.notes || null,
      marked_by: body.markedBy || null,
      marked_by_name: body.markedByName || null,
    };

    // Upsert: if record for same student+date exists, update it
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .upsert(row, { onConflict: 'student_id,date' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ record: toAppRecord(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
