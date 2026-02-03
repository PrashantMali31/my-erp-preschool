import { Student, Teacher, Attendance, Fee, Announcement, Class, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const now = new Date().toISOString();

export const users: User[] = [
  {
    id: '1',
    email: 'admin@littlestars.com',
    password: bcrypt.hashSync('admin123', 10),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: '2',
    email: 'teacher@littlestars.com',
    password: bcrypt.hashSync('teacher123', 10),
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'teacher',
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
];

export const classes: Class[] = [
  {
    id: 'c1',
    name: 'Nursery',
    section: 'A',
    teacherId: '2',
    teacherName: 'Sarah Johnson',
    capacity: 25,
    currentStrength: 22,
    academicYear: '2025-2026',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '12:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '12:00' },
      { day: 'Friday', startTime: '09:00', endTime: '12:00' }
    ],
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'c2',
    name: 'LKG',
    section: 'A',
    teacherId: '3',
    teacherName: 'Emily Davis',
    capacity: 30,
    currentStrength: 28,
    academicYear: '2025-2026',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' }
    ],
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'c3',
    name: 'UKG',
    section: 'A',
    teacherId: '4',
    teacherName: 'Michael Brown',
    capacity: 30,
    currentStrength: 25,
    academicYear: '2025-2026',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '14:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '14:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '14:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '14:00' },
      { day: 'Friday', startTime: '09:00', endTime: '14:00' }
    ],
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
];

export const students: Student[] = [
  {
    id: 's1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: '2021-03-15',
    gender: 'male',
    admissionDate: '2025-04-01',
    classId: 'c1',
    className: 'Nursery A',
    parentName: 'Rajesh Sharma',
    parentEmail: 'rajesh.sharma@email.com',
    parentPhone: '+91 98765 43210',
    address: '123 Green Park, New Delhi',
    bloodGroup: 'A+',
    allergies: 'None',
    emergencyContact: '+91 98765 43211',
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 's2',
    firstName: 'Ananya',
    lastName: 'Patel',
    dateOfBirth: '2020-07-22',
    gender: 'female',
    admissionDate: '2024-04-01',
    classId: 'c2',
    className: 'LKG A',
    parentName: 'Vikram Patel',
    parentEmail: 'vikram.patel@email.com',
    parentPhone: '+91 87654 32109',
    address: '456 Sunrise Apartments, Mumbai',
    bloodGroup: 'B+',
    allergies: 'Peanuts',
    emergencyContact: '+91 87654 32100',
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 's3',
    firstName: 'Vihaan',
    lastName: 'Gupta',
    dateOfBirth: '2019-11-10',
    gender: 'male',
    admissionDate: '2023-04-01',
    classId: 'c3',
    className: 'UKG A',
    parentName: 'Amit Gupta',
    parentEmail: 'amit.gupta@email.com',
    parentPhone: '+91 76543 21098',
    address: '789 Lake View Colony, Bangalore',
    bloodGroup: 'O+',
    emergencyContact: '+91 76543 21099',
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 's4',
    firstName: 'Diya',
    lastName: 'Singh',
    dateOfBirth: '2021-01-05',
    gender: 'female',
    admissionDate: '2025-04-01',
    classId: 'c1',
    className: 'Nursery A',
    parentName: 'Priya Singh',
    parentEmail: 'priya.singh@email.com',
    parentPhone: '+91 65432 10987',
    address: '321 Palm Grove, Chennai',
    bloodGroup: 'AB+',
    emergencyContact: '+91 65432 10988',
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 's5',
    firstName: 'Arjun',
    lastName: 'Reddy',
    dateOfBirth: '2020-09-18',
    gender: 'male',
    admissionDate: '2024-04-01',
    classId: 'c2',
    className: 'LKG A',
    parentName: 'Kiran Reddy',
    parentEmail: 'kiran.reddy@email.com',
    parentPhone: '+91 54321 09876',
    address: '654 Hill Station Road, Hyderabad',
    bloodGroup: 'B-',
    allergies: 'Dairy',
    emergencyContact: '+91 54321 09877',
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
];

export const teachers: Teacher[] = [
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@littlestars.com',
    phone: '+91 98765 11111',
    dateOfBirth: '1990-05-15',
    gender: 'female',
    joinDate: '2022-06-01',
    qualification: 'B.Ed in Early Childhood Education',
    specialization: 'Early Learning & Development',
    assignedClasses: ['c1'],
    address: '100 Teacher Colony, New Delhi',
    salary: 45000,
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@littlestars.com',
    phone: '+91 98765 22222',
    dateOfBirth: '1988-08-20',
    gender: 'female',
    joinDate: '2021-04-15',
    qualification: 'M.Ed in Child Psychology',
    specialization: 'Child Psychology & Behavior',
    assignedClasses: ['c2'],
    address: '200 Educator Lane, Mumbai',
    salary: 50000,
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@littlestars.com',
    phone: '+91 98765 33333',
    dateOfBirth: '1985-12-10',
    gender: 'male',
    joinDate: '2020-08-01',
    qualification: 'B.Ed, M.A. Education',
    specialization: 'Montessori Methods',
    assignedClasses: ['c3'],
    address: '300 School Street, Bangalore',
    salary: 55000,
    status: 'active',
    createdAt: now,
    updatedAt: now
  },
  {
    id: '5',
    firstName: 'Priya',
    lastName: 'Menon',
    email: 'priya.menon@littlestars.com',
    phone: '+91 98765 44444',
    dateOfBirth: '1992-03-25',
    gender: 'female',
    joinDate: '2023-01-10',
    qualification: 'B.Ed in Special Education',
    specialization: 'Special Needs Education',
    assignedClasses: ['c1', 'c2'],
    address: '400 Academy Road, Chennai',
    salary: 48000,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }
];

