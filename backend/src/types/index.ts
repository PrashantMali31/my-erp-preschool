export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  admissionDate: string;
  classId: string;
  className: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact: string;
  status: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  joinDate: string;
  qualification: string;
  specialization: string;
  assignedClasses: string[];
  address: string;
  salary: number;
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: string;
  createdAt: string;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  feeType: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'upi';
  transactionId?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'event' | 'holiday' | 'emergency' | 'reminder';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  teacherName: string;
  capacity: number;
  currentStrength: number;
  academicYear: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'parent';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  pendingFees: number;
  attendanceRate: number;
  feeCollectionRate: number;
  recentActivities: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    type: string;
  }[];
}
