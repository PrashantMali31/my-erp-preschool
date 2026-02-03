import type { Permission, Role } from '@/lib/rbac'

export type UserRole = 'admin' | 'teacher' | 'parent'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  status: string
  permissions?: Permission[]
}

export interface School {
  id: string
  name: string
  logo?: string
  address: string
  phone: string
  email: string
}

export interface Student {
  id: string
  name: string
  dateOfBirth: string
  gender: 'male' | 'female'
  photo?: string
  classId: string
  className: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  address: string
  admissionDate: string
  bloodGroup?: string
  allergies?: string
  status: 'active' | 'inactive'
}

export interface Teacher {
  id: string
  name: string
  phone: string
  email: string
  photo?: string
  qualification: string
  assignedClasses: string[]
  joinDate: string
  salary: number
  status: 'active' | 'inactive'
}

export interface ClassSection {
  id: string
  name: string
  capacity: number
  teacherId?: string
}

export interface Attendance {
  id: string
  studentId: string
  date: string
  status: 'present' | 'absent' | 'late'
  markedBy: string
  markedAt: string
}

export interface Fee {
  id: string
  studentId: string
  studentName: string
  className: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'due' | 'partial'
  paidAmount: number
  month: string
  year: number
  paymentMethod?: 'cash' | 'upi' | 'bank'
  receiptNo?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'event' | 'holiday' | 'homework'
  createdAt: string
  createdBy: string
  attachments?: string[]
}

export interface Activity {
  id: string
  title: string
  description: string
  photos: string[]
  date: string
  classId?: string
}
