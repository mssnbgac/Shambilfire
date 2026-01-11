const jsPDFLib = require('jspdf');
require('jspdf-autotable');

// Get the jsPDF constructor from the library
const jsPDF = jsPDFLib.jsPDF || jsPDFLib;

// Extend jsPDF type to include autoTable
declare global {
  interface Window {
    jsPDF: any;
  }
}

// Helper function to create jsPDF instance with autoTable plugin
const createJsPDFWithAutoTable = async (orientation: 'p' | 'l' = 'p', format: string | number[] = 'a4'): Promise<any> => {
  console.log('Creating jsPDF instance with autoTable...');
  
  // Dynamic import for better Next.js compatibility
  const jsPDFModule = await import('jspdf');
  console.log('jsPDF module imported:', jsPDFModule);
  
  // Import autoTable plugin
  const autoTableModule = await import('jspdf-autotable');
  console.log('autoTable module imported:', autoTableModule);
  
  // Try different ways to access the constructor
  let jsPDF: any;
  if (jsPDFModule.jsPDF) {
    jsPDF = jsPDFModule.jsPDF;
    console.log('Using jsPDFModule.jsPDF');
  } else if (jsPDFModule.default) {
    jsPDF = jsPDFModule.default;
    console.log('Using jsPDFModule.default');
  } else {
    jsPDF = jsPDFModule;
    console.log('Using jsPDFModule directly');
  }
  
  console.log('jsPDF constructor:', jsPDF);
  console.log('typeof jsPDF:', typeof jsPDF);
  
  // Try creating instance with different approaches
  let doc: any;
  try {
    doc = new (jsPDF as any)(orientation, 'mm', format);
    console.log('jsPDF instance created with new jsPDF()');
  } catch (error1) {
    console.log('Failed with new jsPDF(), trying jsPDF():', error1);
    try {
      doc = (jsPDF as any)(orientation, 'mm', format);
      console.log('jsPDF instance created with jsPDF()');
    } catch (error2) {
      console.log('Failed with jsPDF(), trying new jsPDF.jsPDF():', error2);
      try {
        doc = new (jsPDF as any).jsPDF(orientation, 'mm', format);
        console.log('jsPDF instance created with new jsPDF.jsPDF()');
      } catch (error3) {
        console.log('All constructor attempts failed:', error3);
        throw new Error('Could not create jsPDF instance');
      }
    }
  }
  
  // Verify autoTable is available and attach if needed
  console.log('Checking autoTable availability:', typeof doc.autoTable);
  if (typeof doc.autoTable !== 'function') {
    console.log('autoTable not found on doc, trying to attach manually...');
    
    // For jsPDF v4.0.0, we need to manually attach autoTable
    try {
      if (autoTableModule.default && typeof autoTableModule.default === 'function') {
        (autoTableModule.default as any)(doc, doc.internal);
        console.log('autoTable attached via default export');
      } else if (typeof autoTableModule === 'function') {
        (autoTableModule as any)(doc, doc.internal);
        console.log('autoTable attached via direct call');
      } else {
        const pluginFn = (autoTableModule as any).autoTable || (autoTableModule as any).default || autoTableModule;
        if (typeof pluginFn === 'function') {
          (pluginFn as any)(doc, doc.internal);
          console.log('autoTable attached via plugin function');
        }
      }
    } catch (attachError) {
      console.warn('Error attaching autoTable:', attachError);
    }
    
    console.log('After manual attachment, autoTable type:', typeof doc.autoTable);
    
    if (typeof doc.autoTable !== 'function') {
      console.warn('Could not attach autoTable plugin, creating fallback function');
      // Create a simple fallback that creates a basic table
      doc.autoTable = function(options: any) {
        console.warn('Using autoTable fallback - basic table functionality');
        
        // Simple fallback: just add text for each row
        let currentY = options.startY || 50;
        const lineHeight = 8;
        
        // Add headers
        if (options.head && options.head[0]) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          let headerX = 20;
          options.head[0].forEach((header: string) => {
            doc.text(header, headerX, currentY);
            headerX += 30; // Simple spacing
          });
          currentY += lineHeight;
        }
        
        // Add body rows
        if (options.body) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          options.body.forEach((row: any[]) => {
            let cellX = 20;
            row.forEach((cell: any) => {
              doc.text(String(cell), cellX, currentY);
              cellX += 30; // Simple spacing
            });
            currentY += lineHeight;
          });
        }
        
        // Set finalY for compatibility
        (doc as any).lastAutoTable = { finalY: currentY };
      };
    }
  }
  
  console.log('jsPDF instance with autoTable ready');
  return doc;
};

