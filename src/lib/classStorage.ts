// Class management system for Shambil Pride Academy
export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  section: string;
  academicYear: string;
  capacity: number;
  currentEnrollment: number;
  subjects: string[];
  description: string;
  classTeacher?: string;
  classTeacherId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CLASSES_STORAGE_KEY = 'school_classes';

export const getClasses = (): SchoolClass[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (stored) {
      const classes = JSON.parse(stored);
      return classes.map((cls: any) => ({
        ...cls,
        createdAt: new Date(cls.createdAt),
        updatedAt: new Date(cls.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading classes:', error);
  }
  
  return [];
};

export const saveClass = (classData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt'>): SchoolClass => {
  const classes = getClasses();
  
  // Check if class name already exists for the same academic year
  const existingClass = classes.find(cls => 
    cls.name.toLowerCase() === classData.name.toLowerCase() && 
    cls.academicYear === classData.academicYear
  );
  
  if (existingClass) {
    throw new Error(`Class "${classData.name}" already exists for academic year ${classData.academicYear}`);
  }
  
  const newClass: SchoolClass = {
    ...classData,
    id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    currentEnrollment: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  classes.push(newClass);
  
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Error saving class:', error);
    throw new Error('Failed to save class');
  }
  
  return newClass;
};

export const updateClass = (classId: string, updates: Partial<SchoolClass>): SchoolClass | null => {
  const classes = getClasses();
  const classIndex = classes.findIndex(cls => cls.id === classId);
  
  if (classIndex === -1) {
    return null;
  }
  
  const updatedClass = {
    ...classes[classIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  classes[classIndex] = updatedClass;
  
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return updatedClass;
  } catch (error) {
    console.error('Error updating class:', error);
    return null;
  }
};

export const deleteClass = (classId: string): boolean => {
  const classes = getClasses();
  const filteredClasses = classes.filter(cls => cls.id !== classId);
  
  if (filteredClasses.length === classes.length) {
    return false; // Class not found
  }
  
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(filteredClasses));
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    return false;
  }
};

export const getClassById = (classId: string): SchoolClass | null => {
  const classes = getClasses();
  return classes.find(cls => cls.id === classId) || null;
};

export const getClassesByAcademicYear = (academicYear: string): SchoolClass[] => {
  const classes = getClasses();
  return classes.filter(cls => cls.academicYear === academicYear);
};

export const updateClassEnrollment = (classId: string, enrollmentChange: number): SchoolClass | null => {
  const classes = getClasses();
  const classIndex = classes.findIndex(cls => cls.id === classId);
  
  if (classIndex === -1) {
    return null;
  }
  
  const currentClass = classes[classIndex];
  const newEnrollment = Math.max(0, currentClass.currentEnrollment + enrollmentChange);
  
  if (newEnrollment > currentClass.capacity) {
    throw new Error('Class capacity exceeded');
  }
  
  const updatedClass = {
    ...currentClass,
    currentEnrollment: newEnrollment,
    updatedAt: new Date()
  };
  
  classes[classIndex] = updatedClass;
  
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return updatedClass;
  } catch (error) {
    console.error('Error updating class enrollment:', error);
    return null;
  }
};

// Initialize demo classes
export const initializeDemoClasses = (): void => {
  const existingClasses = getClasses();
  
  if (existingClasses.length === 0) {
    const demoClasses = [
      {
        name: 'JSS 1A',
        level: 'JSS 1',
        section: 'A',
        academicYear: '2023/2024',
        capacity: 35,
        currentEnrollment: 28,
        subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'French', 'Physical Education'],
        description: 'Junior Secondary School 1, Section A - Foundation level with focus on core subjects',
        classTeacher: 'Mary Johnson',
        classTeacherId: 'teacher-1'
      },
      {
        name: 'JSS 1B',
        level: 'JSS 1',
        section: 'B',
        academicYear: '2023/2024',
        capacity: 35,
        currentEnrollment: 32,
        subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'French', 'Physical Education'],
        description: 'Junior Secondary School 1, Section B - Foundation level with focus on core subjects',
        classTeacher: 'Michael Brown',
        classTeacherId: 'teacher-2'
      },
      {
        name: 'JSS 2A',
        level: 'JSS 2',
        section: 'A',
        academicYear: '2023/2024',
        capacity: 40,
        currentEnrollment: 35,
        subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'French', 'Physical Education', 'Agricultural Science'],
        description: 'Junior Secondary School 2, Section A - Intermediate level with expanded curriculum',
        classTeacher: 'Lisa Garcia',
        classTeacherId: 'teacher-3'
      },
      {
        name: 'JSS 3A',
        level: 'JSS 3',
        section: 'A',
        academicYear: '2023/2024',
        capacity: 40,
        currentEnrollment: 38,
        subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'French', 'Physical Education', 'Agricultural Science', 'Business Studies'],
        description: 'Junior Secondary School 3, Section A - Preparation for Senior Secondary School',
        classTeacher: 'Mary Johnson',
        classTeacherId: 'teacher-1'
      },
      {
        name: 'SS 1A',
        level: 'SS 1',
        section: 'A',
        academicYear: '2023/2024',
        capacity: 30,
        currentEnrollment: 25,
        subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Geography', 'Economics', 'Government', 'Literature in English'],
        description: 'Senior Secondary School 1, Section A - Science and Arts combination',
        classTeacher: 'Michael Brown',
        classTeacherId: 'teacher-2'
      },
      {
        name: 'SS 2A',
        level: 'SS 2',
        section: 'A',
        academicYear: '2023/2024',
        capacity: 30,
        currentEnrollment: 27,
        subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics'],
        description: 'Senior Secondary School 2, Section A - Science track focused on STEM subjects',
        classTeacher: 'Lisa Garcia',
        classTeacherId: 'teacher-3'
      }
    ];
    
    demoClasses.forEach(classData => {
      try {
        saveClass(classData);
      } catch (error) {
        console.error('Error initializing demo class:', error);
      }
    });
  }
};