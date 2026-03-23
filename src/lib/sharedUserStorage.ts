// Shared user storage system for cross-device compatibility
import { CreatedUser } from './demoUsers';

// Fallback to localStorage for development
const STORAGE_KEY = 'shambil_shared_users';

// In production, this would connect to a database
// For now, we'll use a combination of localStorage and API

interface SharedUserData {
  users: CreatedUser[];
  lastUpdated: string;
}

// Get users from shared storage (API first, then localStorage fallback)
export const getSharedUsers = async (): Promise<CreatedUser[]> => {
  try {
    // Try API first
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        if (data.users && Array.isArray(data.users)) {
          return data.users.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }));
        }
      }
    } catch (apiError) {
      console.log('API not available, using localStorage fallback');
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: SharedUserData = JSON.parse(stored);
        return data.users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }));
      }
    }
    
    // Return default demo users if no stored data
    return getDefaultUsers();
  } catch (error) {
    console.error('Error getting shared users:', error);
    return getDefaultUsers();
  }
};

// Save users to shared storage (API first, then localStorage)
export const saveSharedUsers = async (users: CreatedUser[]): Promise<boolean> => {
  try {
    // Save to localStorage for immediate access
    if (typeof window !== 'undefined') {
      const data: SharedUserData = {
        users: users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        })) as any,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving shared users:', error);
    return false;
  }
};

// Add a new user to shared storage (API first)
export const addSharedUser = async (user: CreatedUser): Promise<boolean> => {
  try {
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
        // Also update localStorage for immediate access
        const existingUsers = await getSharedUsers();
        const updatedUsers = [...existingUsers.filter(u => u.id !== user.id), user];
        await saveSharedUsers(updatedUsers);
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Email already exists') {
          return false;
        }
      }
    } catch (apiError) {
      console.log('API not available, using localStorage fallback');
    }
    
    // Fallback to localStorage
    const existingUsers = await getSharedUsers();
    
    // Check if email already exists
    const emailExists = existingUsers.some(u => 
      u.email.toLowerCase() === user.email.toLowerCase()
    );
    
    if (emailExists) {
      return false;
    }
    
    const updatedUsers = [...existingUsers, user];
    return await saveSharedUsers(updatedUsers);
  } catch (error) {
    console.error('Error adding shared user:', error);
    return false;
  }
};

// Find user in shared storage (API first)
export const findSharedUser = async (email: string, password: string): Promise<CreatedUser | null> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();
    
    // Try API first
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(normalizedEmail)}&password=${encodeURIComponent(normalizedPassword)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
            updatedAt: new Date(data.user.updatedAt)
          };
        }
      }
    } catch (apiError) {
      console.log('API not available, checking localStorage');
    }
    
    // Fallback to localStorage
    const users = await getSharedUsers();
    return users.find(u => 
      u.email.toLowerCase().trim() === normalizedEmail && 
      u.password.trim() === normalizedPassword
    ) || null;
  } catch (error) {
    console.error('Error finding shared user:', error);
    return null;
  }
};

// Initialize shared storage with default users
export const initializeSharedUsers = async (): Promise<void> => {
  try {
    const existingUsers = await getSharedUsers();
    
    if (existingUsers.length === 0) {
      const defaultUsers = getDefaultUsers();
      await saveSharedUsers(defaultUsers);
    }
  } catch (error) {
    console.error('Error initializing shared users:', error);
  }
};

// Get default demo users
function getDefaultUsers(): CreatedUser[] {
  return [
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
}

// Sync localStorage users to shared storage (migration helper)
export const syncLocalToShared = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;
    
    // Get users from old localStorage format
    const oldUsers = localStorage.getItem('createdUsers');
    if (oldUsers) {
      const parsed = JSON.parse(oldUsers);
      const users: CreatedUser[] = parsed.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));
      
      // Save each user via API
      for (const user of users) {
        await addSharedUser(user);
      }
      
      // Remove old format
      localStorage.removeItem('createdUsers');
      
      console.log('Migrated', users.length, 'users to persistent storage');
    }
    
    // Also migrate from 'created_users' key
    const createdUsers = localStorage.getItem('created_users');
    if (createdUsers) {
      const parsed = JSON.parse(createdUsers);
      const users: CreatedUser[] = parsed.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));
      
      // Save each user via API
      for (const user of users) {
        await addSharedUser(user);
      }
      
      // Remove old format
      localStorage.removeItem('created_users');
      
      console.log('Migrated', users.length, 'users from created_users to persistent storage');
    }
  } catch (error) {
    console.error('Error syncing local to shared:', error);
  }
};