// Color scheme for professional documents
const COLORS = {
  primary: '#1e40af', // Blue
  secondary: '#64748b', // Slate
  accent: '#059669', // Green
  warning: '#d97706', // Orange
  danger: '#dc2626', // Red
  text: '#1f2937', // Dark gray
  lightGray: '#f8fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#475569'
};

// School branding and styling
const SCHOOL_INFO = {
  name: 'SHAMBIL PRIDE ACADEMY',
  subtitle: 'BIRNIN GWARI',
  address: '45, Dan Masani Street, Birnin Gwari, Kaduna State, Nigeria',
  phone: '+234 803 401 2480 / +234 807 938 7958',
  email: 'Shehubala70@gmail.com',
  motto: 'Knowledge is a way to success',
  logo: null // Can be added later
};

export interface StudentInfo {
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  house?: string;
  class: string;
  academicSession: string;
  term: string;
  studentId?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

export interface SubjectGrade {
  subject: string;
  ca1?: number;
  ca2?: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  position?: number;
}

export interface PaymentInfo {
  receiptNumber: string;
  dateIssued: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  description: string;
  academicSession: string;
  term: string;
  studentInfo: StudentInfo;
}

export interface ReportCardData {
  studentInfo: StudentInfo;
  grades: SubjectGrade[];
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    totalDays: number;
  };
  conduct: {
    punctuality: string;
    neatness: string;
    politeness: string;
    honesty: string;
    leadership: string;
  };
  sports: {
    swimming: string;
    athletics: string;
    football: string;
    basketball: string;
  };
  teacherComment: string;
  principalComment: string;
  nextTermBegins: string;
}

// Utility functions for PDF styling
class PDFStyler {
  private doc: any;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor(doc: any) {
    this.doc = doc;
    this.pageWidth = doc.internal.pageSize.width;
    this.pageHeight = doc.internal.pageSize.height;
  }

  // Add school header with logo and branding
  addSchoolHeader(yPosition: number = 20): number {
    const centerX = this.pageWidth / 2;
    
    // School name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text(SCHOOL_INFO.name, centerX, yPosition, { align: 'center' });
    
    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(SCHOOL_INFO.subtitle, centerX, yPosition + 8, { align: 'center' });
    
    // Address and contact
    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.text);
    this.doc.text(SCHOOL_INFO.address, centerX, yPosition + 16, { align: 'center' });
    this.doc.text(`${SCHOOL_INFO.phone} | ${SCHOOL_INFO.email}`, centerX, yPosition + 22, { align: 'center' });
    
    // Motto
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(COLORS.accent);
    this.doc.text(`"${SCHOOL_INFO.motto}"`, centerX, yPosition + 30, { align: 'center' });
    
    // Decorative line
    this.doc.setDrawColor(COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, yPosition + 35, this.pageWidth - this.margin, yPosition + 35);
    
