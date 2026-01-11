// User Types
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'exam_officer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Student Types
export interface Student extends User {
  role: 'student';
  studentId: string;
  classId: string;
  parentIds: string[];
  admissionDate: Date;
  bloodGroup?: string;
  medicalConditions?: string[];
}

// Teacher Types
export interface Teacher extends User {
  role: 'teacher';
  teacherId: string;
  subjects: string[];
  classes: string[];
  qualifications: string[];
  employmentDate: Date;
}

// Parent Types
export interface Parent extends User {
  role: 'parent';
  children: string[]; // Student IDs
  occupation?: string;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  level: string; // e.g., "JSS1", "SS2"
  section?: string; // e.g., "A", "B"
  teacherId: string; // Class teacher
  students: string[];
  subjects: string[];
  academicYear: string;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  category: 'core' | 'elective' | 'vocational';
  description?: string;
}

// Grade/Result Types
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: 'first' | 'second' | 'third';
  academicYear: string;
  assessments: {
    firstCA: number;
    secondCA: number;
    exam: number;
  };
  total: number;
  grade: string;
  position?: number;
  teacherId: string;
  createdAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  attachments?: string[];
}

// Nigerian School Classes
export const NIGERIAN_CLASSES = [
  // Primary Classes
  'KG 1','KG 2','Nursery 1A','Nursery 1B', 'Nursery 2','Nursery 2A','Nursery 2B','Primary 1A','Primary 1B', 'Primary 2A','Primary 2B', 'Primary 3A','Primary 3B', 'Primary 4A','Primary 4B', 'Primary 5A','Primary 5B', 'Primary 6A','Primary 6B',
  // Junior Secondary
  'JSS 1A', 'JSS 1B','JSS 1C','JSS 2A','JSS 2B','JSS 2C', 'JSS 3A','JSS 3B','JSS 3C',
  // Senior Secondary
  'SS 1Science','SS 1Art','SS 2Science','SS 2Art', 'SS 3Science', 'SS 3Art'
];

// Nigerian School Subjects - Comprehensive List
export const NIGERIAN_SUBJECTS = [
  // Core/Compulsory Subjects (All Levels)
  'Mathematics', 'English Language', 'Civic Education', 'Basic Science', 'Basic Technology',
  'Cultural and Creative Arts', 'Physical and Health Education', 'Computer Studies',
  'Social Studies', 'Nigerian Languages', 'Business Studies', 
  
  // Primary Level Subjects
  'Drawing', 'Rhymes', 'Writing', 'Quantitative Reasoning', 'Verbal Reasoning',
  'Handwriting', 'Phonics', 'Number Work', 'Nature Study', 'Health Education',
  'Moral Instruction', 'Home Economics', 'Agricultural Science (Primary)',
  
  // Junior Secondary Core Subjects
  'Integrated Science', 'Pre-Vocational Studies', 'French', 'Arabic',
  'Hausa', 'Igbo', 'Yoruba', 'Religious Studies', 'Security Education',
  
  // Senior Secondary Science Subjects
  'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Agricultural Science',
  'Geography', 'Economics', 'Technical Drawing', 'Computer Science',
  'Statistics', 'Environmental Science',
  
  // Senior Secondary Arts/Humanities Subjects
  'Literature in English', 'Government', 'History', 'Christian Religious Studies',
  'Islamic Religious Studies', 'Fine Arts', 'Music', 'Theatre Arts',
  'Philosophy', 'Psychology', 'Sociology', 'Anthropology',
  
  // Languages
  'French Language', 'Arabic Language', 'German Language', 'Spanish Language',
  'Portuguese Language', 'Chinese Language', 'Hausa Language', 'Igbo Language',
  'Yoruba Language', 'Fulfulde', 'Kanuri', 'Tiv', 'Efik', 'Ibibio',
  
  // Commercial/Business Subjects
  'Commerce', 'Accounting', 'Office Practice', 'Marketing', 'Store Management',
  'Book Keeping', 'Typewriting', 'Shorthand', 'Data Processing',
  'Entrepreneurship', 'Financial Accounting', 'Cost Accounting',
  
  // Technical/Vocational Subjects
  'Auto Mechanics', 'Building Construction', 'Electrical Installation',
  'Electronics', 'Metal Work', 'Wood Work', 'Welding and Fabrication',
  'Plumbing and Pipe Fitting', 'Radio/TV/Electronics Works', 'Refrigeration and Air Conditioning',
  'Printing Craft Practice', 'Cosmetology', 'Catering Craft Practice',
  'Garment Making', 'Upholstery', 'Leather Goods Manufacturing',
  'Ceramics', 'Textile Trade', 'Dyeing and Bleaching', 'Photography',
  
  // Home Economics and Related
  'Food and Nutrition', 'Clothing and Textile', 'Home Management',
  'Child Development', 'Family Living', 'Interior Decoration',
  
  // Agricultural Subjects
  'Crop Production', 'Animal Husbandry', 'Fisheries', 'Forestry',
  'Agricultural Engineering', 'Soil Science', 'Farm Management',
  
  // Additional Specialized Subjects
  'Tourism', 'Hospitality Management', 'Event Management', 'Public Administration',
  'Mass Communication', 'Journalism', 'Broadcasting', 'Public Relations',
  'Library Science', 'Guidance and Counselling', 'Special Education',
  'Physical Education', 'Sports Science', 'Recreation',
  
  // ICT and Modern Subjects
  'Information Technology', 'Web Design', 'Programming', 'Database Management',
  'Digital Literacy', 'Robotics', 'Artificial Intelligence Basics',
  'Cyber Security', 'Digital Marketing', 'E-Commerce',
  
  // Creative and Performing Arts
  'Visual Arts', 'Sculpture', 'Painting', 'Graphics Design',
  'Drama and Theatre', 'Dance', 'Musical Instruments',
  'Creative Writing', 'Film Studies', 'Animation',
  
  // Health and Medical Related
  'Health Science', 'First Aid', 'Nutrition and Dietetics',
  'Community Health', 'Environmental Health', 'Mental Health Awareness'
];