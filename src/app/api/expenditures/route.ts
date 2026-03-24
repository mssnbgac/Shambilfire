import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = supabaseAdmin.from('expenditures').select('*').order('created_at', { ascending: false });

    if (session) query = query.eq('session', session);
    if (term) query = query.eq('term', term);
    if (status) query = query.eq('status', status);
    if (userId) query = query.eq('requested_by', userId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ expenditures: (data || []).map(toAppExpenditure) });
  } catch (error) {
    console.error('GET /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const row = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: body.title,
      amount: Number(body.amount),
      category: body.category || null,
      description: body.description || null,
      session: body.academicSession || body.session || null,
      term: body.term || null,
      status: 'pending',
      requested_by: body.requestedBy || body.requested_by || null,
      requested_by_name: body.requestedByName || body.requested_by_name || null,
    };

    const { data, error } = await supabaseAdmin.from('expenditures').insert(row).select().single();
    if (error) throw error;

    return NextResponse.json({ expenditure: toAppExpenditure(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Expenditure ID required' }, { status: 400 });

    const body = await request.json();
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.amount !== undefined) updates.amount = Number(body.amount);
    if (body.title) updates.title = body.title;
    if (body.category) updates.category = body.category;
    if (body.description) updates.description = body.description;
    if (body.approvedBy || body.approved_by) updates.approved_by = body.approvedBy || body.approved_by;
    if (body.approvedAt || body.approved_at) updates.approved_at = body.approvedAt || body.approved_at;
    if (body.approvedByName || body.approved_by_name) updates.approved_by_name = body.approvedByName || body.approved_by_name;
    if (body.rejectedReason || body.rejected_reason) updates.rejected_reason = body.rejectedReason || body.rejected_reason;
    if (body.notes) updates.notes = body.notes;

    // Try with all optional columns first, fall back to minimal update if columns missing
    let data: any, error: any;
    const fullUpdate = { ...updates, updated_at: new Date().toISOString() };
    const withTs = await supabaseAdmin.from('expenditures').update(fullUpdate).eq('id', id).select().single();

    if (withTs.error) {
      const msg = withTs.error.message || '';
      if (msg.includes('column') || msg.includes('does not exist') || withTs.error.code === '42703') {
        // Some columns don't exist — strip optional ones and retry with just core fields
        const coreUpdates: any = {};
        if (updates.status) coreUpdates.status = updates.status;
        if (updates.amount !== undefined) coreUpdates.amount = updates.amount;
        if (updates.title) coreUpdates.title = updates.title;
        if (updates.category) coreUpdates.category = updates.category;
        if (updates.description) coreUpdates.description = updates.description;
        if (updates.approved_by) coreUpdates.approved_by = updates.approved_by;
        if (updates.approved_at) coreUpdates.approved_at = updates.approved_at;

        const fallback = await supabaseAdmin.from('expenditures').update(coreUpdates).eq('id', id).select().single();
        data = fallback.data;
        error = fallback.error;
      } else {
        data = withTs.data;
        error = withTs.error;
      }
    } else {
      data = withTs.data;
      error = withTs.error;
    }

    if (error) {
      console.error('Supabase PUT expenditure error:', error);
      throw error;
    }

    return NextResponse.json({ expenditure: toAppExpenditure(data) });
  } catch (error: any) {
    console.error('PUT /api/expenditures error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error', detail: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Expenditure ID required' }, { status: 400 });

    // Check status before deleting
    const { data: exp } = await supabaseAdmin.from('expenditures').select('status').eq('id', id).single();
    if (exp && exp.status !== 'pending' && exp.status !== 'rejected') {
      return NextResponse.json({ error: 'Cannot delete approved expenditures' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('expenditures').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Expenditure deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function toAppExpenditure(row: any) {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category,
    description: row.description,
    academicSession: row.session,
    term: row.term,
    status: row.status,
    requestedBy: row.requested_by,
    requestedByName: row.requested_by_name,
    approvedBy: row.approved_by,
    approvedByName: row.approved_by_name,
    approvedAt: row.approved_at,
    rejectedReason: row.rejected_reason,
    notes: row.notes,
    requestedAt: row.created_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    priority: row.priority || 'medium',
  };
}
