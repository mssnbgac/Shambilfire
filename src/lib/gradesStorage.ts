// Grades storage utilities for demo mode
export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  academicYear: string;
  assessments: {
    firstCA: number;
    secondCA: number;
    exam: number;
  };
  total: number;
  grade: string;
  remark: string;
  position?: number;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

const GRADES_STORAGE_KEY = 'student_grades';

export const getStudentGrades = (): StudentGrade[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(GRADES_STORAGE_KEY);
    if (stored) {
      const grades = JSON.parse(stored);
      // Convert date strings back to Date objects and ensure numbers are properly typed
      return grades.map((grade: any) => ({
        ...grade,
        assessments: {
          firstCA: Number(grade.assessments.firstCA),
          secondCA: Number(grade.assessments.secondCA),
          exam: Number(grade.assessments.exam)
        },
        total: Number(grade.total),
        position: grade.position ? Number(grade.position) : undefined,
        createdAt: new Date(grade.createdAt),
        updatedAt: new Date(grade.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading grades data:', error);
  }
  
  return [];
};

export const saveStudentGrade = (grade: Omit<StudentGrade, 'id' | 'createdAt' | 'updatedAt'>): StudentGrade => {
  const grades = getStudentGrades();
  
  const newGrade: StudentGrade = {
    ...grade,
    id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  grades.push(newGrade);
  
  try {
    localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
  } catch (error) {
    console.error('Error saving grade:', error);
  }
  
  return newGrade;
};

export const getGradesByStudent = (studentId: string, academicYear?: string, term?: string): StudentGrade[] => {
  const allGrades = getStudentGrades();
  
  return allGrades.filter(grade => {
    let matches = grade.studentId === studentId;
    
    if (academicYear) {
      matches = matches && grade.academicYear === academicYear;
    }
    
    if (term) {
      matches = matches && grade.term === term;
    }
    
    return matches;
  });
};

export const getGradesByStudentAndSession = (studentId: string, academicYear: string, term: string): StudentGrade[] => {
  return getGradesByStudent(studentId, academicYear, term);
};

export const clearAllGrades = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GRADES_STORAGE_KEY);
};

// Initialize with some demo grades for testing
export const initializeDemoGrades = (): void => {
  const existingGrades = getStudentGrades();
  
  if (existingGrades.length === 0) {
    const demoGrades = [
      {
        studentId: 'student-demo-1',
        studentName: 'David Smith',
        admissionNumber: 'SPA/2023/001',
        subjectId: 'math',
        subjectName: 'Mathematics',
        classId: 'jss2a',
        term: 'First Term' as const,
        academicYear: '2023/2024',
        assessments: { firstCA: 18, secondCA: 17, exam: 52 },
        total: 87,
        grade: 'A',
        remark: 'Excellent',
        position: 1,
        teacherId: 'teacher-1'
      },
      {
        studentId: 'student-demo-1',
        studentName: 'David Smith',
        admissionNumber: 'SPA/2023/001',
        subjectId: 'eng',
        subjectName: 'English Language',
        classId: 'jss2a',
        term: 'First Term' as const,
        academicYear: '2023/2024',
        assessments: { firstCA: 16, secondCA: 18, exam: 48 },
        total: 82,
        grade: 'A',
        remark: 'Very Good',
        position: 2,
        teacherId: 'teacher-1'
      }
    ];
    
    demoGrades.forEach(grade => {
      saveStudentGrade(grade);
    });
  }
};