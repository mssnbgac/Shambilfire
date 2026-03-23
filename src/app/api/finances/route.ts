import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'payments.json');
const EXPENDITURES_FILE = path.join(process.cwd(), 'data', 'expenditures.json');

function readJSON(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');

    if (!session || !term) {
      return NextResponse.json({ error: 'Session and term required' }, { status: 400 });
    }

    // Read directly from files — no internal HTTP calls
    const allPayments: any[] = readJSON(PAYMENTS_FILE);
    const allExpenditures: any[] = readJSON(EXPENDITURES_FILE);

    const payments = allPayments.filter(
      (p) => p.academicSession === session && p.term === term
    );

    const expenditures = allExpenditures.filter(
      (e) => e.academicSession === session
    );

    const totalIncome = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const approvedExpenditures = expenditures.filter((e) => e.status === 'approved' || e.status === 'completed');
    const totalExpenditure = approvedExpenditures.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const availableFunds = totalIncome - totalExpenditure;

    const paymentMethods = payments.reduce((acc: any, p) => {
      const method = p.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + (Number(p.amount) || 0);
      return acc;
    }, {});

    const expenditureCategories = approvedExpenditures.reduce((acc: any, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {});

    return NextResponse.json({
      financialOverview: {
        session,
        term,
        totalIncome,
        totalRevenue: totalIncome,
        totalExpenditure,
        availableFunds,
        totalPayments: payments.length,
        totalExpenditures: expenditures.length,
        approvedExpenditures: approvedExpenditures.length,
        pendingExpenditures: expenditures.filter((e) => e.status === 'pending').length,
        paymentMethods,
        expenditureCategories,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/finances error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
