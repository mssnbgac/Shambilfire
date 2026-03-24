import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');

    if (!session || !term) {
      return NextResponse.json({ error: 'Session and term required' }, { status: 400 });
    }

    const [{ data: payments }, { data: expenditures }] = await Promise.all([
      supabaseAdmin.from('payments').select('amount').eq('session', session).eq('term', term),
      supabaseAdmin.from('expenditures').select('amount, status, category').eq('session', session),
    ]);

    const totalIncome = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const approvedExp = (expenditures || []).filter(e => e.status === 'approved' || e.status === 'completed');
    const totalExpenditure = approvedExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const expenditureCategories = (expenditures || []).reduce((acc: any, e) => {
      if (e.status === 'approved' || e.status === 'completed') {
        const cat = e.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
      }
      return acc;
    }, {});

    return NextResponse.json({
      financialOverview: {
        session,
        term,
        totalIncome,
        totalRevenue: totalIncome,
        totalExpenditure,
        availableFunds: totalIncome - totalExpenditure,
        totalPayments: (payments || []).length,
        totalExpenditures: (expenditures || []).length,
        approvedExpenditures: approvedExp.length,
        pendingExpenditures: (expenditures || []).filter(e => e.status === 'pending').length,
        expenditureCategories,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/finances error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
