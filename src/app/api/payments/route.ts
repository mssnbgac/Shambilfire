import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for payments (in production, use a database)
let payments: any[] = [];

// Initialize with demo payments
const initializePayments = () => {
  if (payments.length === 0) {
    payments = [
      {
        id: 'pay-001',
        studentId: 'student-1',
        studentName: 'David Smith',
        admissionNumber: 'SPA/2023/001',
        receiptNumber: 'SPA/2024/0001',
        amount: 85000,
        paymentMethod: 'Bank Transfer',
        bankName: 'First Bank Nigeria',
        accountNumber: '2013456789',
        transactionId: 'TXN2024001',
        description: 'School Fees Payment - First Term',
        academicSession: '2024/2025',
        term: 'First Term',
        dateIssued: new Date().toISOString(),
        confirmedBy: 'accountant-1',
        status: 'confirmed'
      },
      {
        id: 'pay-002',
        studentId: 'student-1',
        studentName: 'David Smith',
        admissionNumber: 'SPA/2023/001',
        receiptNumber: 'SPA/2024/0002',
        amount: 95000,
        paymentMethod: 'Cash',
        transactionId: 'CASH2024001',
        description: 'School Fees Payment - Second Term',
        academicSession: '2024/2025',
        term: 'Second Term',
        dateIssued: new Date().toISOString(),
        confirmedBy: 'accountant-1',
        status: 'confirmed'
      }
    ];
  }
};

// GET - Retrieve payments
export async function GET(request: NextRequest) {
  try {
    initializePayments();
    
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');
    
    let filteredPayments = payments;
    
    if (session && term) {
      filteredPayments = payments.filter(p => 
        p.academicSession === session && p.term === term
      );
    }
    
    if (studentId) {
      filteredPayments = filteredPayments.filter(p => p.studentId === studentId);
    }
    
    if (studentName) {
      filteredPayments = filteredPayments.filter(p => 
        p.studentName.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    
    return NextResponse.json({ payments: filteredPayments });
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    initializePayments();
    
    const paymentData = await request.json();
    
    const newPayment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dateIssued: new Date().toISOString(),
      status: 'confirmed'
    };
    
    payments.push(newPayment);
    
    return NextResponse.json({ payment: newPayment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update payment
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    const updateData = await request.json();
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }
    
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ payment: payments[paymentIndex] });
  } catch (error) {
    console.error('PUT /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}