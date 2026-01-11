'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BookOpenIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  ClockIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  generateTranscriptPDF, 
  generatePaymentReceiptPDF, 
  generateIDCardPDF,
  type StudentInfo as PDFStudentInfo,
  type SubjectGrade,
  type PaymentInfo
} from '@/lib/pdfUtils';
import { getGradesByStudentAndSession, getGradesByStudent, getStudentGrades, initializeDemoGrades, type StudentGrade } from '@/lib/gradesStorage';
import { getPaymentsByStudentAndSession, getPaymentsByStudent, getStudentPayments, initializeDemoPayments, type StudentPayment } from '@/lib/paymentsStorage';
import { ACADEMIC_SESSIONS, TERMS } from '@/lib/academicSessions';
import { getStudentNotifications, markNotificationAsRead, checkAndCreateNotifications, type StudentNotification } from '@/lib/notificationSystem';
import { getTodayScheduleForClass, initializeDemoTimetable, type TimetableEntry } from '@/lib/timetableStorage';
import { getUpcomingExamsForClass, initializeDemoExams, type ExamSchedule } from '@/lib/examStorage';

interface StudentStats {
  currentGrade: string;
  totalSubjects: number;
  averageScore: number;
  classPosition: number;
  recentGrades: Grade[];
  upcomingExams: any[];
}