    return yPosition + 45;
  }

  // Add document title with styling
  addDocumentTitle(title: string, yPosition: number): number {
    const centerX = this.pageWidth / 2;
    
    // Background rectangle for title
    this.doc.setFillColor(COLORS.primary);
    this.doc.rect(this.margin, yPosition - 5, this.pageWidth - (2 * this.margin), 15, 'F');
    
    // Title text
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.text(title, centerX, yPosition + 5, { align: 'center' });
    
    return yPosition + 20;
  }

  // Add student information section
  addStudentInfo(studentInfo: StudentInfo, yPosition: number): number {
    // Validate studentInfo parameter
    if (!studentInfo) {
      console.error('StudentInfo is undefined');
      return yPosition + 50;
    }

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.text);
    
    const leftCol = this.margin + 5;
    const rightCol = this.pageWidth / 2 + 10;
    const lineHeight = 8;
    
    // Background for student info
    this.doc.setFillColor(COLORS.lightGray);
    this.doc.rect(this.margin, yPosition - 3, this.pageWidth - (2 * this.margin), 45, 'F');
    
    // Border
    this.doc.setDrawColor(COLORS.mediumGray);
    this.doc.setLineWidth(0.3);
    this.doc.rect(this.margin, yPosition - 3, this.pageWidth - (2 * this.margin), 45);
    
    let currentY = yPosition + 5;
    
    // Left column
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Student Name:', leftCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(studentInfo.fullName || 'N/A', leftCol + 35, currentY);
    
    currentY += lineHeight;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Admission No:', leftCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(studentInfo.admissionNumber || 'N/A', leftCol + 35, currentY);
    
    currentY += lineHeight;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Class:', leftCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(studentInfo.class || 'N/A', leftCol + 35, currentY);
    
    // Right column
    currentY = yPosition + 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Academic Session:', rightCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(studentInfo.academicSession || 'N/A', rightCol + 40, currentY);
    
    currentY += lineHeight;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Term:', rightCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(studentInfo.term || 'N/A', rightCol + 40, currentY);
    
    currentY += lineHeight;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Date of Birth:', rightCol, currentY);
    this.doc.setFont('helvetica', 'normal');
    const dateOfBirth = studentInfo.dateOfBirth ? new Date(studentInfo.dateOfBirth).toLocaleDateString() : 'N/A';
    this.doc.text(dateOfBirth, rightCol + 40, currentY);
    
    return yPosition + 50;
  }

  // Add footer with signature lines and date
  addFooter(yPosition: number): void {
    const centerX = this.pageWidth / 2;
    
    // Signature lines
    const sigY = yPosition + 20;
    const leftSigX = this.margin + 40;
    const rightSigX = this.pageWidth - this.margin - 40;
    
    // Left signature (Teacher/Exam Officer)
    this.doc.setDrawColor(COLORS.text);
    this.doc.setLineWidth(0.3);
    this.doc.line(leftSigX - 30, sigY, leftSigX + 30, sigY);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.text);
    this.doc.text('Exam Officer', leftSigX, sigY + 8, { align: 'center' });
    
    // Right signature (Principal)
    this.doc.line(rightSigX - 30, sigY, rightSigX + 30, sigY);
    this.doc.text('Principal', rightSigX, sigY + 8, { align: 'center' });
    
    // Date issued
    this.doc.setFontSize(8);
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, centerX, sigY + 20, { align: 'center' });
    
    // School seal placeholder
    this.doc.setDrawColor(COLORS.mediumGray);
    this.doc.circle(centerX, sigY - 10, 15);
    this.doc.setFontSize(8);
    this.doc.text('SCHOOL', centerX, sigY - 12, { align: 'center' });
    this.doc.text('SEAL', centerX, sigY - 8, { align: 'center' });
  }

  // Add watermark
  addWatermark(): void {
    const centerX = this.pageWidth / 2;
    const centerY = this.pageHeight / 2;
    
    this.doc.setTextColor(240, 240, 240); // Very light gray
    this.doc.setFontSize(60);
    this.doc.setFont('helvetica', 'bold');
    
    // Rotate and add watermark
    this.doc.text('SHAMBIL PRIDE', centerX, centerY, { 
      align: 'center',
      angle: 45
    });
  }
}

