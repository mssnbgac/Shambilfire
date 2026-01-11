'use client';

import { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  IdentificationIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import {
  generateTranscriptPDF,
  generatePaymentReceiptPDF,
  generateReportCardPDF,
  generateIDCardPDF,
  generateClassListWithAdmissionPDF,
  generateClassTimetablePDF,
  generateAttendanceSheetPDF,
  generateExamTimetablePDF,
  generateStaffListPDF,
  type StudentInfo,
  type SubjectGrade,
  type PaymentInfo,
  type ReportCardData
} from '@/lib/pdfUtils';
import toast from 'react-hot-toast';

interface PDFGeneratorProps {
  type: 'transcript' | 'receipt' | 'reportCard' | 'idCard' | 'classList' | 'attendance' | 'timetable' | 'staffList';
  data?: any;
  className?: string;
  buttonText?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function PDFGenerator({ 
  type, 
  data, 
  className = '', 
  buttonText,
  buttonSize = 'md',
  variant = 'primary'
}: PDFGeneratorProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const getButtonConfig = () => {
    const configs = {
      transcript: {
        icon: DocumentArrowDownIcon,
        text: 'Generate Transcript',
        color: 'bg-blue-600 hover:bg-blue-700'
      },
      receipt: {
        icon: CreditCardIcon,
        text: 'Generate Receipt',
        color: 'bg-green-600 hover:bg-green-700'
      },
      reportCard: {
        icon: ChartBarIcon,
        text: 'Generate Report Card',
        color: 'bg-purple-600 hover:bg-purple-700'
      },
      idCard: {
        icon: IdentificationIcon,
        text: 'Generate ID Card',
        color: 'bg-indigo-600 hover:bg-indigo-700'
      },
      classList: {
        icon: UserGroupIcon,
        text: 'Generate Class List',
        color: 'bg-orange-600 hover:bg-orange-700'
      },
      attendance: {
        icon: ClipboardDocumentListIcon,
        text: 'Generate Attendance Sheet',
        color: 'bg-teal-600 hover:bg-teal-700'
      },
      timetable: {
        icon: CalendarIcon,
        text: 'Generate Timetable',
        color: 'bg-red-600 hover:bg-red-700'
      },
      staffList: {
        icon: AcademicCapIcon,
        text: 'Generate Staff List',
        color: 'bg-gray-600 hover:bg-gray-700'
      }
    };

    return configs[type];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    return sizes[buttonSize];
  };

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    };
    return variants[variant];
  };

  const generateSampleData = (type: string) => {
    const currentDate = new Date();
    const academicSession = '2024/2025';
    const term = 'First Term';

    switch (type) {
      case 'transcript':
        return {
          studentInfo: {
            fullName: `${user?.firstName} ${user?.lastName}`,
            admissionNumber: 'SPA/2024/001',
            dateOfBirth: '2008-05-15',
            class: 'JSS 2A',
            academicSession,
            term,
            studentId: 'STU001',
            parentName: 'Mr. & Mrs. Johnson',
            parentPhone: '+234 803 123 4567',
            address: '45, Dan Masani Street, Birnin Gwari, Kaduna State'
          } as StudentInfo,
          grades: [
            { subject: 'Mathematics', ca1: 18, ca2: 17, exam: 52, total: 87, grade: 'A', remark: 'Excellent' },
            { subject: 'English Language', ca1: 16, ca2: 18, exam: 48, total: 82, grade: 'A', remark: 'Very Good' },
            { subject: 'Physics', ca1: 15, ca2: 16, exam: 45, total: 76, grade: 'B', remark: 'Good' },
            { subject: 'Chemistry', ca1: 17, ca2: 15, exam: 47, total: 79, grade: 'B', remark: 'Good' },
            { subject: 'Biology', ca1: 19, ca2: 18, exam: 50, total: 87, grade: 'A', remark: 'Excellent' },
            { subject: 'Geography', ca1: 14, ca2: 16, exam: 42, total: 72, grade: 'B', remark: 'Good' },
            { subject: 'Civic Education', ca1: 18, ca2: 19, exam: 48, total: 85, grade: 'A', remark: 'Very Good' },
            { subject: 'Computer Studies', ca1: 20, ca2: 19, exam: 55, total: 94, grade: 'A+', remark: 'Outstanding' }
          ] as SubjectGrade[]
        };

      case 'reportCard':
        return {
          studentInfo: {
            fullName: `${user?.firstName} ${user?.lastName}`,
            admissionNumber: 'SPA/2024/001',
            dateOfBirth: '2008-05-15',
            class: 'JSS 2A',
            academicSession,
            term,
            studentId: 'STU001',
            parentName: 'Mr. & Mrs. Johnson',
            parentPhone: '+234 803 123 4567',
            address: '45, Dan Masani Street, Birnin Gwari, Kaduna State'
          } as StudentInfo,
          grades: [
            { subject: 'Mathematics', ca1: 18, ca2: 17, exam: 52, total: 87, grade: 'A', remark: 'Excellent' },
            { subject: 'English Language', ca1: 16, ca2: 18, exam: 48, total: 82, grade: 'A', remark: 'Very Good' },
            { subject: 'Physics', ca1: 15, ca2: 16, exam: 45, total: 76, grade: 'B', remark: 'Good' },
            { subject: 'Chemistry', ca1: 17, ca2: 15, exam: 47, total: 79, grade: 'B', remark: 'Good' },
            { subject: 'Biology', ca1: 19, ca2: 18, exam: 50, total: 87, grade: 'A', remark: 'Excellent' }
          ] as SubjectGrade[],
          attendance: {
            daysPresent: 85,
            daysAbsent: 5,
            totalDays: 90
          },
          conduct: {
            punctuality: 'Excellent',
            neatness: 'Very Good',
            politeness: 'Excellent',
            honesty: 'Excellent',
            leadership: 'Good'
          },
          sports: {
            swimming: 'Good',
            athletics: 'Very Good',
            football: 'Excellent',
            basketball: 'Good'
          },
          teacherComment: 'An excellent student with outstanding performance in all subjects.',
          principalComment: 'Keep up the good work. Well done!',
          nextTermBegins: '2025-01-15'
        } as ReportCardData;

      case 'receipt':
        return {
          receiptNumber: `SPA/${currentDate.getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          dateIssued: currentDate.toISOString(),
          transactionId: `TXN${Date.now()}`,
          amount: 45000,
          paymentMethod: 'Bank Transfer',
          bankName: 'First Bank Nigeria',
          accountNumber: '2013456789',
          description: `School Fees Payment - ${term}`,
          academicSession,
          term,
          studentInfo: {
            fullName: `${user?.firstName} ${user?.lastName}`,
            admissionNumber: 'SPA/2024/001',
            dateOfBirth: '2008-05-15',
            class: 'JSS 2A',
            academicSession,
            term
          }
        } as PaymentInfo;

      case 'classList':
        return {
          className: 'JSS 2A',
          students: [
            { name: 'John Doe', admissionNumber: 'SPA/2024/001', dateOfBirth: '2008-05-15', parentName: 'Mr. & Mrs. Doe', parentPhone: '+234 803 123 4567' },
            { name: 'Jane Smith', admissionNumber: 'SPA/2024/002', dateOfBirth: '2008-07-20', parentName: 'Mr. & Mrs. Smith', parentPhone: '+234 803 234 5678' },
            { name: 'Michael Johnson', admissionNumber: 'SPA/2024/003', dateOfBirth: '2008-03-10', parentName: 'Mr. & Mrs. Johnson', parentPhone: '+234 803 345 6789' },
            { name: 'Sarah Williams', admissionNumber: 'SPA/2024/004', dateOfBirth: '2008-09-25', parentName: 'Mr. & Mrs. Williams', parentPhone: '+234 803 456 7890' },
            { name: 'David Brown', admissionNumber: 'SPA/2024/005', dateOfBirth: '2008-01-30', parentName: 'Mr. & Mrs. Brown', parentPhone: '+234 803 567 8901' }
          ],
          academicSession
        };

      case 'attendance':
        return {
          className: 'JSS 2A',
          students: [
            { name: 'John Doe', admissionNumber: 'SPA/2024/001' },
            { name: 'Jane Smith', admissionNumber: 'SPA/2024/002' },
            { name: 'Michael Johnson', admissionNumber: 'SPA/2024/003' },
            { name: 'Sarah Williams', admissionNumber: 'SPA/2024/004' },
            { name: 'David Brown', admissionNumber: 'SPA/2024/005' }
          ],
          month: currentDate.toLocaleString('default', { month: 'long' }),
          year: currentDate.getFullYear().toString()
        };

      case 'timetable':
        return {
          examTitle: 'First Term Examination',
          examSchedule: [
            { date: '2024-12-02', time: '9:00 AM', subject: 'Mathematics', duration: '2 hours', venue: 'Hall A', classes: ['JSS 1', 'JSS 2', 'JSS 3'] },
            { date: '2024-12-03', time: '9:00 AM', subject: 'English Language', duration: '2 hours', venue: 'Hall A', classes: ['JSS 1', 'JSS 2', 'JSS 3'] },
            { date: '2024-12-04', time: '9:00 AM', subject: 'Basic Science', duration: '1.5 hours', venue: 'Science Lab', classes: ['JSS 1', 'JSS 2'] },
            { date: '2024-12-05', time: '9:00 AM', subject: 'Social Studies', duration: '1.5 hours', venue: 'Hall B', classes: ['JSS 1', 'JSS 2', 'JSS 3'] }
          ],
          academicSession,
          term
        };

      case 'staffList':
        return {
          staff: [
            { name: 'Dr. John Principal', employeeId: 'SPA/STF/001', department: 'Administration', position: 'Principal', qualification: 'Ph.D Education', phone: '+234 803 111 1111', email: 'principal@shambil.edu.ng' },
            { name: 'Mrs. Sarah Mathematics', employeeId: 'SPA/STF/002', department: 'Mathematics', position: 'HOD Mathematics', qualification: 'M.Sc Mathematics', phone: '+234 803 222 2222', email: 'sarah.math@shambil.edu.ng' },
            { name: 'Mr. David English', employeeId: 'SPA/STF/003', department: 'Languages', position: 'English Teacher', qualification: 'B.A English', phone: '+234 803 333 3333', email: 'david.english@shambil.edu.ng' },
            { name: 'Dr. Mary Science', employeeId: 'SPA/STF/004', department: 'Sciences', position: 'HOD Sciences', qualification: 'Ph.D Chemistry', phone: '+234 803 444 4444', email: 'mary.science@shambil.edu.ng' }
          ],
          academicSession
        };

      default:
        return {};
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    
    try {
      const sampleData = data || generateSampleData(type);
      
      switch (type) {
        case 'transcript':
          await generateTranscriptPDF(sampleData.studentInfo, sampleData.grades, sampleData.studentInfo.academicSession, sampleData.studentInfo.term);
          break;
          
        case 'receipt':
          await generatePaymentReceiptPDF(sampleData);
          break;
          
        case 'reportCard':
          await generateReportCardPDF(sampleData);
          break;
          
        case 'idCard':
          const idCardData = sampleData.studentInfo || {
            fullName: `${user?.firstName} ${user?.lastName}`,
            admissionNumber: 'SPA/2024/001',
            dateOfBirth: '2008-05-15',
            class: 'JSS 2A',
            academicSession: '2024/2025',
            term: 'First Term'
          };
          await generateIDCardPDF(idCardData);
          break;
          
        case 'classList':
          await generateClassListWithAdmissionPDF(sampleData.className, sampleData.students, sampleData.academicSession);
          break;
          
        case 'attendance':
          await generateAttendanceSheetPDF(sampleData.className, sampleData.students, sampleData.month, sampleData.year);
          break;
          
        case 'timetable':
          // Check if it's a class timetable or exam timetable
          if (sampleData.examTitle) {
            await generateExamTimetablePDF(sampleData.examTitle, sampleData.examSchedule, sampleData.academicSession, sampleData.term);
          } else {
            await generateClassTimetablePDF(sampleData.className, sampleData.timetableData, sampleData.academicSession);
          }
          break;
          
        case 'staffList':
          await generateStaffListPDF(sampleData.staff, sampleData.academicSession);
          break;
          
        default:
          throw new Error('Unsupported PDF type');
      }
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const config = getButtonConfig();
  const IconComponent = config.icon;

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`
        inline-flex items-center justify-center font-medium rounded-md transition-colors
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isGenerating ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : (
        <IconComponent className="h-4 w-4 mr-2" />
      )}
      {buttonText || config.text}
    </button>
  );
}