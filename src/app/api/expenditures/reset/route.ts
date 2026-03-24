import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    await supabaseAdmin.from('expenditures').delete().neq('id', '');
    return NextResponse.json({ message: 'All expenditures reset successfully', count: 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset expenditures' }, { status: 500 });
  }
}