// Generate comprehensive exam transcript
export const generateTranscriptPDF = async (
  studentInfo: StudentInfo,
  grades: SubjectGrade[],
  session: string,
  term: string
): Promise<void> => {
  console.log('generateTranscriptPDF called with:', { studentInfo, grades, session, term });
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    console.log('PDFStyler instance created');
    
    // Add watermark
    console.log('Adding watermark...');
    styler.addWatermark();
    
    // Add header
    console.log('Adding header...');
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    console.log('Adding document title...');
    currentY = styler.addDocumentTitle('STUDENT ACADEMIC TRANSCRIPT', currentY);
    
    // Add student information
    console.log('Adding student information...');
    currentY = styler.addStudentInfo({
      ...studentInfo,
      academicSession: session,
      term: term
    }, currentY);
    
    // Add grades table
    console.log('Creating grades table...');
    const tableData = grades.map(grade => [
      grade.subject,
      grade.ca1?.toString() || '-',
      grade.ca2?.toString() || '-',
      grade.exam.toString(),
      grade.total.toString(),
      grade.grade,
      grade.remark
    ]);
    
    console.log('Adding autoTable...');
    (doc as any).autoTable({
      startY: currentY + 10,
      head: [['Subject', 'CA1 (20)', 'CA2 (20)', 'Exam (60)', 'Total (100)', 'Grade', 'Remark']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { halign: 'left', cellWidth: 30 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Calculate statistics
    console.log('Calculating statistics...');
    console.log('Grades data for calculation:', grades.map(g => ({ subject: g.subject, total: g.total, type: typeof g.total })));
    const totalMarks = grades.reduce((sum, grade) => sum + Number(grade.total), 0);
    const averageScore = grades.length > 0 ? totalMarks / grades.length : 0;
    const totalSubjects = grades.length;
    console.log('Calculated statistics:', { totalMarks, averageScore, totalSubjects });
    
    // Add summary statistics
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(COLORS.accent);
    doc.rect(20, finalY, 170, 25, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIC SUMMARY', 105, finalY + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Subjects: ${totalSubjects}`, 30, finalY + 16);
    doc.text(`Total Marks: ${totalMarks}/${totalSubjects * 100}`, 30, finalY + 22);
    doc.text(`Average Score: ${averageScore.toFixed(1)}%`, 120, finalY + 16);
    doc.text(`Overall Grade: ${getOverallGrade(averageScore)}`, 120, finalY + 22);
    
    // Add footer
    console.log('Adding footer...');
    styler.addFooter(finalY + 35);
    
    // Save the PDF
    console.log('Saving PDF...');
    const filename = `${(studentInfo.fullName || 'Student').replace(/\s+/g, '_')}_Transcript_${session.replace('/', '-')}_${term.replace(' ', '_')}.pdf`;
    console.log('PDF filename:', filename);
    
    doc.save(filename);
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateTranscriptPDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to be caught by the calling function
  }
};

// Generate payment receipt
export const generatePaymentReceiptPDF = async (paymentInfo: PaymentInfo): Promise<void> => {
  console.log('generatePaymentReceiptPDF called with:', paymentInfo);
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    console.log('PDFStyler instance created');
    
    // Add watermark
    console.log('Adding watermark...');
    styler.addWatermark();
    
    // Add header
    console.log('Adding header...');
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    console.log('Adding document title...');
    currentY = styler.addDocumentTitle('PAYMENT RECEIPT', currentY);
    
    // Receipt information
    console.log('Adding receipt information...');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(`Receipt No: ${paymentInfo.receiptNumber}`, 20, currentY + 10);
    doc.text(`Date: ${new Date(paymentInfo.dateIssued).toLocaleDateString()}`, 140, currentY + 10);
    
    // Student information
    console.log('Adding student information...');
    currentY = styler.addStudentInfo(paymentInfo.studentInfo, currentY + 20);
    
    // Payment details table
    console.log('Creating payment details table...');
    const paymentData = [
      ['Description', paymentInfo.description],
      ['Academic Session', paymentInfo.academicSession],
      ['Term', paymentInfo.term],
      ['Amount Paid', `₦${paymentInfo.amount.toLocaleString()}`],
      ['Payment Method', paymentInfo.paymentMethod],
      ['Transaction ID', paymentInfo.transactionId],
      ['Bank Name', paymentInfo.bankName || 'N/A'],
      ['Account Number', paymentInfo.accountNumber || 'N/A']
    ];
    
    console.log('Adding autoTable...');
    (doc as any).autoTable({
      startY: currentY + 10,
      body: paymentData,
      theme: 'grid',
      columnStyles: {
        0: { 
          fillColor: COLORS.lightGray,
          fontStyle: 'bold',
          halign: 'left',
          cellWidth: 60
        },
        1: { 
          halign: 'left',
          cellWidth: 110
        }
      },
      bodyStyles: {
        fontSize: 11
      },
      margin: { left: 20, right: 20 }
    });
    
    // Amount in words
    console.log('Adding amount in words...');
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFillColor(COLORS.accent);
    doc.rect(20, finalY, 170, 15, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    console.log('Converting amount to words:', paymentInfo.amount);
    const amountInWords = numberToWords(paymentInfo.amount);
    console.log('Amount in words result:', amountInWords);
    
    doc.text(`Amount in Words: ${amountInWords} Naira Only`, 25, finalY + 10);
    
    // Payment status
    console.log('Adding payment status...');
    doc.setFillColor(COLORS.accent);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT CONFIRMED', 105, finalY + 30, { align: 'center' });
    
    // Add footer
    console.log('Adding footer...');
    styler.addFooter(finalY + 40);
    
    // Save the PDF
    console.log('Saving PDF...');
    const filename = `Payment_Receipt_${paymentInfo.receiptNumber}_${(paymentInfo.studentInfo.fullName || 'Student').replace(/\s+/g, '_')}.pdf`;
    console.log('PDF filename:', filename);
    
    doc.save(filename);
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generatePaymentReceiptPDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to be caught by the calling function
  }
};

// Generate ID Card PDF
export const generateIDCardPDF = async (studentInfo: StudentInfo): Promise<void> => {
  console.log('generateIDCardPDF called with:', studentInfo);
  
  try {
    // Create jsPDF instance with autoTable plugin (landscape, credit card size)
    const doc = await createJsPDFWithAutoTable('l', [85.6, 53.98]);
    console.log('jsPDF instance with autoTable created successfully');
    
    // Background
    doc.setFillColor(COLORS.primary);
    doc.rect(0, 0, 85.6, 53.98, 'F');
    
    // School name
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('SHAMBIL PRIDE ACADEMY', 42.8, 8, { align: 'center' });
    
    // Student photo placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(5, 12, 20, 25);
    doc.setTextColor(COLORS.text);
    doc.setFontSize(6);
    doc.text('STUDENT', 15, 22, { align: 'center' });
    doc.text('PHOTO', 15, 26, { align: 'center' });
    
    // Student details
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Name:', 28, 16);
    doc.text('Class:', 28, 22);
    doc.text('Adm. No:', 28, 28);
    doc.text('Session:', 28, 34);
    
    doc.setFont('helvetica', 'normal');
    doc.text(studentInfo.fullName || 'N/A', 38, 16);
    doc.text(studentInfo.class, 38, 22);
    doc.text(studentInfo.admissionNumber, 38, 28);
    doc.text(studentInfo.academicSession, 38, 34);
    
    // Contact info
    doc.setFontSize(5);
    doc.text('Emergency: ' + (studentInfo.parentPhone || 'N/A'), 5, 45);
    doc.text('Valid for Academic Session Only', 5, 50);
    
    console.log('Saving ID card PDF...');
    const filename = `${(studentInfo.fullName || 'Student').replace(/\s+/g, '_')}_ID_Card.pdf`;
    console.log('PDF filename:', filename);
    
    doc.save(filename);
    console.log('ID card PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateIDCardPDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to be caught by the calling function
  }
};

// Generate Report Card PDF
export const generateReportCardPDF = async (reportCardData: ReportCardData): Promise<void> => {
  console.log('generateReportCardPDF called with:', reportCardData);
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Validate reportCardData
    if (!reportCardData || !reportCardData.studentInfo) {
      throw new Error('Invalid report card data: missing student information');
    }
    
    // Add watermark
    styler.addWatermark();
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle('STUDENT REPORT CARD', currentY);
    
    // Add student information
    currentY = styler.addStudentInfo(reportCardData.studentInfo, currentY);
    
    // Add grades table (similar to transcript but with additional columns)
    const grades = reportCardData.grades || [];
    const tableData = grades.map(grade => [
      grade.subject || 'N/A',
      grade.ca1?.toString() || '-',
      grade.ca2?.toString() || '-',
      grade.exam?.toString() || '-',
      grade.total?.toString() || '-',
      grade.grade || '-',
      grade.remark || '-'
    ]);
    
    (doc as any).autoTable({
      startY: currentY + 10,
      head: [['Subject', 'CA1', 'CA2', 'Exam', 'Total', 'Grade', 'Remark']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 20, right: 20 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Add attendance and conduct sections
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE & CONDUCT', 20, finalY + 10);
    
    // Add attendance info if available
    if (reportCardData.attendance) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Days Present: ${reportCardData.attendance.daysPresent || 0}`, 20, finalY + 20);
      doc.text(`Days Absent: ${reportCardData.attendance.daysAbsent || 0}`, 20, finalY + 28);
      doc.text(`Total Days: ${reportCardData.attendance.totalDays || 0}`, 20, finalY + 36);
    }
    
    // Add footer
    styler.addFooter(finalY + 50);
    
    const filename = `${reportCardData.studentInfo.fullName?.replace(/\s+/g, '_') || 'Student'}_Report_Card.pdf`;
    doc.save(filename);
    console.log('Report card PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateReportCardPDF:', error);
    throw error;
  }
};

// Generate Class Timetable PDF
export const generateClassTimetablePDF = async (className: string, timetableData: any, academicSession: string): Promise<void> => {
  console.log('generateClassTimetablePDF called with:', { className, timetableData, academicSession });
  
  try {
    // Create jsPDF instance with autoTable plugin (landscape for better table fit)
    const doc = await createJsPDFWithAutoTable('l', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle(`CLASS TIMETABLE - ${className}`, currentY);
    
    // Add session info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Academic Session: ${academicSession}`, 20, currentY + 10);
    
    // Prepare timetable data for table
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '08:00 - 08:40', '08:40 - 09:20', '09:20 - 10:00', '10:00 - 10:20',
      '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20', '12:20 - 13:00',
      '13:00 - 13:40', '13:40 - 14:20', '14:20 - 15:00'
    ];
    
    // Create table data
    const tableData = timeSlots.map(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const entry = timetableData[day] && timetableData[day][timeSlot];
        if (entry) {
          row.push(`${entry.subject}\n${entry.teacher}\n${entry.room}`);
        } else if (timeSlot === '10:00 - 10:20') {
          row.push('BREAK');
        } else if (timeSlot === '12:20 - 13:00') {
          row.push('LUNCH');
        } else {
          row.push('');
        }
      });
      return row;
    });
    
    // Create timetable table
    (doc as any).autoTable({
      startY: currentY + 20,
      head: [['Time', ...days]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { 
          fillColor: COLORS.lightGray,
          fontStyle: 'bold',
          cellWidth: 35
        }
      },
      alternateRowStyles: {
        fillColor: '#f9fafb'
      },
      margin: { left: 20, right: 20 }
    });
    
    const filename = `Timetable_${className.replace(/\s+/g, '_')}_${academicSession.replace('/', '-')}.pdf`;
    doc.save(filename);
    console.log('Class timetable PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateClassTimetablePDF:', error);
    throw error;
  }
};

// Generate Class List PDF with Admission Numbers
export const generateClassListWithAdmissionPDF = async (className: string, students: any[], academicSession: string): Promise<void> => {
  console.log('generateClassListWithAdmissionPDF called with:', { className, students, academicSession });
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle(`CLASS LIST - ${className}`, currentY);
    
    // Add session info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Academic Session: ${academicSession}`, 20, currentY + 10);
    doc.text(`Total Students: ${students.length}`, 20, currentY + 18);
    
    // Students table with admission numbers
    const tableData = students.map((student, index) => [
      (index + 1).toString(),
      `${student.firstName} ${student.lastName}`,
      student.admissionNumber || `SPA/${new Date().getFullYear()}/${String(index + 1).padStart(3, '0')}`,
      new Date(student.dateOfBirth || '2010-01-01').toLocaleDateString(),
      student.parentName || student.parentEmail || 'N/A',
      student.phoneNumber || student.parentPhone || 'N/A'
    ]);
    
    (doc as any).autoTable({
      startY: currentY + 30,
      head: [['S/N', 'Student Name', 'Admission No.', 'Date of Birth', 'Parent/Guardian', 'Phone Number']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40 },
        5: { cellWidth: 35 }
      },
      margin: { left: 15, right: 15 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Add class statistics
    doc.setFillColor(COLORS.accent);
    doc.rect(20, finalY, 170, 20, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CLASS STATISTICS', 105, finalY + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const maleCount = students.filter(s => s.gender === 'male').length;
    const femaleCount = students.filter(s => s.gender === 'female').length;
    
    doc.text(`Total Students: ${students.length}`, 30, finalY + 16);
    doc.text(`Male: ${maleCount} | Female: ${femaleCount}`, 120, finalY + 16);
    
    const filename = `Class_List_${className.replace(/\s+/g, '_')}_${academicSession.replace('/', '-')}.pdf`;
    doc.save(filename);
    console.log('Class list with admission numbers PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateClassListWithAdmissionPDF:', error);
    throw error;
  }
};

// Generate Attendance Sheet PDF
export const generateAttendanceSheetPDF = async (className: string, students: any[], month: string, year: string): Promise<void> => {
  console.log('generateAttendanceSheetPDF called with:', { className, students, month, year });
  
  try {
    // Create jsPDF instance with autoTable plugin (landscape)
    const doc = await createJsPDFWithAutoTable('l', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle(`ATTENDANCE SHEET - ${className}`, currentY);
    
    // Add month/year info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Month: ${month} ${year}`, 20, currentY + 10);
    
    // Create attendance grid (simplified version)
    const daysInMonth = new Date(parseInt(year), new Date(`${month} 1`).getMonth() + 1, 0).getDate();
    const dayHeaders = ['S/N', 'Student Name'];
    
    // Add day numbers as headers
    for (let day = 1; day <= Math.min(daysInMonth, 20); day++) {
      dayHeaders.push(day.toString());
    }
    
    const tableData = students.map((student, index) => {
      const row = [(index + 1).toString(), student.name];
      // Add empty cells for each day
      for (let day = 1; day <= Math.min(daysInMonth, 20); day++) {
        row.push('');
      }
      return row;
    });
    
    (doc as any).autoTable({
      startY: currentY + 20,
      head: [dayHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 }
      },
      margin: { left: 20, right: 20 }
    });
    
    const filename = `Attendance_${className.replace(/\s+/g, '_')}_${month}_${year}.pdf`;
    doc.save(filename);
    console.log('Attendance sheet PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateAttendanceSheetPDF:', error);
    throw error;
  }
};

// Generate Exam Timetable PDF
export const generateExamTimetablePDF = async (examTitle: string, examSchedule: any[], academicSession: string, term: string): Promise<void> => {
  console.log('generateExamTimetablePDF called with:', { examTitle, examSchedule, academicSession, term });
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle(examTitle.toUpperCase(), currentY);
    
    // Add session/term info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Academic Session: ${academicSession} | Term: ${term}`, 105, currentY + 10, { align: 'center' });
    
    // Exam schedule table
    const tableData = examSchedule.map(exam => [
      new Date(exam.date).toLocaleDateString(),
      exam.time,
      exam.subject,
      exam.duration,
      exam.venue,
      exam.classes.join(', ')
    ]);
    
    (doc as any).autoTable({
      startY: currentY + 25,
      head: [['Date', 'Time', 'Subject', 'Duration', 'Venue', 'Classes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Add instructions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMINATION INSTRUCTIONS:', 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const instructions = [
      '1. Students must be in the examination venue 15 minutes before the scheduled time.',
      '2. No electronic devices are allowed in the examination hall.',
      '3. Students must bring their own writing materials.',
      '4. Late arrival will not be permitted after 30 minutes of exam commencement.'
    ];
    
    instructions.forEach((instruction, index) => {
      doc.text(instruction, 20, finalY + 10 + (index * 6));
    });
    
    const filename = `${examTitle.replace(/\s+/g, '_')}_Timetable_${academicSession.replace('/', '-')}.pdf`;
    doc.save(filename);
    console.log('Exam timetable PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateExamTimetablePDF:', error);
    throw error;
  }
};

// Generate Staff List PDF
export const generateStaffListPDF = async (staff: any[], academicSession: string): Promise<void> => {
  console.log('generateStaffListPDF called with:', { staff, academicSession });
  
  try {
    // Create jsPDF instance with autoTable plugin
    const doc = await createJsPDFWithAutoTable('p', 'a4');
    console.log('jsPDF instance with autoTable created successfully');
    
    const styler = new PDFStyler(doc);
    
    // Add header
    let currentY = styler.addSchoolHeader();
    
    // Add document title
    currentY = styler.addDocumentTitle('STAFF DIRECTORY', currentY);
    
    // Add session info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Academic Session: ${academicSession}`, 20, currentY + 10);
    
    // Staff table
    const tableData = staff.map((member, index) => [
      (index + 1).toString(),
      member.name,
      member.employeeId,
      member.department,
      member.position,
      member.qualification,
      member.phone,
      member.email
    ]);
    
    (doc as any).autoTable({
      startY: currentY + 20,
      head: [['S/N', 'Name', 'Employee ID', 'Department', 'Position', 'Qualification', 'Phone', 'Email']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 35 }
      },
      margin: { left: 10, right: 10 }
    });
    
    const filename = `Staff_Directory_${academicSession.replace('/', '-')}.pdf`;
    doc.save(filename);
    console.log('Staff list PDF saved successfully');
    
  } catch (error) {
    console.error('Error in generateStaffListPDF:', error);
    throw error;
  }
};

// Utility function to get overall grade
const getOverallGrade = (average: number): string => {
  if (average >= 90) return 'A+';
  if (average >= 80) return 'A';
  if (average >= 70) return 'B';
  if (average >= 60) return 'C';
  if (average >= 50) return 'D';
  if (average >= 40) return 'E';
  return 'F';
};

// Utility function to convert number to words (simplified)
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];
  
  if (num === 0) return 'Zero';
  
  const convertHundreds = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  };
  
  let result = '';
  let thousandIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      result = convertHundreds(chunk) + thousands[thousandIndex] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    thousandIndex++;
  }
  
  return result.trim();
};

// Export all functions and types
export {
  PDFStyler,
  COLORS,
  SCHOOL_INFO
};