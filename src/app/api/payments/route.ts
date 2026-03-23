import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Persistent file-based storage for payments
const PAYMENTS_FILE = path.join(process.cwd(), 'data', 'payments.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(PAYMENTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load payments from persistent storage
function loadPayments(): any[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PAYMENTS_FILE)) {
      const raw = fs.readFileSync(PAYMENTS_FILE, 'utf8').trim();
      if (!raw) return [];
      return JSON.parse(raw);
    } else {
      savePayments([]);
      return [];
    }
  } catch (error) {
    console.error('Error loading payments:', error);
    return [];
  }
}

// Save payments to persistent storage
function savePayments(payments: any[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error('Error saving payments:', error);
  }
}

// Get comprehensive default payments
function getDefaultPayments(): any[] {
  // Return empty array by default - no demo data
  return [];
}

// GET - Retrieve payments
export async function GET(request: NextRequest) {
  try {
    const payments = loadPayments();
    
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
    } else if (session) {
      filteredPayments = payments.filter(p => p.academicSession === session);
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
    const paymentData = await request.json();
    
    if (!paymentData.studentName || !paymentData.amount) {
      return NextResponse.json({ error: 'studentName and amount are required' }, { status: 400 });
    }

    const payments = loadPayments();
    
    const newPayment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dateIssued: paymentData.dateIssued || new Date().toISOString(),
      status: 'confirmed',
    };
    
    payments.push(newPayment);
    savePayments(payments);
    
    // Verify it was saved
    const saved = loadPayments();
    console.log(`Payment saved. Total payments now: ${saved.length}`);
    
    return NextResponse.json({ payment: newPayment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

// PUT - Update payment
export async function PUT(request: NextRequest) {
  try {
    const payments = loadPayments();
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
    
    savePayments(payments);
    
    return NextResponse.json({ payment: payments[paymentIndex] });
  } catch (error) {
    console.error('PUT /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Reset all payments (clear all data)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'reset' || request.url.includes('/reset')) {
      // Clear the payments file
      savePayments([]);
      return NextResponse.json({ 
        message: 'All payments have been reset', 
        count: 0 
      });
    }
    
    // Regular delete by ID
    const paymentId = searchParams.get('id');
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required for deletion' }, { status: 400 });
    }
    
    const payments = loadPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    const deletedPayment = payments.splice(paymentIndex, 1)[0];
    savePayments(payments);
    
    return NextResponse.json({ 
      payment: deletedPayment, 
      message: 'Payment deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE /api/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}