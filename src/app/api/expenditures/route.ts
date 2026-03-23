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

// Load expenditures from persistent storage
function loadExpenditures(): any[] {
  try {
    ensureDataDirectory();
    
    if (fs.existsSync(EXPENDITURES_FILE)) {
      const data = fs.readFileSync(EXPENDITURES_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // First time - create file with empty data
      const emptyData = getDefaultExpenditures();
      saveExpenditures(emptyData);
      return emptyData;
    }
  } catch (error) {
    console.error('Error loading expenditures:', error);
    return getDefaultExpenditures();
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

// Get default expenditures (empty array for fresh start)
function getDefaultExpenditures(): any[] {
  return [];
}

// GET - Retrieve expenditures
export async function GET(request: NextRequest) {
  try {
    const expenditures = loadExpenditures();
    
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    
    let filteredExpenditures = expenditures;
    
    if (session) {
      filteredExpenditures = filteredExpenditures.filter(e => 
        e.academicSession === session
      );
    }
    
    if (term) {
      filteredExpenditures = filteredExpenditures.filter(e => 
        e.term === term
      );
    }
    
    if (status) {
      filteredExpenditures = filteredExpenditures.filter(e => e.status === status);
    }
    
    if (userId) {
      filteredExpenditures = filteredExpenditures.filter(e => e.requestedBy === userId);
    }
    
    return NextResponse.json({ expenditures: filteredExpenditures });
  } catch (error) {
    console.error('GET /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// POST - Create new expenditure request
export async function POST(request: NextRequest) {
  try {
    const expenditures = loadExpenditures();
    const expenditureData = await request.json();
    
    const newExpenditure = {
      ...expenditureData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expenditures.push(newExpenditure);
    saveExpenditures(expenditures);
    
    return NextResponse.json({ expenditure: newExpenditure }, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// PUT - Update expenditure (approve/reject/edit)
export async function PUT(request: NextRequest) {
  try {
    const expenditures = loadExpenditures();
    const { searchParams } = new URL(request.url);
    const expenditureId = searchParams.get('id');
    const updateData = await request.json();
    
    if (!expenditureId) {
      return NextResponse.json({ error: 'Expenditure ID required' }, { status: 400 });
    }
    
    const expenditureIndex = expenditures.findIndex(e => e.id === expenditureId);
    
    if (expenditureIndex === -1) {
      return NextResponse.json({ error: 'Expenditure not found' }, { status: 404 });
    }
    
    // Update expenditure
    expenditures[expenditureIndex] = {
      ...expenditures[expenditureIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    saveExpenditures(expenditures);
    
    return NextResponse.json({ expenditure: expenditures[expenditureIndex] });
  } catch (error) {
    console.error('PUT /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// DELETE - Delete expenditure request
export async function DELETE(request: NextRequest) {
  try {
    const expenditures = loadExpenditures();
    const { searchParams } = new URL(request.url);
    const expenditureId = searchParams.get('id');
    
    if (!expenditureId) {
      return NextResponse.json({ error: 'Expenditure ID required' }, { status: 400 });
    }
    
    const expenditureIndex = expenditures.findIndex(e => e.id === expenditureId);
    
    if (expenditureIndex === -1) {
      return NextResponse.json({ error: 'Expenditure not found' }, { status: 404 });
    }
    
    // Only allow deletion if status is pending or rejected
    if (expenditures[expenditureIndex].status !== 'pending' && expenditures[expenditureIndex].status !== 'rejected') {
      return NextResponse.json({ error: 'Cannot delete approved or completed expenditures' }, { status: 403 });
    }
    
    // Remove expenditure
    const deletedExpenditure = expenditures.splice(expenditureIndex, 1)[0];
    saveExpenditures(expenditures);
    
    return NextResponse.json({ expenditure: deletedExpenditure, message: 'Expenditure deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}