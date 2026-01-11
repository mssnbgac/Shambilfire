// Exam storage utilities for demo mode
export interface ExamSchedule {
  id: string;
  subject: string;
  class: string;
  date: string;
  time: string;
  duration: number; // in minutes
  venue: string;
  examiner: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EXAMS_STORAGE_KEY = 'shambil_exams';

export const getExamSchedules = (): ExamSchedule[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (stored) {
      const exams = JSON.parse(stored);
      // Convert date strings back to Date objects
      return exams.map((exam: any) => ({
        ...exam,
        createdAt: new Date(exam.createdAt),
        updatedAt: new Date(exam.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading exam data:', error);
  }
  
  return [];
};

export const saveExamSchedule = (exam: Omit<ExamSchedule, 'id' | 'createdAt' | 'updatedAt'>): ExamSchedule => {
  const exams = getExamSchedules();
  
  const newExam: ExamSchedule = {
    ...exam,
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  exams.push(newExam);
  
  try {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  } catch (error) {
    console.error('Error saving exam:', error);
  }
  
  return newExam;
};

export const updateExamSchedule = (examId: string, updates: Partial<ExamSchedule>): boolean => {
  const exams = getExamSchedules();
  const examIndex = exams.findIndex(exam => exam.id === examId);
  
  if (examIndex !== -1) {
    exams[examIndex] = {
      ...exams[examIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
      return true;
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  }
  
  return false;
};

export const deleteExamSchedule = (examId: string): boolean => {
  const exams = getExamSchedules();
  const filteredExams = exams.filter(exam => exam.id !== examId);
  
  if (filteredExams.length !== exams.length) {
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(filteredExams));
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  }
  
  return false;
};

export const getExamsForClass = (className: string): ExamSchedule[] => {
  const allExams = getExamSchedules();
  return allExams.filter(exam => 
    exam.class.toLowerCase() === className.toLowerCase() ||
    exam.class.replace(/\s+/g, '').toLowerCase() === className.replace(/\s+/g, '').toLowerCase()
  );
};

export const getUpcomingExamsForClass = (className: string): ExamSchedule[] => {
  const classExams = getExamsForClass(className);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return classExams.filter(exam => {
    const examDate = new Date(exam.date);
    return examDate >= today && exam.status === 'scheduled';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const clearAllExams = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXAMS_STORAGE_KEY);
};

// Initialize with some demo exams
export const initializeDemoExams = (): void => {
  const existingExams = getExamSchedules();
  
  if (existingExams.length === 0) {
    const demoExams = [
      {
        subject: 'Mathematics',
        class: 'JSS 2A',
        date: '2024-02-15',
        time: '09:00',
        duration: 120,
        venue: 'Exam Hall A',
        examiner: 'Mr. Johnson',
        type: 'midterm' as const,
        status: 'scheduled' as const
      },
      {
        subject: 'English Language',
        class: 'JSS 2A',
        date: '2024-02-17',
        time: '09:00',
        duration: 120,
        venue: 'Exam Hall B',
        examiner: 'Mrs. Smith',
        type: 'midterm' as const,
        status: 'scheduled' as const
      },
      {
        subject: 'Physics',
        class: 'SS 1Science',
        date: '2024-02-20',
        time: '11:00',
        duration: 90,
        venue: 'Science Lab 1',
        examiner: 'Dr. Brown',
        type: 'practical' as const,
        status: 'scheduled' as const
      }
    ];
    
    demoExams.forEach(exam => {
      saveExamSchedule(exam);
    });
  }
};