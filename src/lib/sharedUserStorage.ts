// Shared user storage system for cross-device compatibility
import { CreatedUser } from './demoUsers';

// Fallback to localStorage for development
const STORAGE_KEY = 'shambil_shared_users';

// In production, this would connect to a database
// For now, we'll use a combination of localStorage and a shared state

interface SharedUserData {
  users: CreatedUser[];
  lastUpdated: string;
}

// Get users from shared storage (localStorage for now, but can be extended to API)
export const getSharedUsers = async (): Promise<CreatedUser[]> => {
  try {
    // In development, use localStorage
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

// Save users to shared storage
export const saveSharedUsers = async (users: CreatedUser[]): Promise<boolean> => {
  try {
    const data: SharedUserData = {
      users: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })) as any,
      lastUpdated: new Date().toISOString()
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving shared users:', error);
    return false;
  }
};

// Add a new user to shared storage
export const addSharedUser = async (user: CreatedUser): Promise<boolean> => {
  try {
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

// Find user in shared storage
export const findSharedUser = async (email: string, password: string): Promise<CreatedUser | null> => {
  try {
    const users = await getSharedUsers();
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();
    
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
      
      // Save to new shared format
      await saveSharedUsers(users);
      
      // Remove old format
      localStorage.removeItem('createdUsers');
      
      console.log('Migrated', users.length, 'users to shared storage');
    }
  } catch (error) {
    console.error('Error syncing local to shared:', error);
  }
};