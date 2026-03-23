// Teacher administrative offices system

export type TeacherOffice = 
  | 'none'
  | 'exam_officer'
  | 'accountant'
  | 'labour_master'
  | 'senior_master_admin'
  | 'senior_master_academic'
  | 'discipline_master'
  | 'house_master'
  | 'form_master'
  | 'sports_master'
  | 'library_master'
  | 'lab_technician';

export interface OfficeDefinition {
  value: TeacherOffice;
  label: string;
  description: string;
  dashboardRole: 'teacher' | 'exam_officer' | 'accountant' | 'admin';
  canSubmitReports: boolean;
}

export const TEACHER_OFFICES: OfficeDefinition[] = [
  {
    value: 'none',
    label: 'No Administrative Office',
    description: 'Regular teaching staff with no additional administrative duties',
    dashboardRole: 'teacher',
    canSubmitReports: false
  },
  {
    value: 'exam_officer',
    label: 'Exam Officer',
    description: 'Manages examinations, results, and academic assessments',
    dashboardRole: 'exam_officer',
    canSubmitReports: true
  },
  {
    value: 'accountant',
    label: 'Accountant',
    description: 'Handles financial records, payments, and expenditures',
    dashboardRole: 'accountant',
    canSubmitReports: true
  },
  {
    value: 'labour_master',
    label: 'Labour Master',
    description: 'Oversees student work assignments and school maintenance',
    dashboardRole: 'admin',
    canSubmitReports: true
  },
  {
    value: 'senior_master_admin',
    label: 'Senior Master (Admin)',
    description: 'Assists in administrative duties and school management',
    dashboardRole: 'admin',
    canSubmitReports: true
  },
  {
    value: 'senior_master_academic',
    label: 'Senior Master (Academic)',
    description: 'Oversees academic programs and curriculum implementation',
    dashboardRole: 'admin',
    canSubmitReports: true
  },
  {
    value: 'discipline_master',
    label: 'Discipline Master',
    description: 'Maintains student discipline and behavioral standards',
    dashboardRole: 'admin',
    canSubmitReports: true
  },
  {
    value: 'house_master',
    label: 'House Master',
    description: 'Manages boarding house operations and student welfare',
    dashboardRole: 'admin',
    canSubmitReports: true
  },
  {
    value: 'form_master',
    label: 'Form Master/Class Teacher',
    description: 'Primary teacher responsible for a specific class',
    dashboardRole: 'teacher',
    canSubmitReports: true
  },
  {
    value: 'sports_master',
    label: 'Sports Master',
    description: 'Coordinates sports activities and physical education',
    dashboardRole: 'teacher',
    canSubmitReports: true
  },
  {
    value: 'library_master',
    label: 'Library Master',
    description: 'Manages library resources and reading programs',
    dashboardRole: 'teacher',
    canSubmitReports: true
  },
  {
    value: 'lab_technician',
    label: 'Lab Technician',
    description: 'Maintains science laboratories and equipment',
    dashboardRole: 'teacher',
    canSubmitReports: true
  }
];

// Get office definition by value
export const getOfficeDefinition = (office: TeacherOffice): OfficeDefinition => {
  return TEACHER_OFFICES.find(o => o.value === office) || TEACHER_OFFICES[0];
};

// Get dashboard role for a teacher based on their office
export const getDashboardRoleForOffice = (office: TeacherOffice): string => {
  const officeDefinition = getOfficeDefinition(office);
  return officeDefinition.dashboardRole;
};

// Check if office holder can submit reports
export const canSubmitReports = (office: TeacherOffice): boolean => {
  const officeDefinition = getOfficeDefinition(office);
  return officeDefinition.canSubmitReports;
};
