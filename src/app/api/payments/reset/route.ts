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

// Save payments to persistent storage
function savePayments(payments: any[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error('Error saving payments:', error);
  }
}

// DELETE - Reset all payments (clear all data)
export async function DELETE(request: NextRequest) {
  try {
    // Clear the payments file by saving empty array
    savePayments([]);
    
    return NextResponse.json({ 
      message: 'All payments have been successfully reset to zero', 
      count: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DELETE /api/payments/reset error:', error);
    return NextResponse.json({ error: 'Failed to reset payments' }, { status: 500 });
  }
}