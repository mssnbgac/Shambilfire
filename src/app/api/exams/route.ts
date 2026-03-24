import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    const status = searchParams.get('status');

    let query = supabaseAdmin.from('exams').select('*').order('date');
    if (className) query = query.eq('class', className);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ exams: data || [] });
  } catch (error) {
    console.error('GET /api/exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const row = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      subject: body.subject,
      class: body.class,
      date: body.date,
      time: body.time,
      duration: body.duration || 120,
      venue: body.venue,
      examiner: body.examiner || null,
      type: body.type || 'midterm',
      status: body.status || 'scheduled',
    };

    const { data, error } = await supabaseAdmin.from('exams').insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ exam: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    const updates: any = {};
    const fields = ['subject', 'class', 'date', 'time', 'duration', 'venue', 'examiner', 'type', 'status'];
    fields.forEach(f => { if (body[f] !== undefined) updates[f] = body[f]; });

    const { data, error } = await supabaseAdmin.from('exams').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ exam: data });
  } catch (error) {
    console.error('PUT /api/exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('exams').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/exams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
