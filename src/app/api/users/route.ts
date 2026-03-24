import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USERS = [
  { id: 'admin-1', email: 'admin@shambil.edu.ng', password: 'admin123', first_name: 'John', last_name: 'Administrator', role: 'admin' },
  { id: 'teacher-1', email: 'teacher@shambil.edu.ng', password: 'teacher123', first_name: 'Mary', last_name: 'Johnson', role: 'teacher' },
  { id: 'student-1', email: 'student@shambil.edu.ng', password: 'student123', first_name: 'David', last_name: 'Smith', role: 'student' },
  { id: 'parent-1', email: 'parent@shambil.edu.ng', password: 'parent123', first_name: 'Sarah', last_name: 'Wilson', role: 'parent' },
  { id: 'accountant-1', email: 'accountant@shambil.edu.ng', password: 'accountant123', first_name: 'Michael', last_name: 'Brown', role: 'accountant' },
  { id: 'exam-officer-1', email: 'examofficer@shambil.edu.ng', password: 'exam123', first_name: 'Jennifer', last_name: 'Davis', role: 'exam_officer' },
];

// Map DB row → app user shape
function toAppUser(row: any) {
  const extra = row.extra_data || {};
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    phoneNumber: row.phone,
    address: row.address,
    classId: row.class_id,
    class: row.class_id || extra.class || null,
    subjects: row.subjects,
    parentId: row.parent_id,
    childrenIds: row.children_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Student-specific fields from extra_data
    admissionNumber: extra.admissionNumber || null,
    dateOfBirth: extra.dateOfBirth || null,
    bloodGroup: extra.bloodGroup || null,
    medicalConditions: extra.medicalConditions || null,
    parentEmail: extra.parentEmail || null,
  };
}

// Seed default users if table is empty
async function ensureDefaultUsers() {
  const { count } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
  if ((count ?? 0) === 0) {
    await supabaseAdmin.from('users').insert(DEFAULT_USERS);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDefaultUsers();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (email && password) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('email', email)
        .eq('password', password)
        .single();

      if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({ user: toAppUser(data) });
    }

    const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at');
    if (error) throw error;

    const users = (data || []).map(toAppUser).map(({ password: _, ...u }) => u);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', body.email)
      .single();

    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    const row = {
      id: body.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      email: body.email.toLowerCase(),
      password: body.password,
      first_name: body.firstName || body.first_name || '',
      last_name: body.lastName || body.last_name || '',
      role: body.role,
      phone: body.phoneNumber || body.phone || null,
      address: body.address || null,
      class_id: body.classId || body.class_id || body.class || null,
      subjects: body.subjects || null,
      parent_id: body.parentId || body.parent_id || null,
      children_ids: body.childrenIds || body.children_ids || null,
      extra_data: {
        admissionNumber: body.admissionNumber || null,
        dateOfBirth: body.dateOfBirth || null,
        bloodGroup: body.bloodGroup || null,
        medicalConditions: body.medicalConditions || null,
        parentEmail: body.parentEmail || null,
        class: body.class || null,
      },
    };

    const { data, error } = await supabaseAdmin.from('users').insert(row).select().single();
    if (error) throw error;

    const { password: _, ...userWithoutPassword } = toAppUser(data);
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.firstName || body.first_name) updates.first_name = body.firstName || body.first_name;
    if (body.lastName || body.last_name) updates.last_name = body.lastName || body.last_name;
    if (body.role) updates.role = body.role;
    if (body.phoneNumber || body.phone) updates.phone = body.phoneNumber || body.phone;
    if (body.address) updates.address = body.address;
    if (body.password) updates.password = body.password;
    if (body.classId || body.class_id) updates.class_id = body.classId || body.class_id;
    if (body.subjects) updates.subjects = body.subjects;
    if (body.parentId || body.parent_id) updates.parent_id = body.parentId || body.parent_id;
    if (body.childrenIds || body.children_ids) updates.children_ids = body.childrenIds || body.children_ids;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .ilike('email', email)
      .select()
      .single();

    if (error) throw error;
    const { password: _, ...userWithoutPassword } = toAppUser(data);
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const { data: user } = await supabaseAdmin.from('users').select('id').ilike('email', email).single();
    if (user?.id === 'admin-1') return NextResponse.json({ error: 'Cannot delete default admin' }, { status: 403 });

    const { error } = await supabaseAdmin.from('users').delete().ilike('email', email);
    if (error) throw error;

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
