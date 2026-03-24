import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function toAppClass(row: any) {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    section: row.section || '',
    academicYear: row.academic_year,
    capacity: row.capacity || 40,
    currentEnrollment: row.current_enrollment || 0,
    subjects: row.subjects || [],
    description: row.description || '',
    classTeacher: row.class_teacher || null,
    classTeacherId: row.class_teacher_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const academicYear = searchParams.get('academicYear');

    if (id) {
      const { data, error } = await supabaseAdmin.from('classes').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      return NextResponse.json({ class: toAppClass(data) });
    }

    let query = supabaseAdmin.from('classes').select('*').order('name');
    if (academicYear) query = query.eq('academic_year', academicYear);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ classes: (data || []).map(toAppClass) });
  } catch (error) {
    console.error('GET /api/classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `class-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const row = {
      id,
      name: body.name,
      level: body.level,
      section: body.section || '',
      academic_year: body.academicYear,
      capacity: body.capacity || 40,
      current_enrollment: body.currentEnrollment || 0,
      subjects: body.subjects || [],
      description: body.description || '',
      class_teacher: body.classTeacher || null,
      class_teacher_id: body.classTeacherId || null,
    };

    const { data, error } = await supabaseAdmin.from('classes').insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ class: toAppClass(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.level !== undefined) updates.level = body.level;
    if (body.section !== undefined) updates.section = body.section;
    if (body.academicYear !== undefined) updates.academic_year = body.academicYear;
    if (body.capacity !== undefined) updates.capacity = body.capacity;
    if (body.currentEnrollment !== undefined) updates.current_enrollment = body.currentEnrollment;
    if (body.subjects !== undefined) updates.subjects = body.subjects;
    if (body.description !== undefined) updates.description = body.description;
    if (body.classTeacher !== undefined) updates.class_teacher = body.classTeacher;
    if (body.classTeacherId !== undefined) updates.class_teacher_id = body.classTeacherId;

    const { data, error } = await supabaseAdmin.from('classes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ class: toAppClass(data) });
  } catch (error) {
    console.error('PATCH /api/classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('classes').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
