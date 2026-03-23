// Demo user management utilities
// STORAGE KEY - Standardized across the application
const STORAGE_KEY = 'created_users';

export interface CreatedUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'accountant' | 'exam_officer';
  createdAt: Date;
  updatedAt: Date;
  // Teacher-specific fields
  teachingSubjects?: string[];
  classAssignments?: string[];
  workingExperience?: string;
  qualifications?: string;
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
  
  // Try new standardized key first
  let stored = localStorage.getItem(STORAGE_KEY);
  
  // Migration: Check old key for backward compatibility
  if (!stored) {
    const oldStored = localStorage.getItem('createdUsers');
    if (oldStored) {
      console.log('Migrating from old key "createdUsers" to new key "created_users"');
      localStorage.setItem(STORAGE_KEY, oldStored);
      localStorage.removeItem('createdUsers');
      stored = oldStored;
    }
  }
  
  console.log('getCreatedUsers: raw localStorage data:', stored);
  
  if (!stored) {
    console.log('getCreatedUsers: no data in localStorage, trying to sync from API');
    // Try to sync from API if localStorage is empty
    syncFromAPI();
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

// Sync users from API to localStorage
const syncFromAPI = async (): Promise<void> => {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      if (data.users && Array.isArray(data.users)) {
        const usersToStore: StoredUser[] = data.users.map((user: any) => ({
          ...user,
          // Add password back for localStorage (API removes it for security)
          password: user.password || 'defaultPassword123',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usersToStore));
        console.log('Synced', usersToStore.length, 'users from API to localStorage');
      }
    }
  } catch (error) {
    console.error('Error syncing from API:', error);
  }
};

export const saveCreatedUser = async (user: CreatedUser): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Try API first
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (response.ok) {
      console.log('saveCreatedUser: user saved to API successfully:', user.email);
      
      // Also save to localStorage for immediate access
      const userToSave: StoredUser = {
        ...user,
        email: user.email.toLowerCase().trim(),
        createdAt: new Date(user.createdAt).toISOString(),
        updatedAt: new Date(user.updatedAt).toISOString()
      };
      
      // Get existing users from localStorage
      const existingUsers = getCreatedUsers();
      const existsInLocal = existingUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());
      
      if (!existsInLocal) {
        const storedUsers: StoredUser[] = [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            storedUsers.push(...JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing existing users:', error);
          }
        }
        
        storedUsers.push(userToSave);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUsers));
      }
      
      // Broadcast user creation event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('userCreated', {
          detail: { user: userToSave }
        });
        window.dispatchEvent(event);
      }
      
      return true;
    } else {
      const errorData = await response.json();
      if (errorData.error === 'Email already exists') {
        console.log('saveCreatedUser: email already exists in API:', user.email);
        alert(`User with email ${user.email} already exists!`);
        return false;
      }
      console.error('API error:', errorData);
      alert(`Error creating user: ${errorData.error || 'Unknown error'}`);
      return false;
    }
  } catch (apiError) {
    console.log('API not available, using localStorage fallback');
    alert('API not available. User will be saved locally only.');
  }
  
  // Fallback to localStorage only
  const existingUsers = getCreatedUsers();
  
  // Check if email already exists (case-insensitive)
  const emailExists = existingUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (emailExists) {
    console.log('saveCreatedUser: email already exists:', user.email);
    alert(`User with email ${user.email} already exists!`);
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
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      storedUsers.push(...JSON.parse(stored));
    } catch (error) {
      console.error('Error parsing existing users:', error);
    }
  }
  
  storedUsers.push(userToSave);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUsers));
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
    alert('Error saving user to local storage');
    return false;
  }
};

export const deleteCreatedUser = async (email: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Try API first
  try {
    const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      console.log('deleteCreatedUser: user deleted from API successfully:', email);
      
      // Also remove from localStorage
      const existingUsers = getCreatedUsers();
      const filteredUsers = existingUsers.filter(u => u.email !== email);
      
      if (filteredUsers.length !== existingUsers.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))));
      }
      
      return true;
    }
  } catch (apiError) {
    console.log('API not available, using localStorage fallback');
  }
  
  // Fallback to localStorage only
  const existingUsers = getCreatedUsers();
  const filteredUsers = existingUsers.filter(u => u.email !== email);
  
  if (filteredUsers.length === existingUsers.length) {
    return false; // User not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }))));
  return true;
};

export const clearAllCreatedUsers = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const findCreatedUser = async (email: string, password: string): Promise<CreatedUser | null> => {
  console.log('findCreatedUser called with:', { email, password: '[HIDDEN]' });
  
  // First try to get users from localStorage
  let users = getCreatedUsers();
  console.log('Retrieved users from localStorage:', users.length);
  
  // If no users in localStorage, try to sync from API
  if (users.length === 0) {
    console.log('No users in localStorage, trying API...');
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        if (data.users && Array.isArray(data.users)) {
          // Convert API users to CreatedUser format and store in localStorage
          const apiUsers: CreatedUser[] = data.users.map((user: any) => ({
            ...user,
            // API doesn't return passwords for security, but we need them for login
            // This is a limitation - in production, authentication should be handled differently
            password: 'defaultPassword123', // Placeholder - real passwords are in the API
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }));
          
          // Store in localStorage for future use
          const usersToStore: StoredUser[] = apiUsers.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(usersToStore));
          
          // For login, try API authentication directly
          try {
            const loginResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              if (loginData.user) {
                return {
                  ...loginData.user,
                  password: password, // Keep the password for the session
                  createdAt: new Date(loginData.user.createdAt),
                  updatedAt: new Date(loginData.user.updatedAt)
                };
              }
            }
          } catch (apiError) {
            console.error('API login failed:', apiError);
          }
          
          users = apiUsers;
        }
      }
    } catch (error) {
      console.error('Error fetching users from API:', error);
    }
  }
  
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
export const initializeDemoUsers = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // First, try to sync existing users from API to localStorage
  await syncFromAPI();
  
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
  for (const demoUser of demoUsers) {
    const exists = existingUsers.some(u => u.email.toLowerCase() === demoUser.email.toLowerCase());
    if (!exists) {
      // Don't use saveCreatedUser here to avoid API calls during initialization
      console.log('Demo user not found in localStorage, will be available from API:', demoUser.email);
    } else {
      // Verify the existing user has correct password
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === demoUser.email.toLowerCase());
      if (existingUser && existingUser.password !== demoUser.password) {
        console.log('Updating password for demo user:', demoUser.email);
        // Update the password in localStorage
        const users = getCreatedUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === demoUser.email.toLowerCase());
        if (userIndex !== -1) {
          users[userIndex].password = demoUser.password;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
          }))));
        }
      }
    }
  }
};