import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
// In production, this would connect to a database
let users: any[] = [
  {
    id: 'admin-1',
    email: 'admin@shambil.edu.ng',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Administrator',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET - Retrieve all users or find specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    if (email && password) {
      // Find specific user for login
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    
    // Return all users (without passwords)
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Check if email already exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Create new user
    const newUser = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      email: userData.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const updateData = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }
    
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Return updated user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}