interface Grade {
  id: string;
  subjectName?: string;
  subjectId: string;
  term: string;
  academicYear: string;
  total: number;
  grade: string;
  createdAt: any;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    currentGrade: 'N/A',
    totalSubjects: 0,
    averageScore: 0,
    classPosition: 0,
    recentGrades: [],
    upcomingExams: []
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showTranscriptDownload, setShowTranscriptDownload] = useState(false);
  const [showReceiptDownload, setShowReceiptDownload] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<ExamSchedule[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const academicSessions = ACADEMIC_SESSIONS;
  const terms = TERMS;

  // Get student profile data from logged-in user
  const getStudentProfile = () => {
    if (!user) return null;
    
    // Helper function to format parent name from email
    const formatParentName = (email: string) => {
      if (!email) return 'Parent/Guardian';
      const namePart = email.split('@')[0];
      return namePart.includes('.') 
        ? namePart.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
        : namePart.charAt(0).toUpperCase() + namePart.slice(1);
    };
    
    // Use actual user data instead of demo data
    return {
      studentId: user.id || 'STU001',
      admissionNumber: (user as any).admissionNumber || 'SPA/2024/001',
      class: (user as any).class || 'Not Assigned', // Changed from JSS 2A to show when class is not set
      academicSession: '2024/2025',
      term: 'First Term',
      admissionDate: (user as any).createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-09-15',
      dateOfBirth: (user as any).dateOfBirth || '2008-05-20',
      bloodGroup: (user as any).bloodGroup || 'O+',
      parentName: (user as any).parentEmail ? formatParentName((user as any).parentEmail) : 'Parent/Guardian',
      parentPhone: (user as any).phoneNumber || '+234 803 401 2480',
      parentEmail: (user as any).parentEmail || 'parent@example.com',
      address: (user as any).address || '45, Dan Masani Street, Birnin Gwari, Kaduna State',
      subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'Physical Education', 'Cultural Arts'],
      medicalConditions: (user as any).medicalConditions || 'None',
      emergencyContact: (user as any).phoneNumber || '+234 807 938 7958'
    };
  };

  const studentProfile = getStudentProfile();

  useEffect(() => {
    if (user) {
      fetchStudentData();
      loadNotifications();
      loadTodaySchedule();
      loadUpcomingExams();
      
      // Add demo notifications for testing if none exist
      setTimeout(() => {
        addDemoNotifications();
      }, 1000);
    }
    // Initialize demo data for testing
    initializeDemoGrades();
    initializeDemoPayments();
    initializeDemoTimetable();
    initializeDemoExams();
  }, [user]);

  const loadNotifications = () => {
    if (user?.id) {
      checkAndCreateNotifications(user.id);
      const studentNotifications = getStudentNotifications(user.id);
      setNotifications(studentNotifications);
    }
  };

  // Add demo notifications for testing (only if no notifications exist)
  const addDemoNotifications = () => {
    if (user?.id && notifications.length === 0) {
      // Create some demo notifications
      const demoNotifications = [
        {
          studentId: user.id,
          type: 'result' as const,
          academicSession: '2024/2025',
          term: 'First Term',
          message: 'Your First Term results for 2024/2025 are ready to download!'
        },
        {
          studentId: user.id,
          type: 'payment' as const,
          academicSession: '2024/2025',
          term: 'Second Term',
          message: 'Your payment receipt for Second Term, 2024/2025 is ready to download!'
        },
        {
          studentId: user.id,
          type: 'both' as const,
          academicSession: '2023/2024',
          term: 'Third Term',
          message: 'Your Third Term results and payment receipt for 2023/2024 are ready to download!'
        }
      ];

      // Add notifications using the createNotification function
      const { createNotification } = require('@/lib/notificationSystem');
      demoNotifications.forEach(notif => {
        createNotification(notif);
      });
      
      // Reload notifications
      loadNotifications();
    }
  };

  const loadTodaySchedule = () => {
    if (studentProfile?.class) {
      // Try different class format variations to match timetable data
      const classVariations = [
        studentProfile.class,
        studentProfile.class.replace(/\s+/g, ''), // Remove spaces
        studentProfile.class.replace(/\s+/g, ' '), // Normalize spaces
        studentProfile.class.toUpperCase(),
        studentProfile.class.toLowerCase()
      ];
      
      let schedule: TimetableEntry[] = [];
      
      // Try each variation until we find a match
      for (const classVariation of classVariations) {
        schedule = getTodayScheduleForClass(classVariation);
        if (schedule.length > 0) {
          break;
        }
      }
      
      setTodaySchedule(schedule);
      
      // If no schedule found, log for debugging
      if (schedule.length === 0) {
        console.log('No timetable found for class:', studentProfile.class);
        console.log('Tried variations:', classVariations);
      }
    }
  };

  const loadUpcomingExams = () => {
    if (studentProfile?.class) {
      // Try different class format variations to match exam data
      const classVariations = [
        studentProfile.class,
        studentProfile.class.replace(/\s+/g, ''), // Remove spaces
        studentProfile.class.replace(/\s+/g, ' '), // Normalize spaces
        studentProfile.class.toUpperCase(),
        studentProfile.class.toLowerCase()
      ];
      
      let exams: ExamSchedule[] = [];
      
      // Try each variation until we find a match
      for (const classVariation of classVariations) {
        exams = getUpcomingExamsForClass(classVariation);
        if (exams.length > 0) {
          break;
        }
      }
      
      setUpcomingExams(exams);
      
      // If no exams found, log for debugging
      if (exams.length === 0) {
        console.log('No upcoming exams found for class:', studentProfile.class);
        console.log('Tried variations:', classVariations);
      }
    }
  };

  // Add a function to refresh exams (can be called when exam officer updates)
  const refreshExams = () => {
    loadUpcomingExams();
    toast.success('Exams refreshed!');
  };

  // Add a function to refresh timetable (can be called when admin updates)
  const refreshTimetable = () => {
    loadTodaySchedule();
    toast.success('Timetable refreshed!');
  };

  // Listen for timetable and exam updates (using storage events)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shambil_timetables') {
        loadTodaySchedule();
      } else if (e.key === 'shambil_exams') {
        loadUpcomingExams();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [studentProfile?.class]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchStudentData = async () => {
    try {
      if (!user) return;
      
      // Get student's recent grades from localStorage (demo mode)
      const recentGrades = getGradesByStudent(user.id).slice(0, 5);
      
      // Convert to the format expected by the component
      const formattedGrades: Grade[] = recentGrades.map(grade => ({
        id: grade.id,
        subjectName: grade.subjectName,
        subjectId: grade.subjectId,
        term: grade.term,
        academicYear: grade.academicYear,
        total: grade.total,
        grade: grade.grade,
        createdAt: grade.createdAt
      }));

      // Calculate average score
      const totalScore = formattedGrades.reduce((sum, grade) => sum + (grade.total || 0), 0);
      const averageScore = formattedGrades.length > 0 ? totalScore / formattedGrades.length : 0;

      setStats({
        currentGrade: studentProfile?.class || 'Not Assigned',
        totalSubjects: 8, // This would be calculated from enrolled subjects
        averageScore: Math.round(averageScore),
        classPosition: 5, // This would be calculated from class rankings
        recentGrades: formattedGrades,
        upcomingExams: [] // This will be loaded separately from exam storage
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Current Class',
      value: stats.currentGrade,
      icon: BookOpenIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Subjects',
      value: stats.totalSubjects,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: TrophyIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Attendance Rate',
      value: '95.2%',
      icon: ClockIcon,
      color: 'bg-purple-500'
    }
  ];

  const handleTranscriptDownload = async (session: string, term: string) => {
    if (!studentProfile) {
      toast.error('Student profile not available');
      return;
    }
    
    try {
      // Prepare student info for PDF
      const pdfStudentInfo: PDFStudentInfo = {
        fullName: `${user?.firstName} ${user?.lastName}`,
        admissionNumber: studentProfile.admissionNumber,
        dateOfBirth: studentProfile.dateOfBirth,
        class: studentProfile.class,
        academicSession: session,
        term: term,
        studentId: studentProfile.studentId,
        parentName: studentProfile.parentName,
        parentPhone: studentProfile.parentPhone,
        address: studentProfile.address
      };

      // Get real grades from storage - try multiple ID formats
      let studentGrades = getGradesByStudentAndSession(user?.id || '', session, term);
      
      // If no grades found with user.id, try with admission number
      if (studentGrades.length === 0) {
        studentGrades = getGradesByStudentAndSession(studentProfile.admissionNumber, session, term);
      }
      
      // If still no grades, try with student name
      if (studentGrades.length === 0) {
        const allGrades = getStudentGrades();
        studentGrades = allGrades.filter(grade => 
          grade.studentName === `${user?.firstName} ${user?.lastName}` &&
          grade.academicYear === session &&
          grade.term === term
        );
      }
      
      let gradesForPDF: SubjectGrade[];
      
      if (studentGrades.length > 0) {
        // Use real grades
        gradesForPDF = studentGrades.map(grade => ({
          subject: grade.subjectName,
          ca1: Number(grade.assessments.firstCA),
          ca2: Number(grade.assessments.secondCA),
          exam: Number(grade.assessments.exam),
          total: Number(grade.total),
          grade: grade.grade,
          remark: grade.remark,
          position: grade.position
        }));
        
        toast.success(`Found ${studentGrades.length} subjects with grades for ${term}, ${session}`);
      } else {
        // No grades found - inform student
        toast.error(`No results have been uploaded by the exam officer for ${term}, ${session}. Please contact your exam officer or check back later.`);
        return; // Don't generate PDF if no real data
      }

      // Generate the PDF
      await generateTranscriptPDF(pdfStudentInfo, gradesForPDF, session, term);
      
      toast.success(`Exam transcript for ${term}, ${session} downloaded successfully!`);
    } catch (error) {
      console.error('Error generating transcript:', error);
      toast.error('Failed to generate transcript. Please try again.');
    }
  };

  const handleReceiptDownload = async (session: string, term: string) => {
    if (!studentProfile) {
      toast.error('Student profile not available');
      return;
    }
    
    console.log('Receipt download started:', { session, term });
    
    try {
      // Prepare student info for PDF
      const pdfStudentInfo: PDFStudentInfo = {
        fullName: `${user?.firstName} ${user?.lastName}`,
        admissionNumber: studentProfile.admissionNumber,
        dateOfBirth: studentProfile.dateOfBirth,
        class: studentProfile.class,
        academicSession: session,
        term: term,
        studentId: studentProfile.studentId,
        parentName: studentProfile.parentName,
        parentPhone: studentProfile.parentPhone,
        address: studentProfile.address
      };

      console.log('Student info prepared:', pdfStudentInfo);

      // Get real payment data from storage - try multiple ID formats
      let studentPayments = getPaymentsByStudentAndSession(user?.id || '', session, term);
      
      // If no payments found with user.id, try with admission number
      if (studentPayments.length === 0) {
        studentPayments = getPaymentsByStudentAndSession(studentProfile.admissionNumber, session, term);
      }
      
      // If still no payments, try with student name
      if (studentPayments.length === 0) {
        const allPayments = getStudentPayments();
        studentPayments = allPayments.filter(payment => 
          payment.studentName === `${user?.firstName} ${user?.lastName}` &&
          payment.academicSession === session &&
          payment.term === term
        );
      }
      
      let paymentInfo: PaymentInfo;
      
      if (studentPayments.length > 0) {
        // Use real payment data
        const payment = studentPayments[0]; // Use the first payment found
        
        paymentInfo = {
          receiptNumber: payment.receiptNumber,
          dateIssued: payment.dateIssued,
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          bankName: payment.bankName,
          accountNumber: payment.accountNumber,
          description: payment.description,
          academicSession: payment.academicSession,
          term: payment.term,
          studentInfo: pdfStudentInfo
        };
        
        toast.success(`Found payment record for ${term}, ${session}`);
      } else {
        // No payment found - inform student
        toast.error(`No payment has been confirmed by the accountant for ${term}, ${session}. Please contact the accounts office or ensure your payment has been processed.`);
        return; // Don't generate PDF if no real data
      }

      console.log('Payment info prepared:', paymentInfo);

      // Generate the PDF
      console.log('Calling generatePaymentReceiptPDF...');
      await generatePaymentReceiptPDF(paymentInfo);
      console.log('PDF generation completed successfully');
      
      toast.success(`Payment receipt for ${term}, ${session} downloaded successfully!`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast.error(`Failed to generate receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleIDCardDownload = async () => {
    if (!studentProfile) {
      toast.error('Student profile not available');
      return;
    }
    
    try {
      // Prepare student info for ID card
      const pdfStudentInfo: PDFStudentInfo = {
        fullName: `${user?.firstName} ${user?.lastName}`,
        admissionNumber: studentProfile.admissionNumber,
        dateOfBirth: studentProfile.dateOfBirth,
        class: studentProfile.class,
        academicSession: studentProfile.academicSession,
        term: studentProfile.term || 'Current Term',
        studentId: studentProfile.studentId,
        parentName: studentProfile.parentName,
        parentPhone: studentProfile.parentPhone,
        address: studentProfile.address
      };

      // Generate the ID card PDF
      await generateIDCardPDF(pdfStudentInfo);
      
      toast.success('Student ID card generated successfully!');
    } catch (error) {
      console.error('Error generating ID card:', error);
      toast.error('Failed to generate ID card. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Available</h3>
          <p className="text-gray-600">Unable to load student profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's your academic overview and latest updates
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Notifications Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`inline-flex items-center px-4 py-3 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border relative ${
                    showNotifications 
                      ? 'bg-white/30 border-white/40 shadow-lg' 
                      : 'bg-white/20 border-white/20 hover:bg-white/30 hover:border-white/40'
                  }`}
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  Notifications
                  <svg 
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${showNotifications ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              loadNotifications();
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.createdAt.toLocaleDateString()} at {notification.createdAt.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                {showProfile ? <EyeSlashIcon className="h-5 w-5 mr-2" /> : <EyeIcon className="h-5 w-5 mr-2" />}
                {showProfile ? 'Hide Profile' : 'View Profile'}
              </button>
              <a
                href="/messages"
                className="inline-flex items-center px-6 py-3 bg-green-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Messages
              </a>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Student Profile Section */}
      {showProfile && (
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <UserIcon className="h-6 w-6 mr-3" />
              My Profile Information
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-blue-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  Personal Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Full Name</p>
                      <p className="text-sm text-gray-600">{user?.firstName} {user?.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Student ID</p>
                      <p className="text-sm text-gray-600">{studentProfile.studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admission Number</p>
                      <p className="text-sm text-gray-600">{studentProfile.admissionNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                      <p className="text-sm text-gray-600">{new Date(studentProfile.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{studentProfile.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-green-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <AcademicCapIcon className="h-4 w-4 text-green-600" />
                  </div>
                  Academic Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Class</p>
                      <p className="text-sm text-gray-600">{studentProfile.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Academic Session</p>
                      <p className="text-sm text-gray-600">{studentProfile.academicSession}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Admission Date</p>
                      <p className="text-sm text-gray-600">{new Date(studentProfile.admissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50/50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 mb-3">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.subjects.map((subject, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-purple-100 pb-3 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <UserIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  Parent/Guardian Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Parent/Guardian</p>
                      <p className="text-sm text-gray-600">{studentProfile.parentName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Number</p>
                      <p className="text-sm text-gray-600">{studentProfile.parentPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{studentProfile.parentEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                    <div className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-red-600 text-xs font-bold">B</span>
                      </div>
                      Blood Group
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{studentProfile.bloodGroup}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <div className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                        <PhoneIcon className="h-3 w-3 text-orange-600" />
                      </div>
                      Emergency Contact
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{studentProfile.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.name} className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Download Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Exam Transcript Download */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DocumentArrowDownIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">Download Exam Transcript</h3>
              </div>
              <button
                onClick={() => setShowTranscriptDownload(!showTranscriptDownload)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showTranscriptDownload ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showTranscriptDownload && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    Download your official exam transcripts uploaded by the exam officer for any term and session.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Session</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Session</option>
                      {academicSessions.map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Term</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Term</option>
                      {terms.map((term) => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const sessionSelect = document.querySelector('select') as HTMLSelectElement;
                    const termSelect = document.querySelectorAll('select')[1] as HTMLSelectElement;
                    if (sessionSelect.value && termSelect.value) {
                      handleTranscriptDownload(sessionSelect.value, termSelect.value);
                    } else {
                      toast.error('Please select both session and term');
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download Transcript
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Receipt Download */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">Download Payment Receipt</h3>
              </div>
              <button
                onClick={() => setShowReceiptDownload(!showReceiptDownload)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                {showReceiptDownload ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showReceiptDownload && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-700">
                    Download your confirmed payment receipts processed by the accountant for any term and session.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Session</label>
                    <select 
                      id="receipt-session"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Session</option>
                      {academicSessions.map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Term</label>
                    <select 
                      id="receipt-term"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Term</option>
                      {terms.map((term) => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const sessionSelect = document.getElementById('receipt-session') as HTMLSelectElement;
                    const termSelect = document.getElementById('receipt-term') as HTMLSelectElement;
                    if (sessionSelect.value && termSelect.value) {
                      handleReceiptDownload(sessionSelect.value, termSelect.value);
                    } else {
                      toast.error('Please select both session and term');
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Download Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule & Recent Grades */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <BoltIcon className="h-6 w-6 mr-3" />
              Quick Actions
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="group relative bg-white/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mr-4">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">My Profile</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">View personal information</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full"></div>
              </button>

              <a 
                href="/messages"
                className="group relative bg-white/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-2xl border border-gray-200/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">Messages</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Contact teachers & admin</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-green-100/50 to-transparent rounded-full"></div>
              </a>

              <button 
                onClick={() => setShowTranscriptDownload(!showTranscriptDownload)}
                className="group relative bg-white/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-2xl border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mr-4">
                    <DocumentArrowDownIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">Transcripts</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Download exam results</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full"></div>
              </button>

              <button 
                onClick={() => setShowReceiptDownload(!showReceiptDownload)}
                className="group relative bg-white/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-500 rounded-2xl border border-gray-200/50 hover:border-yellow-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mr-4">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">Receipts</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Download payment receipts</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-yellow-100/50 to-transparent rounded-full"></div>
              </button>

              <button 
                onClick={handleIDCardDownload}
                className="group relative bg-white/50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl border border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mr-4">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">ID Card</h4>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Generate student ID card</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-full"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <CalendarIcon className="h-6 w-6 mr-3" />
                Today's Classes
              </h3>
              <button
                onClick={refreshTimetable}
                className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                title="Refresh timetable"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <ClockIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{schedule.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">{schedule.teacher} • {schedule.room}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{schedule.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No classes scheduled for today</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {studentProfile?.class ? 
                      `No timetable found for ${studentProfile.class}. Contact admin to set up your class timetable.` :
                      'Class information not available'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Grades & Upcoming Exams */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Grades */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-3" />
              Recent Grades
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {stats.recentGrades.length > 0 ? (
                stats.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{grade.subjectName || 'Subject'}</p>
                      <p className="text-xs text-gray-600 mt-1">{grade.term} Term • {grade.academicYear}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{grade.total}%</p>
                      <p className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-lg">{grade.grade}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent grades available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 mr-3" />
                Upcoming Exams
              </h3>
              <button
                onClick={refreshExams}
                className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                title="Refresh exams"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <div key={index} className="border-2 border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mr-3">
                        <ExclamationCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-yellow-900">{exam.subject}</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-800 mb-2 font-medium flex items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800 mr-2">
                          {exam.type}
                        </span>
                        {exam.venue && `Venue: ${exam.venue}`}
                      </p>
                      <p className="text-sm text-yellow-700 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Date: {new Date(exam.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-yellow-700 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Time: {exam.time} ({exam.duration} minutes)
                      </p>
                      {exam.examiner && (
                        <p className="text-sm text-yellow-700">
                          Examiner: {exam.examiner}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ExclamationCircleIcon className="h-8 w-8 text-yellow-400" />
                  </div>
                  <p className="text-yellow-600 font-medium">No upcoming exams scheduled</p>
                  <p className="text-yellow-500 text-sm mt-2">
                    {studentProfile?.class ? 
                      `No exams found for ${studentProfile.class}. Check back later or contact your exam officer.` :
                      'Class information not available'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <TrophyIcon className="h-6 w-6 mr-3" />
            Performance Trend
          </h3>
        </div>
        <div className="p-8">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-gray-600 font-medium">Performance chart will be displayed here</p>
              <p className="text-gray-500 text-sm mt-2">Track your academic progress over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}