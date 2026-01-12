import { NextRequest, NextResponse } from 'next/server';

// GET - Calculate financial overview for session/term
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    
    if (!session || !term) {
      return NextResponse.json({ error: 'Session and term required' }, { status: 400 });
    }
    
    // Get payments for the session/term
    const paymentsResponse = await fetch(`${request.nextUrl.origin}/api/payments?session=${session}&term=${term}`);
    const paymentsData = await paymentsResponse.json();
    const payments = paymentsData.payments || [];
    
    // Get expenditures for the session/term
    const expendituresResponse = await fetch(`${request.nextUrl.origin}/api/expenditures?session=${session}&term=${term}`);
    const expendituresData = await expendituresResponse.json();
    const expenditures = expendituresData.expenditures || [];
    
    // Calculate totals
    const totalIncome = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
    const approvedExpenditures = expenditures.filter((exp: any) => exp.status === 'approved');
    const totalExpenditure = approvedExpenditures.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    const availableFunds = totalIncome - totalExpenditure;
    
    // Payment method breakdown
    const paymentMethods = payments.reduce((acc: any, payment: any) => {
      const method = payment.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + payment.amount;
      return acc;
    }, {});
    
    // Expenditure category breakdown
    const expenditureCategories = approvedExpenditures.reduce((acc: any, exp: any) => {
      const category = exp.category || 'Other';
      acc[category] = (acc[category] || 0) + exp.amount;
      return acc;
    }, {});
    
    const financialOverview = {
      session,
      term,
      totalIncome,
      totalExpenditure,
      availableFunds,
      totalPayments: payments.length,
      totalExpenditures: expenditures.length,
      approvedExpenditures: approvedExpenditures.length,
      pendingExpenditures: expenditures.filter((exp: any) => exp.status === 'pending').length,
      paymentMethods,
      expenditureCategories,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({ financialOverview });
  } catch (error) {
    console.error('GET /api/finances error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}