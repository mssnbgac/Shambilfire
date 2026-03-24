import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function toAppLink(row: any) {
  return {
    id: row.id,
    parentId: row.parent_id,
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    childId: row.child_id,
    childName: row.child_name,
    childAdmissionNumber: row.child_admission_number,
    childClass: row.child_class,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const childId = searchParams.get('childId');

    let query = supabaseAdmin.from('parent_child_links').select('*');
    if (parentId) query = query.eq('parent_id', parentId);
    if (childId) query = query.eq('child_id', childId);

    const { data, error } = await query.order('created_at');
    if (error) throw error;
    return NextResponse.json({ links: (data || []).map(toAppLink) });
  } catch (error) {
    console.error('GET /api/parent-child-links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `link-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const row = {
      id,
      parent_id: body.parentId,
      parent_name: body.parentName,
      parent_email: body.parentEmail,
      child_id: body.childId,
      child_name: body.childName,
      child_admission_number: body.childAdmissionNumber || 'N/A',
      child_class: body.childClass || 'N/A',
    };

    const { data, error } = await supabaseAdmin.from('parent_child_links').insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ link: toAppLink(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/parent-child-links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('parent_child_links').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Link removed successfully' });
  } catch (error) {
    console.error('DELETE /api/parent-child-links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
