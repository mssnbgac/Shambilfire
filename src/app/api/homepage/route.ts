import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_HOMEPAGE = {
  heroTitle: 'Welcome to Shambil Pride Academy',
  heroSubtitle: 'Excellence in Education, Character, and Leadership',
  heroDescription: 'Nurturing young minds for a brighter future through quality education and moral values.',
  aboutTitle: 'About Our School',
  aboutContent: 'Shambil Pride Academy is committed to providing quality education that develops both academic excellence and strong moral character.',
  principalMessage: 'At Shambil Pride Academy, we believe every child has the potential to excel.',
  principalName: 'Dr. Amina Abdullahi',
  principalTitle: 'Principal',
  contactInfo: {
    address: '45, Dan Masani Street, Birnin Gwari, Kaduna State, Nigeria',
    phone: '+234 803 401 2480',
    alternatePhone: '+234 807 938 7958',
    email: 'Shehubala70@gmail.com',
  },
};

export async function GET() {
  try {
    const { data } = await supabaseAdmin.from('homepage').select('value').eq('key', 'content').single();
    return NextResponse.json({ homepage: data?.value || DEFAULT_HOMEPAGE });
  } catch {
    return NextResponse.json({ homepage: DEFAULT_HOMEPAGE });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get existing content
    const { data: existing } = await supabaseAdmin.from('homepage').select('value').eq('key', 'content').single();
    const merged = { ...(existing?.value || DEFAULT_HOMEPAGE), ...body, lastUpdated: new Date().toISOString() };

    await supabaseAdmin.from('homepage').upsert({ key: 'content', value: merged, updated_at: new Date().toISOString() });

    return NextResponse.json({ homepage: merged });
  } catch (error) {
    console.error('PUT /api/homepage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
