'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { findCreatedUser } from '@/lib/demoUsers';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo users for testing
const DEMO_USERS = [
  {
    id: 'admin-1',
    email: 'admin@shambil.edu.ng',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Administrator',
    role: 'admin' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'teacher-1',
    email: 'teacher@shambil.edu.ng',
    password: 'teacher123',
    firstName: 'Mary',
    lastName: 'Johnson',
    role: 'teacher' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'student-1',
    email: 'student@shambil.edu.ng',
    password: 'student123',
    firstName: 'David',
    lastName: 'Smith',
    role: 'student' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'parent-1',
    email: 'parent@shambil.edu.ng',
    password: 'parent123',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'parent' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'accountant-1',
    email: 'accountant@shambil.edu.ng',
    password: 'accountant123',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'accountant' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'exam-officer-1',
    email: 'examofficer@shambil.edu.ng',
    password: 'exam123',
    firstName: 'Jennifer',
    lastName: 'Davis',
    role: 'exam_officer' as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Check if we're in demo mode (no valid Firebase config)
const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyExample_Replace_With_Your_Actual_API_Key';

// Debug log
console.log('🔥 Demo Mode Status:', {
  isDemoMode,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set',
  keyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored demo user
    if (isDemoMode) {
      const storedUser = localStorage.getItem('demoUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setFirebaseUser({ uid: userData.id });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('demoUser');
        }
      }
      setLoading(false);
    } else {
      // Real Firebase auth would go here
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Normalize inputs
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPassword = password.trim();
      
      console.log('Login attempt with normalized email:', normalizedEmail);
      
      if (isDemoMode) {
        // Check hardcoded demo users first
        let demoUser = DEMO_USERS.find(u => 
          u.email.toLowerCase() === normalizedEmail && u.password === normalizedPassword
        );
        
        console.log('Demo user found:', demoUser ? 'YES' : 'NO');
        
        // If not found in hardcoded users, check localStorage for created users
        if (!demoUser) {
          console.log('Checking created users...');
          const createdUser = findCreatedUser(normalizedEmail, normalizedPassword);
          if (createdUser) {
            console.log('Created user found:', createdUser.email);
            demoUser = createdUser;
          } else {
            console.log('No created user found');
          }
        }
        
        if (!demoUser) {
          console.log('No user found for login');
          throw new Error('Invalid email or password. Check your credentials or use demo accounts from login page.');
        }
        
        console.log('Login successful for:', demoUser.email);
        const { password: _, ...userWithoutPassword } = demoUser;
        setUser(userWithoutPassword);
        setFirebaseUser({ uid: demoUser.id });
        localStorage.setItem('demoUser', JSON.stringify(userWithoutPassword));
        toast.success(`Welcome ${demoUser.firstName}!`);
      } else {
        // Real Firebase login would go here
        throw new Error('Firebase not configured. Please set up your Firebase project.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        toast('Registration not available. Use existing accounts.', {
          icon: 'ℹ️',
          style: {
            background: '#3b82f6',
            color: 'white',
          },
        });
        throw new Error('Registration not available');
      } else {
        // Real Firebase registration would go here
        throw new Error('Firebase not configured. Please set up your Firebase project.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isDemoMode) {
        setUser(null);
        setFirebaseUser(null);
        localStorage.removeItem('demoUser');
        toast.success('Logged out successfully');
      } else {
        // Real Firebase logout would go here
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      throw error;
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (isDemoMode) {
        if (user) {
          const updatedUser = { ...user, ...userData, updatedAt: new Date() };
          setUser(updatedUser);
          localStorage.setItem('demoUser', JSON.stringify(updatedUser));
          toast.success('Profile updated successfully');
        }
      } else {
        // Real Firebase profile update would go here
        throw new Error('Firebase not configured');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};