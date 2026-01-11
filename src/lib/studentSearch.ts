import { getCreatedUsers } from './demoUsers';

export interface StudentSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string;
  class: string;
  parentEmail?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  createdAt: Date;
}

// Demo students for initial data
const DEMO_STUDENTS: StudentSearchResult[] = [
  {
    id: 'student-demo-1',
    firstName: 'David',
    lastName: 'Smith',
    email: 'student@shambil.edu.ng',
    admissionNumber: 'SPA/2023/001',
    class: 'JSS 2A',
    parentEmail: 'parent@shambil.edu.ng',
    phoneNumber: '+234 803 123 4567',
    dateOfBirth: '2008-05-20',
    bloodGroup: 'O+',
    address: '45, Dan Masani Street, Birnin Gwari, Kaduna State',
    createdAt: new Date('2023-09-15')
  },
  {
    id: 'student-demo-2',
    firstName: 'Aisha',
    lastName: 'Mohammed',
    email: 'aisha.mohammed@shambil.edu.ng',
    admissionNumber: 'SPA/2023/002',
    class: 'SS 1Science',
    parentEmail: 'mohammed.family@gmail.com',
    phoneNumber: '+234 807 987 6543',
    dateOfBirth: '2006-08-12',
    bloodGroup: 'A+',
    address: '47, Dan Masani Street, Birnin Gwari, Kaduna State',
    createdAt: new Date('2023-09-16')
  },
  {
    id: 'student-demo-3',
    firstName: 'Emeka',
    lastName: 'Okafor',
    email: 'emeka.okafor@shambil.edu.ng',
    admissionNumber: 'SPA/2023/003',
    class: 'JSS 3B',
    parentEmail: 'okafor.parents@yahoo.com',
    phoneNumber: '+234 806 555 7890',
    dateOfBirth: '2007-12-03',
    bloodGroup: 'B+',
    address: '49, Dan Masani Street, Birnin Gwari, Kaduna State',
    createdAt: new Date('2023-09-17')
  },
  {
    id: 'student-demo-4',
    firstName: 'Fatima',
    lastName: 'Abdullahi',
    email: 'fatima.abdullahi@shambil.edu.ng',
    admissionNumber: 'SPA/2023/004',
    class: 'SS 2Art',
    parentEmail: 'abdullahi.home@hotmail.com',
    phoneNumber: '+234 805 444 3210',
    dateOfBirth: '2005-03-25',
    bloodGroup: 'AB+',
    address: '51, Dan Masani Street, Birnin Gwari, Kaduna State',
    createdAt: new Date('2023-09-18')
  },
  {
    id: 'student-demo-5',
    firstName: 'John',
    lastName: 'Adebayo',
    email: 'john.adebayo@shambil.edu.ng',
    admissionNumber: 'SPA/2024/001',
    class: 'Primary 5A',
    parentEmail: 'adebayo.family@gmail.com',
    phoneNumber: '+234 809 111 2233',
    dateOfBirth: '2013-07-14',
    bloodGroup: 'O-',
    address: '53, Dan Masani Street, Birnin Gwari, Kaduna State',
    createdAt: new Date('2024-01-15')
  }
];

export const getAllStudents = (): StudentSearchResult[] => {
  // Get created users and filter for students
  const createdUsers = getCreatedUsers();
  const createdStudents = createdUsers
    .filter(user => user.role === 'student')
    .map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      admissionNumber: user.admissionNumber || `SPA/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
      class: user.class || 'Not Assigned',
      parentEmail: user.parentEmail,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      bloodGroup: user.bloodGroup,
      address: user.address,
      createdAt: new Date(user.createdAt)
    }));

  // Combine demo students with created students
  return [...DEMO_STUDENTS, ...createdStudents];
};

export const searchStudentByAdmissionNumber = (admissionNumber: string): StudentSearchResult | null => {
  const allStudents = getAllStudents();
  return allStudents.find(student => 
    student.admissionNumber.toLowerCase() === admissionNumber.toLowerCase()
  ) || null;
};

export const searchStudentsByName = (searchTerm: string): StudentSearchResult[] => {
  const allStudents = getAllStudents();
  const term = searchTerm.toLowerCase();
  
  return allStudents.filter(student => 
    student.firstName.toLowerCase().includes(term) ||
    student.lastName.toLowerCase().includes(term) ||
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(term)
  );
};

export const searchStudentsByClass = (className: string): StudentSearchResult[] => {
  const allStudents = getAllStudents();
  return allStudents.filter(student => 
    student.class.toLowerCase() === className.toLowerCase()
  );
};

export const searchStudents = (searchTerm: string): StudentSearchResult[] => {
  if (!searchTerm.trim()) return getAllStudents();
  
  const allStudents = getAllStudents();
  const term = searchTerm.toLowerCase();
  
  return allStudents.filter(student => 
    student.firstName.toLowerCase().includes(term) ||
    student.lastName.toLowerCase().includes(term) ||
    student.email.toLowerCase().includes(term) ||
    student.admissionNumber.toLowerCase().includes(term) ||
    student.class.toLowerCase().includes(term) ||
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(term)
  );
};

export const getStudentById = (id: string): StudentSearchResult | null => {
  const allStudents = getAllStudents();
  return allStudents.find(student => student.id === id) || null;
};