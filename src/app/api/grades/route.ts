import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const classId = searchParams.get('classId');

    let query = supabaseAdmin.from('grades').select('*').order('created_at', { ascending: false });

    if (studentId) query = query.eq('student_id', studentId);
    if (studentName) query = query.ilike('student_name', `%${studentName}%`);
    if (session) query = query.eq('academic_year', session);
    if (term) query = query.eq('term', term);
    if (classId) query = query.eq('class_id', classId);

    const { data, error } = await query;
    if (error) throw error;

    const grades = (data || []).map(toAppGrade);
    return NextResponse.json({ grades });
  } catch (error) {
    console.error('GET /api/grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const row = {
      id: body.id || `grade-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      student_id: body.studentId || body.student_id,
      student_name: body.studentName || body.student_name,
      admission_number: body.admissionNumber || body.admission_number || null,
      subject_id: body.subjectId || body.subject_id,
      subject_name: body.subjectName || body.subject_name,
      class_id: body.classId || body.class_id,
      term: body.term,
      academic_year: body.academicYear || body.academic_year,
      first_ca: body.assessments?.firstCA ?? body.first_ca ?? 0,
      second_ca: body.assessments?.secondCA ?? body.second_ca ?? 0,
      exam: body.assessments?.exam ?? body.exam ?? 0,
      total: body.total,
      grade: body.grade,
      remark: body.remark || null,
      position: body.position || null,
      teacher_id: body.teacherId || body.teacher_id || null,
      entered_by: body.enteredBy || body.entered_by || null,
    };

    const { data, error } = await supabaseAdmin.from('grades').insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ grade: toAppGrade(data) }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/grades error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Grade ID required' }, { status: 400 });

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.total !== undefined) updates.total = body.total;
    if (body.grade !== undefined) updates.grade = body.grade;
    if (body.remark !== undefined) updates.remark = body.remark;
    if (body.assessments) {
      updates.first_ca = body.assessments.firstCA;
      updates.second_ca = body.assessments.secondCA;
      updates.exam = body.assessments.exam;
    }

    const { data, error } = await supabaseAdmin.from('grades').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ grade: toAppGrade(data) });
  } catch (error) {
    console.error('PUT /api/grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function toAppGrade(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    admissionNumber: row.admission_number,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    classId: row.class_id,
    term: row.term,
    academicYear: row.academic_year,
    assessments: {
      firstCA: row.first_ca,
      secondCA: row.second_ca,
      exam: row.exam,
    },
    total: row.total,
    grade: row.grade,
    remark: row.remark,
    position: row.position,
    teacherId: row.teacher_id,
    enteredBy: row.entered_by,
    dateEntered: row.created_at,
  };
}
