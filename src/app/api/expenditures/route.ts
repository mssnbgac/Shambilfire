import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for expenditures (in production, use a database)
let expenditures: any[] = [];

// Initialize with demo expenditures
const initializeExpenditures = () => {
  if (expenditures.length === 0) {
    expenditures = [
      {
        id: 'exp-001',
        title: 'Classroom Renovation',
        description: 'Renovation of JSS 2 classrooms including painting and furniture repair',
        amount: 150000,
        category: 'Infrastructure',
        priority: 'high',
        academicSession: '2024/2025',
        term: 'First Term',
        requestedBy: 'admin-1',
        requestedByName: 'John Administrator',
        dateRequested: new Date().toISOString(),
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        rejectionReason: null
      },
      {
        id: 'exp-002',
        title: 'Laboratory Equipment',
        description: 'Purchase of new chemistry lab equipment and chemicals',
        amount: 200000,
        category: 'Equipment',
        priority: 'medium',
        academicSession: '2024/2025',
        term: 'First Term',
        requestedBy: 'teacher-1',
        requestedByName: 'Mary Johnson',
        dateRequested: new Date().toISOString(),
        status: 'approved',
        approvedBy: 'admin-1',
        approvedDate: new Date().toISOString(),
        rejectionReason: null
      }
    ];
  }
};

// GET - Retrieve expenditures
export async function GET(request: NextRequest) {
  try {
    initializeExpenditures();
    
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const status = searchParams.get('status');
    
    let filteredExpenditures = expenditures;
    
    if (session && term) {
      filteredExpenditures = expenditures.filter(e => 
        e.academicSession === session && e.term === term
      );
    }
    
    if (status) {
      filteredExpenditures = filteredExpenditures.filter(e => e.status === status);
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
    initializeExpenditures();
    
    const expenditureData = await request.json();
    
    const newExpenditure = {
      ...expenditureData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dateRequested: new Date().toISOString(),
      status: 'pending',
      approvedBy: null,
      approvedDate: null,
      rejectionReason: null
    };
    
    expenditures.push(newExpenditure);
    
    return NextResponse.json({ expenditure: newExpenditure }, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update expenditure (approve/reject)
export async function PUT(request: NextRequest) {
  try {
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
    
    expenditures[expenditureIndex] = {
      ...expenditures[expenditureIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ expenditure: expenditures[expenditureIndex] });
  } catch (error) {
    console.error('PUT /api/expenditures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}