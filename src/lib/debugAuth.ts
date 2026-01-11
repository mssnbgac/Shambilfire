// Authentication debugging utilities

export interface AuthDebugInfo {
  isDemoMode: boolean;
  hasFirebaseConfig: boolean;
  localStorageAvailable: boolean;
  currentUser: any | null;
  createdUsersCount: number;
  sessionData: any | null;
}

export interface LoginTestResult {
  success: boolean;
  error?: string;
  user?: any;
  timestamp: Date;
}

export const getAuthDebugInfo = (): AuthDebugInfo => {
  const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyExample_Replace_With_Your_Actual_API_Key';
  
  let localStorageAvailable = false;
  let currentUser = null;
  let createdUsersCount = 0;
  let sessionData = null;

  try {
    // Test localStorage availability
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageAvailable = true;

    // Get current session
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      sessionData = JSON.parse(storedUser);
      currentUser = sessionData;
    }

    // Count created users
    const createdUsers = localStorage.getItem('createdUsers');
    if (createdUsers) {
      const users = JSON.parse(createdUsers);
      createdUsersCount = Array.isArray(users) ? users.length : 0;
    }
  } catch (error) {
    console.error('Error getting debug info:', error);
  }

  return {
    isDemoMode,
    hasFirebaseConfig: !isDemoMode,
    localStorageAvailable,
    currentUser,
    createdUsersCount,
    sessionData
  };
};

export const validateCredentials = (email: string, password: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!email) {
    issues.push('Email is required');
  } else if (!email.includes('@')) {
    issues.push('Email must contain @ symbol');
  } else if (!email.includes('.')) {
    issues.push('Email must contain domain extension');
  }

  if (!password) {
    issues.push('Password is required');
  } else if (password.length < 3) {
    issues.push('Password is too short (minimum 3 characters)');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

export const testDemoUserCredentials = () => {
  const DEMO_USERS = [
    { email: 'admin@shambil.edu.ng', password: 'admin123', role: 'admin' },
    { email: 'teacher@shambil.edu.ng', password: 'teacher123', role: 'teacher' },
    { email: 'student@shambil.edu.ng', password: 'student123', role: 'student' },
    { email: 'parent@shambil.edu.ng', password: 'parent123', role: 'parent' },
    { email: 'accountant@shambil.edu.ng', password: 'accountant123', role: 'accountant' },
    { email: 'examofficer@shambil.edu.ng', password: 'exam123', role: 'exam_officer' },
  ];

  return DEMO_USERS.map(user => ({
    ...user,
    accessible: true,
    type: 'hardcoded'
  }));
};

export const analyzeLoginError = (error: any): { category: string; suggestion: string; technical: string } => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  if (errorMessage.includes('Invalid email or password')) {
    return {
      category: 'Credential Mismatch',
      suggestion: 'Check that email and password are correct. Try using demo accounts from the reference table.',
      technical: 'User not found in hardcoded demo users or created users storage'
    };
  }

  if (errorMessage.includes('localStorage')) {
    return {
      category: 'Storage Issue',
      suggestion: 'Clear browser cache or try incognito mode. Check browser localStorage permissions.',
      technical: 'LocalStorage access denied or corrupted data'
    };
  }

  if (errorMessage.includes('Firebase')) {
    return {
      category: 'Configuration Issue',
      suggestion: 'System is in demo mode. Use demo accounts or create test users.',
      technical: 'Firebase configuration missing or invalid'
    };
  }

  if (errorMessage.includes('Network')) {
    return {
      category: 'Connection Issue',
      suggestion: 'Check internet connection and try again.',
      technical: 'Network request failed'
    };
  }

  return {
    category: 'Unknown Error',
    suggestion: 'Try refreshing the page or clearing browser cache. Contact support if issue persists.',
    technical: errorMessage
  };
};

export const generateTestUser = (role: string = 'student') => {
  const timestamp = Date.now();
  const roles = ['student', 'teacher', 'parent', 'admin', 'accountant', 'exam_officer'];
  const validRole = roles.includes(role) ? role : 'student';
  
  return {
    id: `test-${timestamp}`,
    email: `test-${validRole}-${timestamp}@shambil.edu.ng`,
    password: `test123`,
    firstName: `Test`,
    lastName: `${validRole.charAt(0).toUpperCase() + validRole.slice(1)}`,
    role: validRole,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const exportDebugReport = () => {
  const debugInfo = getAuthDebugInfo();
  const demoUsers = testDemoUserCredentials();
  
  const report = {
    timestamp: new Date().toISOString(),
    system: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: debugInfo.localStorageAvailable
    },
    authentication: debugInfo,
    demoUsers,
    localStorage: {
      demoUser: localStorage.getItem('demoUser'),
      createdUsers: localStorage.getItem('createdUsers')
    }
  };

  // Create downloadable file
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auth-debug-report-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return report;
};

// Additional utility functions for comprehensive debugging
export const debugAuthSystem = () => {
  return getAuthDebugInfo();
};

export const testLoginCredentials = (email: string, password: string) => {
  const validation = validateCredentials(email, password);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.issues.join(', '),
      timestamp: new Date()
    };
  }

  // Test against demo users and created users
  const demoUsers = testDemoUserCredentials();
  const foundDemo = demoUsers.find(u => u.email === email.toLowerCase());
  
  if (foundDemo) {
    return {
      success: true,
      user: foundDemo,
      type: 'demo',
      timestamp: new Date()
    };
  }

  // Check created users (this would need to import from demoUsers)
  try {
    const createdUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    const foundCreated = createdUsers.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundCreated) {
      return {
        success: true,
        user: foundCreated,
        type: 'created',
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error('Error checking created users:', error);
  }

  return {
    success: false,
    error: 'User not found',
    timestamp: new Date()
  };
};