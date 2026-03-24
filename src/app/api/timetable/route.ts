import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');

    let query = supabaseAdmin.from('timetable').select('*').order('day').order('time');
    if (className) query = query.eq('class', className);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error('GET /api/timetable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const row = {
      id: `timetable-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      day: body.day,
      time: body.time,
      subject: body.subject,
      teacher: body.teacher,
      class: body.class,
      room: body.room,
    };

    const { data, error } = await supabaseAdmin.from('timetable').insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/timetable error:', error);
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
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.teacher !== undefined) updates.teacher = body.teacher;
    if (body.room !== undefined) updates.room = body.room;
    if (body.day !== undefined) updates.day = body.day;
    if (body.time !== undefined) updates.time = body.time;

    const { data, error } = await supabaseAdmin.from('timetable').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error('PUT /api/timetable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('timetable').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/timetable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
