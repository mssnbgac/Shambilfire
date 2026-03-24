import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    await supabaseAdmin.from('payments').delete().neq('id', '');
    return NextResponse.json({ message: 'All payments reset successfully', count: 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset payments' }, { status: 500 });
  }
}
