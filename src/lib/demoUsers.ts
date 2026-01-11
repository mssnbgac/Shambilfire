// Demo user management utilities
export interface CreatedUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'accountant' | 'exam_officer';
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // For additional role-specific data
}

// Internal type for localStorage storage (with serialized dates)
interface StoredUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'accountant' | 'exam_officer';
  createdAt: string; // ISO string for storage
  updatedAt: string; // ISO string for storage
  [key: string]: any;
}

export const getCreatedUsers = (): CreatedUser[] => {
  if (typeof window === 'undefined') {
    console.log('getCreatedUsers: window is undefined (SSR)');
    return [];
  }
  
  const stored = localStorage.getItem('createdUsers');
  console.log('getCreatedUsers: raw localStorage data:', stored);
  
  if (!stored) {
    console.log('getCreatedUsers: no data in localStorage');
    return [];
  }
  
  try {
    const parsed: StoredUser[] = JSON.parse(stored);
    console.log('getCreatedUsers: parsed data:', parsed);
    
    // Convert stored users back to CreatedUser format with Date objects
    return parsed.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));
  } catch (error) {
    console.error('getCreatedUsers: error parsing JSON:', error);
    return [];
  }
};

export const saveCreatedUser = (user: CreatedUser): boolean => {
  if (typeof window === 'undefined') return false;
  
  const existingUsers = getCreatedUsers();
  
  // Check if email already exists (case-insensitive)
  const emailExists = existingUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (emailExists) {
    console.log('saveCreatedUser: email already exists:', user.email);
    return false;
  }
  
  // Convert to storage format with serialized dates
  const userToSave: StoredUser = {
    ...user,
    email: user.email.toLowerCase().trim(), // Normalize email
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString()
  };
  
  // Get existing stored users (as StoredUser format)
  const storedUsers: StoredUser[] = [];
  const stored = localStorage.getItem('createdUsers');
  if (stored) {
    try {
      storedUsers.push(...JSON.parse(stored));
    } catch (error) {
      console.error('Error parsing existing users:', error);
    }
  }
  
  storedUsers.push(userToSave);
  
  try {
    localStorage.setItem('createdUsers', JSON.stringify(storedUsers));
    console.log('saveCreatedUser: user saved successfully:', userToSave.email);
    
    // Broadcast user creation event for real-time updates
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('userCreated', {
        detail: { user: userToSave }
      });
      window.dispatchEvent(event);
    }
    
    return true;
  } catch (error) {
    console.error('saveCreatedUser: error saving to localStorage:', error);
    return false;
  }
};

export const deleteCreatedUser = (email: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const existingUsers = getCreatedUsers();
  const filteredUsers = existingUsers.filter(u => u.email !== email);
  
  if (filteredUsers.length === existingUsers.length) {
    return false; // User not found
  }
  
  localStorage.setItem('createdUsers', JSON.stringify(filteredUsers));
  return true;
};

export const clearAllCreatedUsers = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('createdUsers');
};

export const findCreatedUser = (email: string, password: string): CreatedUser | null => {
  console.log('findCreatedUser called with:', { email, password: '[HIDDEN]' });
  
  const users = getCreatedUsers();
  console.log('Retrieved users from localStorage:', users.length);
  
  if (users.length > 0) {
    console.log('First user example:', {
      email: users[0].email,
      hasPassword: !!users[0].password,
      role: users[0].role
    });
  }
  
  // Normalize input
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPassword = password.trim();
  
  const foundUser = users.find(u => {
    const userEmail = (u.email || '').toLowerCase().trim();
    const userPassword = (u.password || '').trim();
    
    const emailMatch = userEmail === normalizedEmail;
    const passwordMatch = userPassword === normalizedPassword;
    
    console.log(`Checking user ${u.email}: email=${emailMatch}, password=${passwordMatch}`);
    return emailMatch && passwordMatch;
  });
  
  console.log('Found user:', foundUser ? 'YES' : 'NO');
  
  // If found, convert date strings back to Date objects for compatibility
  if (foundUser) {
    return {
      ...foundUser,
      createdAt: new Date(foundUser.createdAt),
      updatedAt: new Date(foundUser.updatedAt)
    };
  }
  
  return null;
};

