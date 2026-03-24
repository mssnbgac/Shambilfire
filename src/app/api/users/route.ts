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
    // class: prefer extra_data.class (plain text name), fall back to class_id
    class: extra.class || row.class_id || null,
    subjects: row.subjects,
    parentId: row.parent_id,
    childrenIds: row.children_ids,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Student-specific fields — try extra_data first, then dedicated columns if they exist
    admissionNumber: extra.admissionNumber || row.admission_number || null,
    dateOfBirth: extra.dateOfBirth || row.date_of_birth || null,
    bloodGroup: extra.bloodGroup || row.blood_group || null,
    medicalConditions: extra.medicalConditions || row.medical_conditions || null,
    parentEmail: extra.parentEmail || row.parent_email || null,
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
    const id = searchParams.get('id');

    // Fetch single user by ID
    if (id) {
      const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const { password: _, ...u } = toAppUser(data);
      return NextResponse.json({ user: u });
    }

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

    const id = body.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const baseRow: any = {
      id,
      email: body.email.toLowerCase(),
      password: body.password,
      first_name: body.firstName || body.first_name || '',
      last_name: body.lastName || body.last_name || '',
      role: body.role,
      phone: body.phoneNumber || body.phone || null,
      address: body.address || null,
      // Only set class_id if it looks like a UUID/numeric FK, not a plain class name string
      // For students, class is stored in extra_data.class to avoid FK constraint issues
      class_id: null,
      subjects: body.subjects || null,
      parent_id: body.parentId || body.parent_id || null,
      children_ids: body.childrenIds || body.children_ids || null,
    };

    const extraData = {
      admissionNumber: body.admissionNumber || null,
      dateOfBirth: body.dateOfBirth || null,
      bloodGroup: body.bloodGroup || null,
      medicalConditions: body.medicalConditions || null,
      parentEmail: body.parentEmail || null,
      class: body.class || null,
    };

    // Try with extra_data first; fall back without it if column doesn't exist
    let data: any, error: any;
    const withExtra = await supabaseAdmin
      .from('users')
      .insert({ ...baseRow, extra_data: extraData })
      .select()
      .single();

    if (withExtra.error?.message?.includes('extra_data') || withExtra.error?.code === '42703') {
      // extra_data column doesn't exist yet — insert without it
      const withoutExtra = await supabaseAdmin.from('users').insert(baseRow).select().single();
      data = withoutExtra.data;
      error = withoutExtra.error;
    } else if (withExtra.error?.message?.includes('class_id') || withExtra.error?.message?.includes('foreign key')) {
      // class_id FK violation — store class only in extra_data
      const noClassId = { ...baseRow, class_id: null };
      const withoutClassId = await supabaseAdmin
        .from('users')
        .insert({ ...noClassId, extra_data: extraData })
        .select()
        .single();
      data = withoutClassId.data;
      error = withoutClassId.error;
    } else {
      data = withExtra.data;
      error = withExtra.error;
    }

    if (error) throw error;

    // If extra_data column didn't exist, patch the returned row so toAppUser still works
    if (data && !data.extra_data) {
      data.extra_data = extraData;
    }

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
    if (body.classId || body.class_id || body.class) updates.class_id = body.classId || body.class_id || body.class;
    if (body.subjects) updates.subjects = body.subjects;
    if (body.parentId || body.parent_id) updates.parent_id = body.parentId || body.parent_id;
    if (body.childrenIds || body.children_ids) updates.children_ids = body.childrenIds || body.children_ids;

    // Merge extra_data fields if any student-specific fields provided
    const extraFields: Record<string, any> = {};
    if (body.admissionNumber !== undefined) extraFields.admissionNumber = body.admissionNumber;
    if (body.dateOfBirth !== undefined) extraFields.dateOfBirth = body.dateOfBirth;
    if (body.bloodGroup !== undefined) extraFields.bloodGroup = body.bloodGroup;
    if (body.medicalConditions !== undefined) extraFields.medicalConditions = body.medicalConditions;
    if (body.parentEmail !== undefined) extraFields.parentEmail = body.parentEmail;
    if (body.class !== undefined) extraFields.class = body.class;
    if (Object.keys(extraFields).length > 0) {
      // Fetch current extra_data and merge
      const { data: current } = await supabaseAdmin.from('users').select('extra_data').ilike('email', email).single();
      updates.extra_data = { ...(current?.extra_data || {}), ...extraFields };
    }

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

// PATCH: update user by ID (used to fix extra_data for existing students)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const body = await request.json();

    // Fetch current row
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr || !current) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updates: any = { updated_at: new Date().toISOString() };

    // Top-level fields
    if (body.firstName) updates.first_name = body.firstName;
    if (body.lastName) updates.last_name = body.lastName;
    if (body.phone || body.phoneNumber) updates.phone = body.phone || body.phoneNumber;
    if (body.address) updates.address = body.address;
    // Don't update class_id to avoid FK issues — class is stored in extra_data

    // Merge extra_data
    const currentExtra = current.extra_data || {};
    const newExtra: any = { ...currentExtra };
    if (body.admissionNumber !== undefined) newExtra.admissionNumber = body.admissionNumber;
    if (body.dateOfBirth !== undefined) newExtra.dateOfBirth = body.dateOfBirth;
    if (body.bloodGroup !== undefined) newExtra.bloodGroup = body.bloodGroup;
    if (body.medicalConditions !== undefined) newExtra.medicalConditions = body.medicalConditions;
    if (body.parentEmail !== undefined) newExtra.parentEmail = body.parentEmail;
    if (body.class !== undefined) newExtra.class = body.class;
    updates.extra_data = newExtra;

    // Try update with extra_data; fall back without if column missing
    let data: any, error: any;
    const withExtra = await supabaseAdmin.from('users').update(updates).eq('id', id).select().single();
    if (withExtra.error?.message?.includes('extra_data') || withExtra.error?.code === '42703') {
      const { extra_data: _ed, ...updatesNoExtra } = updates;
      const fallback = await supabaseAdmin.from('users').update(updatesNoExtra).eq('id', id).select().single();
      data = fallback.data;
      error = fallback.error;
      // Patch in-memory so toAppUser returns correct data
      if (data) data.extra_data = newExtra;
    } else {
      data = withExtra.data;
      error = withExtra.error;
    }

    if (error) throw error;
    const { password: _, ...userWithoutPassword } = toAppUser(data);
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
