import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');

    let query = supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false });

    if (session) query = query.eq('session', session);
    if (term) query = query.eq('term', term);
    if (studentId) query = query.eq('student_id', studentId);
    if (studentName) query = query.ilike('student_name', `%${studentName}%`);

    const { data, error } = await query;
    if (error) throw error;

    // Map DB columns → app shape
    const payments = (data || []).map(toAppPayment);
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.studentName && !body.student_name) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }

    const row = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      student_id: body.studentId || body.student_id || null,
      student_name: body.studentName || body.student_name,
      amount: Number(body.amount),
      payment_type: body.paymentType || body.payment_type || body.feeType || null,
      session: body.academicSession || body.session || null,
      term: body.term || null,
      status: body.status || 'confirmed',
      payment_date: body.dateIssued || body.payment_date || new Date().toISOString(),
      confirmed_by: body.confirmedBy || body.confirmed_by || null,
      confirmed_at: body.confirmedAt || body.confirmed_at || null,
      notes: body.notes || null,
    };

    const { data, error } = await supabaseAdmin.from('payments').insert(row).select().single();
    if (error) throw error;

    return NextResponse.json({ payment: toAppPayment(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });

    const body = await request.json();
    const updates: any = { updated_at: new Date().toISOString() };
    if (body.status) updates.status = body.status;
    if (body.amount !== undefined) updates.amount = Number(body.amount);
    if (body.notes) updates.notes = body.notes;
    if (body.confirmedBy || body.confirmed_by) updates.confirmed_by = body.confirmedBy || body.confirmed_by;
    if (body.confirmedAt || body.confirmed_at) updates.confirmed_at = body.confirmedAt || body.confirmed_at;

    const { data, error } = await supabaseAdmin.from('payments').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ payment: toAppPayment(data) });
  } catch (error) {
    console.error('PUT /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'reset') {
      await supabaseAdmin.from('payments').delete().neq('id', '');
      return NextResponse.json({ message: 'All payments reset', count: 0 });
    }

    if (!id) return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('payments').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function toAppPayment(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    amount: row.amount,
    paymentType: row.payment_type,
    feeType: row.payment_type,
    academicSession: row.session,
    term: row.term,
    status: row.status,
    dateIssued: row.payment_date,
    confirmedBy: row.confirmed_by,
    confirmedAt: row.confirmed_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