const today = new Date().toISOString().split('T')[0];

export const attendance: Attendance[] = [
  { id: 'a1', studentId: 's1', studentName: 'Aarav Sharma', classId: 'c1', className: 'Nursery A', date: today, status: 'present', markedBy: '2', createdAt: now },
  { id: 'a2', studentId: 's2', studentName: 'Ananya Patel', classId: 'c2', className: 'LKG A', date: today, status: 'present', markedBy: '3', createdAt: now },
  { id: 'a3', studentId: 's3', studentName: 'Vihaan Gupta', classId: 'c3', className: 'UKG A', date: today, status: 'late', remarks: 'Arrived 15 mins late', markedBy: '4', createdAt: now },
  { id: 'a4', studentId: 's4', studentName: 'Diya Singh', classId: 'c1', className: 'Nursery A', date: today, status: 'absent', remarks: 'Sick leave', markedBy: '2', createdAt: now },
  { id: 'a5', studentId: 's5', studentName: 'Arjun Reddy', classId: 'c2', className: 'LKG A', date: today, status: 'present', markedBy: '3', createdAt: now }
];

export const fees: Fee[] = [
  {
    id: 'f1',
    studentId: 's1',
    studentName: 'Aarav Sharma',
    classId: 'c1',
    className: 'Nursery A',
    feeType: 'tuition',
    amount: 15000,
    dueDate: '2026-01-15',
    paidDate: '2026-01-10',
    status: 'paid',
    paymentMethod: 'upi',
    transactionId: 'TXN001234',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'f2',
    studentId: 's2',
    studentName: 'Ananya Patel',
    classId: 'c2',
    className: 'LKG A',
    feeType: 'tuition',
    amount: 18000,
    dueDate: '2026-01-15',
    status: 'pending',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'f3',
    studentId: 's3',
    studentName: 'Vihaan Gupta',
    classId: 'c3',
    className: 'UKG A',
    feeType: 'tuition',
    amount: 20000,
    dueDate: '2026-01-10',
    status: 'overdue',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'f4',
    studentId: 's1',
    studentName: 'Aarav Sharma',
    classId: 'c1',
    className: 'Nursery A',
    feeType: 'transport',
    amount: 3000,
    dueDate: '2026-01-15',
    status: 'pending',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'f5',
    studentId: 's4',
    studentName: 'Diya Singh',
    classId: 'c1',
    className: 'Nursery A',
    feeType: 'tuition',
    amount: 15000,
    dueDate: '2026-01-15',
    paidDate: '2026-01-12',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN001235',
    createdAt: now,
    updatedAt: now
  }
];

export const announcements: Announcement[] = [
  {
    id: 'an1',
    title: 'Annual Day Celebration',
    content: 'We are excited to announce our Annual Day celebration on January 25th, 2026. All parents are cordially invited to join us for this special event featuring performances by our little stars.',
    type: 'event',
    targetAudience: 'all',
    priority: 'high',
    publishDate: '2026-01-10',
    expiryDate: '2026-01-26',
    createdBy: '1',
    status: 'published',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'an2',
    title: 'Republic Day Holiday',
    content: 'The school will remain closed on January 26th, 2026 on account of Republic Day. Regular classes will resume on January 27th.',
    type: 'holiday',
    targetAudience: 'all',
    priority: 'normal',
    publishDate: '2026-01-15',
    expiryDate: '2026-01-27',
    createdBy: '1',
    status: 'published',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'an3',
    title: 'Parent-Teacher Meeting',
    content: 'PTM scheduled for February 1st, 2026. Please book your slot through the parent portal or contact the school office.',
    type: 'reminder',
    targetAudience: 'parents',
    priority: 'high',
    publishDate: '2026-01-18',
    expiryDate: '2026-02-02',
    createdBy: '1',
    status: 'published',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'an4',
    title: 'Winter Uniform Notice',
    content: 'Students are required to wear proper winter uniforms starting this week. Please ensure your child comes dressed appropriately.',
    type: 'general',
    targetAudience: 'parents',
    priority: 'normal',
    publishDate: '2026-01-05',
    createdBy: '1',
    status: 'published',
    createdAt: now,
    updatedAt: now
  }
];
