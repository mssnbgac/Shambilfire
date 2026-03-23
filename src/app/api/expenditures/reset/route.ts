import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Persistent file-based storage for expenditures
const EXPENDITURES_FILE = path.join(process.cwd(), 'data', 'expenditures.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(EXPENDITURES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Save expenditures to persistent storage
function saveExpenditures(expenditures: any[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(EXPENDITURES_FILE, JSON.stringify(expenditures, null, 2));
  } catch (error) {
    console.error('Error saving expenditures:', error);
  }
}

// DELETE - Reset all expenditures (clear all data)
export async function DELETE(request: NextRequest) {
  try {
    // Clear the expenditures file by saving empty array
    saveExpenditures([]);
    
    return NextResponse.json({ 
      message: 'All expenditures have been successfully reset to zero', 
      count: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DELETE /api/expenditures/reset error:', error);
    return NextResponse.json({ error: 'Failed to reset expenditures' }, { status: 500 });
  }
}