# Shambil Pride Academy - School Management System

A comprehensive full-stack school management system built with Next.js, TypeScript, Firebase, and Tailwind CSS. Designed specifically for Nigerian schools with support for all 30 Nigerian school classes and 37 subjects.

## 🚀 Features

### 🏠 Complete Layout & Navigation
- Role-based navigation system
- Responsive design for all devices
- Clean, modern UI with Tailwind CSS

### 📊 Dashboard Components for All Roles
- **Admin Dashboard**: School overview, statistics, quick actions
- **Teacher Dashboard**: Class management, student overview, schedule
- **Student Dashboard**: Grades, schedule, performance tracking
- **Parent Dashboard**: Children's progress, fee payments, messaging
- **Accountant Dashboard**: Financial overview, payment tracking
- **Exam Officer Dashboard**: Results management, exam scheduling

### 🔐 Full Authentication System
- Firebase Authentication integration
- Role-based access control (Admin, Teacher, Student, Parent, Accountant, Exam Officer)
- Secure user management

### 📝 Results Entry System
- Comprehensive grade entry form
- Automatic position calculation
- Support for Nigerian grading system (A-F)
- CA and Exam score tracking (20+20+60 format)

### 💬 Messaging System
- Parent-Admin-Teacher communication
- Real-time messaging
- Message status tracking
- Role-based message filtering

### 🎓 Nigerian Education System Support
- All 30 Nigerian school classes (Nursery 1-3, Primary 1-6, JSS 1-3, SS 1-3)
- 37 Nigerian curriculum subjects
- Proper term and academic year management

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts
- **PDF Generation**: jsPDF

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Firebase project set up
- Basic knowledge of React and TypeScript

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd shambil-firebase-school
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Authentication and Firestore Database

#### Get Firebase Configuration
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Copy the configuration object

#### Update Environment Variables
1. Copy `.env.local` to your local environment
2. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Grades - teachers and exam officers can write, students/parents can read their own
    match /grades/{gradeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'exam_officer', 'admin']);
    }
    
    // Messages - users can read their own messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }
    
    // Classes, subjects - teachers and admin can manage
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
  }
}
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

## 👥 User Roles & Access

### Admin
- Full system access
- User management
- School statistics
- System configuration

### Teacher
- Class management
- Student grades entry
- Messaging with parents/admin
- Results management

### Student
- View grades and performance
- Class schedule
- Academic progress tracking

### Parent
- Children's academic progress
- Fee payment status
- Messaging with teachers/admin
- School announcements

### Accountant
- Financial management
- Fee tracking
- Payment processing
- Financial reports

### Exam Officer
- Exam scheduling
- Results processing
- Grade management
- Performance analytics

## 📱 Demo Accounts

For testing purposes, you can create demo accounts with these roles:
- admin@shambil.edu.ng (Admin)
- teacher@shambil.edu.ng (Teacher)
- student@shambil.edu.ng (Student)
- parent@shambil.edu.ng (Parent)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication
│   ├── messages/         # Messaging system
│   └── results/          # Results entry
├── components/           # React components
│   ├── dashboards/      # Role-specific dashboards
│   ├── Layout.tsx       # Main layout component
│   ├── MessagingSystem.tsx
│   └── ResultEntryForm.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                # Utilities
│   └── firebase.ts     # Firebase configuration
└── types/              # TypeScript type definitions
    └── index.ts        # Main types
```

## 🔧 Configuration

### Nigerian School System
The system includes:
- **Classes**: Nursery 1-3, Primary 1-6, JSS 1-3, SS 1-3
- **Subjects**: 37 subjects including core, science, arts, commercial, and technical subjects
- **Grading**: Nigerian A-F grading system
- **Terms**: Three terms per academic year

### Customization
You can customize:
- School name in environment variables
- Subjects list in `src/types/index.ts`
- Grading system in result entry components
- UI colors and styling in Tailwind config

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the Firebase configuration
2. Ensure all environment variables are set
3. Check browser console for errors
4. Review Firebase security rules

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting system
- [ ] Attendance management
- [ ] Timetable management
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management

---

Built with ❤️ for Nigerian schools by the Shambil Pride Academy team.