// Initialize demo users if they don't exist
export const initializeDemoUsers = (): void => {
  if (typeof window === 'undefined') return;
  
  const existingUsers = getCreatedUsers();
  
  // Define the hardcoded demo users
  const demoUsers: CreatedUser[] = [
    {
      id: 'admin-1',
      email: 'admin@shambil.edu.ng',
      password: 'admin123',
      firstName: 'John',
      lastName: 'Administrator',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'teacher-1',
      email: 'teacher@shambil.edu.ng',
      password: 'teacher123',
      firstName: 'Mary',
      lastName: 'Johnson',
      role: 'teacher',
      phoneNumber: '+234 803 401 2480',
      address: '45, Dan Masani Street, Birnin Gwari, Kaduna State',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'teacher-2',
      email: 'michael.brown@shambil.edu.ng',
      password: 'teacher123',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'teacher',
      phoneNumber: '+234 807 938 7958',
      address: '23, Teachers Quarter, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'teacher-3',
      email: 'lisa.garcia@shambil.edu.ng',
      password: 'teacher123',
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'teacher',
      phoneNumber: '+234 803 401 2480',
      address: '15, Academic Street, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'student-1',
      email: 'student@shambil.edu.ng',
      password: 'student123',
      firstName: 'David',
      lastName: 'Smith',
      role: 'student',
      class: 'JSS 2A',
      admissionNumber: 'SPA/2023/001',
      dateOfBirth: '2008-05-15',
      bloodGroup: 'O+',
      phoneNumber: '+234 807 938 7958',
      address: '12, School Road, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'student-2',
      email: 'sarah.johnson@shambil.edu.ng',
      password: 'student123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'student',
      class: 'JSS 1B',
      admissionNumber: 'SPA/2023/002',
      dateOfBirth: '2009-03-22',
      bloodGroup: 'A+',
      phoneNumber: '+234 803 401 2480',
      address: '8, Student Avenue, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'student-3',
      email: 'ahmed.ibrahim@shambil.edu.ng',
      password: 'student123',
      firstName: 'Ahmed',
      lastName: 'Ibrahim',
      role: 'student',
      class: 'JSS 3A',
      admissionNumber: 'SPA/2023/003',
      dateOfBirth: '2007-11-10',
      bloodGroup: 'B+',
      phoneNumber: '+234 807 938 7958',
      address: '20, Unity Street, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'student-4',
      email: 'fatima.usman@shambil.edu.ng',
      password: 'student123',
      firstName: 'Fatima',
      lastName: 'Usman',
      role: 'student',
      class: 'SS 1A',
      admissionNumber: 'SPA/2023/004',
      dateOfBirth: '2006-08-18',
      bloodGroup: 'AB+',
      phoneNumber: '+234 803 401 2480',
      address: '35, Peace Road, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'parent-1',
      email: 'parent@shambil.edu.ng',
      password: 'parent123',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'parent',
      phoneNumber: '+234 803 401 2480',
      address: '45, Dan Masani Street, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'parent-2',
      email: 'mary.davis@gmail.com',
      password: 'parent123',
      firstName: 'Mary',
      lastName: 'Davis',
      role: 'parent',
      phoneNumber: '+234 807 938 7958',
      address: '18, Family Close, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'parent-3',
      email: 'ibrahim.mohammed@gmail.com',
      password: 'parent123',
      firstName: 'Ibrahim',
      lastName: 'Mohammed',
      role: 'parent',
      phoneNumber: '+234 803 401 2480',
      address: '25, Community Road, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'accountant-1',
      email: 'accountant@shambil.edu.ng',
      password: 'accountant123',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'accountant',
      phoneNumber: '+234 807 938 7958',
      address: '23, Finance Avenue, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'exam-officer-1',
      email: 'examofficer@shambil.edu.ng',
      password: 'exam123',
      firstName: 'Jennifer',
      lastName: 'Davis',
      role: 'exam_officer',
      phoneNumber: '+234 803 401 2480',
      address: '15, Academic Street, Birnin Gwari',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Add demo users that don't already exist
  demoUsers.forEach(demoUser => {
    const exists = existingUsers.some(u => u.email.toLowerCase() === demoUser.email.toLowerCase());
    if (!exists) {
      saveCreatedUser(demoUser);
      console.log('Initialized demo user:', demoUser.email);
    }
  });
};