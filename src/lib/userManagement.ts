// Enhanced user management system with search and update capabilities
import { CreatedUser, getCreatedUsers, saveCreatedUser } from './demoUsers';
import { addSharedUser } from './sharedUserStorage';

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'teacher' | 'parent' | 'admin' | 'accountant' | 'exam_officer';
  phoneNumber?: string;
  address?: string;
  class?: string;
  admissionNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  parentEmail?: string;
  // Teacher-specific fields
  teachingSubjects?: string[];
  classAssignments?: string[];
  workingExperience?: string;
  qualifications?: string;
  [key: string]: any;
}

export const searchUserByEmail = (email: string): CreatedUser | null => {
  const users = getCreatedUsers();
  const normalizedEmail = email.toLowerCase().trim();
  
  return users.find(user => 
    user.email.toLowerCase().trim() === normalizedEmail
  ) || null;
};

export const updateUser = (userId: string, updates: UserUpdateData): CreatedUser | null => {
  const users = getCreatedUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // If email is being updated, check for conflicts
  if (updates.email) {
    const normalizedNewEmail = updates.email.toLowerCase().trim();
    const emailExists = users.some(user => 
      user.id !== userId && user.email.toLowerCase().trim() === normalizedNewEmail
    );
    
    if (emailExists) {
      throw new Error('Email already exists');
    }
  }
  
  const updatedUser: CreatedUser = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  users[userIndex] = updatedUser;
  
  try {
    // Use standardized storage key
    localStorage.setItem('created_users', JSON.stringify(users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }))));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const getAllUsers = (): CreatedUser[] => {
  return getCreatedUsers();
};

export const getUsersByRole = (role: string): CreatedUser[] => {
  const users = getCreatedUsers();
  return users.filter(user => user.role === role);
};

// Unified user search across all storage systems
export const getAllUsersUnified = (): CreatedUser[] => {
  const users: CreatedUser[] = [];
  const seenEmails = new Set<string>();
  
  // 1. Get created users (primary source)
  const createdUsers = getCreatedUsers();
  createdUsers.forEach(user => {
    const email = user.email.toLowerCase();
    if (!seenEmails.has(email)) {
      users.push(user);
      seenEmails.add(email);
    }
  });
  
  // 2. Get shared users (for cross-device sync)
  try {
    const sharedStored = localStorage.getItem('shared_users');
    if (sharedStored) {
      const sharedUsers = JSON.parse(sharedStored);
      sharedUsers.forEach((user: any) => {
        const email = user.email.toLowerCase();
        if (!seenEmails.has(email)) {
          users.push({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          });
          seenEmails.add(email);
        }
      });
    }
  } catch (error) {
    console.error('Error loading shared users:', error);
  }
  
  return users;
};

// Search user by email across all storage systems
export const searchUserByEmailUnified = (email: string): CreatedUser | null => {
  const allUsers = getAllUsersUnified();
  const normalizedEmail = email.toLowerCase().trim();
  
  return allUsers.find(user => 
    user.email.toLowerCase().trim() === normalizedEmail
  ) || null;
};

export const createParentUser = async (parentData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}): Promise<CreatedUser> => {
  const newParent: CreatedUser = {
    id: `parent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    email: parentData.email.toLowerCase().trim(),
    password: parentData.password,
    firstName: parentData.firstName,
    lastName: parentData.lastName,
    role: 'parent',
    phoneNumber: parentData.phoneNumber || '',
    address: parentData.address || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const success = await saveCreatedUser(newParent);
  const sharedSuccess = await addSharedUser(newParent);
  
  if (!success && !sharedSuccess) {
    throw new Error('Failed to create parent user - email may already exist');
  }
  
  return newParent;
};

// Real-time user data synchronization
export const syncUserData = (userId: string): CreatedUser | null => {
  const users = getCreatedUsers();
  return users.find(user => user.id === userId) || null;
};

// Broadcast user updates to all components
export const broadcastUserUpdate = (userId: string, updates: UserUpdateData): void => {
  // Create a custom event to notify all components of user updates
  const event = new CustomEvent('userDataUpdated', {
    detail: { userId, updates }
  });
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
};