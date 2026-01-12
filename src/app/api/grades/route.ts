import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for grades (in production, use a database)
let grades: any[] = [];

// Initialize with demo grades
const initializeGrades = () => {
  if (grades.length === 0) {
    grades = [
      {
        id: 'grade-001',
        studentId: 'student-1',
        studentName: 'David Smith',
        admissionNumber: 'SPA/2023/001',
        subjectId: 'math',
        subjectName: 'Mathematics',
        classId: 'jss2a',
        term: 'First Term',
        academicYear: '2024/2025',
        assessments: { firstCA: 18, secondCA: 17, exam: 52 },
        total: 87,
        grade: 'A',
        remark: 'Excellent',
        position: 1,
        teacherId: 'teacher-1',
        enteredBy: 'teacher-1',
        dateEntered: new Date().toISOString()
      }
    ];
  }
};

// GET - Retrieve grades
export async function GET(request: NextRequest) {
  try {
    initializeGrades();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentName = searchParams.get('studentName');
    const session = searchParams.get('session');
    const term = searchParams.get('term');
    const classId = searchParams.get('classId');
    
    let filteredGrades = grades;
    
    if (studentId) {
      filteredGrades = filteredGrades.filter(g => g.studentId === studentId);
    }
    
    if (studentName) {
      filteredGrades = filteredGrades.filter(g => 
        g.studentName.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    
    if (session && term) {
      filteredGrades = filteredGrades.filter(g => 
        g.academicYear === session && g.term === term
      );
    }
    
    if (classId) {
      filteredGrades = filteredGrades.filter(g => g.classId === classId);
    }
    
    return NextResponse.json({ grades: filteredGrades });
  } catch (error) {
    console.error('GET /api/grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new grade
export async function POST(request: NextRequest) {
  try {
    initializeGrades();
    
    const gradeData = await request.json();
    
    const newGrade = {
      ...gradeData,
      id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dateEntered: new Date().toISOString()
    };
    
    grades.push(newGrade);
    
    return NextResponse.json({ grade: newGrade }, { status: 201 });
  } catch (error) {
    console.error('POST /api/grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update grade
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('id');
    const updateData = await request.json();
    
    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID required' }, { status: 400 });
    }
    
    const gradeIndex = grades.findIndex(g => g.id === gradeId);
    
    if (gradeIndex === -1) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }
    
    grades[gradeIndex] = {
      ...grades[gradeIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ grade: grades[gradeIndex] });
  } catch (error) {
    console.error('PUT /api/grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}