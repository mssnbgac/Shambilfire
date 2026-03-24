import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('id, type, data')
      .order('created_at');

    if (error) throw error;

    const images = (data || []).filter(r => r.type === 'image').map(r => r.data);
    const videos = (data || []).filter(r => r.type === 'video').map(r => r.data);

    return NextResponse.json({ images, videos }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rows: any[] = [];

    if (body.images && Array.isArray(body.images)) {
      body.images.forEach((data: string) => rows.push({ type: 'image', data }));
    }
    if (body.videos && Array.isArray(body.videos)) {
      body.videos.forEach((data: string) => rows.push({ type: 'video', data }));
    }

    if (rows.length > 0) {
      const { error } = await supabaseAdmin.from('gallery').insert(rows);
      if (error) throw error;
    }

    // Return updated gallery
    const { data } = await supabaseAdmin.from('gallery').select('id, type, data').order('created_at');
    const images = (data || []).filter(r => r.type === 'image').map(r => r.data);
    const videos = (data || []).filter(r => r.type === 'video').map(r => r.data);

    return NextResponse.json({ images, videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save gallery' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, index } = await request.json();

    // Get all items of that type ordered by created_at
    const { data } = await supabaseAdmin
      .from('gallery')
      .select('id')
      .eq('type', type)
      .order('created_at');

    if (data && data[index]) {
      await supabaseAdmin.from('gallery').delete().eq('id', data[index].id);
    }

    // Return updated gallery
    const { data: updated } = await supabaseAdmin.from('gallery').select('id, type, data').order('created_at');
    const images = (updated || []).filter(r => r.type === 'image').map(r => r.data);
    const videos = (updated || []).filter(r => r.type === 'video').map(r => r.data);

    return NextResponse.json({ images, videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
