import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Student, Teacher, Attendance, Fee, Announcement, ClassSection } from '@/types'
import { Role, Permission, getRolePermissions } from '@/lib/rbac'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface School {
  id: string
  name: string
  status: string
  subscriptionPlan?: string
  trialEndsAt?: string
  settings?: {
    currency: string
    timezone: string
    academicYear: string
  }
}

interface AuthState {
  user: User | null
  school: School | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User, token: string) => void
  setSchool: (school: School) => void
  getRole: () => Role | null
  getPermissions: () => Permission[]
  getSchoolId: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      school: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.message || 'Login failed')
          
          const user = {
            ...data.data.user,
            schoolId: data.data.user.schoolId || data.data.school?.id,
          }
          
          set({ 
            user,
            school: data.data.school || null,
            token: data.data.token, 
            isAuthenticated: true,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        set({ user: null, school: null, token: null, isAuthenticated: false })
      },
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
      setSchool: (school) => set({ school }),
      getRole: () => {
        const { user } = get()
        return user?.role || null
      },
      getPermissions: () => {
        const { user } = get()
        if (!user?.role) return []
        return user.permissions || getRolePermissions(user.role)
      },
      getSchoolId: () => {
        const { user, school } = get()
        return user?.schoolId || school?.id || null
      },
    }),
    { name: 'auth-storage' }
  )
)

interface AppState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'app-storage' }
  )
)

interface DataState {
  students: Student[]
  teachers: Teacher[]
  classes: ClassSection[]
  attendance: Attendance[]
  fees: Fee[]
  announcements: Announcement[]
  loading: boolean
  error: string | null
  fetchStudents: () => Promise<void>
  fetchTeachers: () => Promise<void>
  fetchClasses: () => Promise<void>
  fetchAttendance: (date?: string) => Promise<void>
  fetchFees: () => Promise<void>
  fetchAnnouncements: () => Promise<void>
  fetchDashboardData: () => Promise<void>
  addStudent: (student: Partial<Student>) => Promise<void>
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  addTeacher: (teacher: Partial<Teacher>) => Promise<void>
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>
  deleteTeacher: (id: string) => Promise<void>
  markAttendance: (studentId: string, classId: string, date: string, status: string) => Promise<void>
  addFee: (fee: Partial<Fee>) => Promise<void>
  updateFee: (id: string, data: Partial<Fee>) => Promise<void>
  addAnnouncement: (announcement: Partial<Announcement>) => Promise<void>
  deleteAnnouncement: (id: string) => Promise<void>
  addClass: (classData: { name: string; section: string; capacity: number; teacherId?: string }) => Promise<void>
  updateClass: (id: string, data: Partial<ClassSection>) => Promise<void>
  deleteClass: (id: string) => Promise<void>
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useDataStore = create<DataState>()((set, get) => ({
  students: [],
  teachers: [],
  classes: [],
  attendance: [],
  fees: [],
  announcements: [],
  loading: false,
  error: null,

    fetchStudents: async () => {
      set({ loading: true, error: null })
      try {
        const response = await fetch(`${API_BASE_URL}/students?limit=100`, {
          headers: { ...getAuthHeader() },
        })
        const data = await response.json()
        if (data.status === 'success') {
          const students = data.data.students.map((s: Record<string, unknown>) => ({
            id: s.id || s._id,
            name: `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            dateOfBirth: s.dateOfBirth,
            gender: s.gender,
            classId: s.classId?._id || s.classId,
            className: s.className,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            parentEmail: s.parentEmail,
            address: s.address,
            admissionDate: s.admissionDate,
            bloodGroup: s.bloodGroup,
            status: s.status,
          }))
          set({ students, loading: false })
        } else {
          set({ error: data.message || 'Failed to fetch students', loading: false })
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

    fetchTeachers: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${API_BASE_URL}/teachers?limit=100`, {
            headers: { ...getAuthHeader() },
          })
          const data = await response.json()
          if (data.status === 'success') {
            const teachers = data.data.teachers.map((t: Record<string, unknown>) => ({
              id: t.id || t._id,
              name: `${t.firstName} ${t.lastName}`,
              firstName: t.firstName,
              lastName: t.lastName,
              phone: t.phone,
              email: t.email,
              dateOfBirth: t.dateOfBirth,
              gender: t.gender,
              qualification: t.qualification,
              specialization: t.specialization,
              assignedClasses: Array.isArray(t.assignedClasses) 
                ? t.assignedClasses.map((c: unknown) => typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id : c)
                : [],
              address: t.address,
              joinDate: t.joinDate,
              salary: t.salary,
              status: t.status,
            }))
            set({ teachers, loading: false })
          } else {
            set({ error: data.message || 'Failed to fetch teachers', loading: false })
          }
        } catch (error) {
          set({ error: (error as Error).message, loading: false })
        }
      },

    fetchClasses: async () => {
      set({ loading: true, error: null })
      try {
        const response = await fetch(`${API_BASE_URL}/classes?limit=100`, {
          headers: { ...getAuthHeader() },
        })
        const data = await response.json()
        if (data.status === 'success') {
          const classes = data.data.classes.map((c: Record<string, unknown>) => ({
            id: c.id || c._id,
            name: `${c.name} ${c.section}`,
            capacity: c.capacity,
            teacherId: c.teacherId,
            teacherName: c.teacherName,
            currentStrength: c.currentStrength,
          }))
          set({ classes, loading: false })
        } else {
          set({ error: data.message || 'Failed to fetch classes', loading: false })
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

    fetchAttendance: async (date?: string) => {
      set({ loading: true, error: null })
      try {
        const queryDate = date || new Date().toISOString().split('T')[0]
        const response = await fetch(`${API_BASE_URL}/attendance?date=${queryDate}&limit=200`, {
          headers: { ...getAuthHeader() },
        })
        const data = await response.json()
        if (data.status === 'success') {
          const attendance = data.data.attendance.map((a: Record<string, unknown>) => ({
            id: a.id || a._id,
            studentId: a.studentId?._id || a.studentId,
            studentName: a.studentName,
            classId: a.classId?._id || a.classId,
            className: a.className,
            date: typeof a.date === 'string' ? a.date.split('T')[0] : a.date,
            status: a.status,
            remarks: a.remarks,
          }))
          set({ attendance, loading: false })
        } else {
          set({ error: data.message || 'Failed to fetch attendance', loading: false })
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

    fetchFees: async () => {
      set({ loading: true, error: null })
      try {
        const response = await fetch(`${API_BASE_URL}/fees?limit=200`, {
          headers: { ...getAuthHeader() },
        })
        const data = await response.json()
        if (data.status === 'success') {
          const fees = data.data.fees.map((f: Record<string, unknown>) => ({
            id: f.id || f._id,
            studentId: f.studentId?._id || f.studentId,
            studentName: f.studentName,
            classId: f.classId?._id || f.classId,
            className: f.className,
            feeType: f.feeType,
            amount: f.amount,
            dueDate: f.dueDate,
            paidDate: f.paidDate,
            status: f.status,
            paidAmount: f.status === 'paid' ? f.amount : 0,
            paymentMethod: f.paymentMethod,
          }))
          set({ fees, loading: false })
        } else {
          set({ error: data.message || 'Failed to fetch fees', loading: false })
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

    fetchAnnouncements: async () => {
      set({ loading: true, error: null })
      try {
        const response = await fetch(`${API_BASE_URL}/announcements?limit=50`, {
          headers: { ...getAuthHeader() },
        })
        const data = await response.json()
        if (data.status === 'success') {
          const announcements = data.data.announcements.map((a: Record<string, unknown>) => ({
            id: a.id || a._id,
            title: a.title,
            content: a.content,
            type: a.type,
            priority: a.priority,
            status: a.status,
            createdAt: a.publishDate || a.createdAt,
            createdBy: 'Admin',
          }))
          set({ announcements, loading: false })
        } else {
          set({ error: data.message || 'Failed to fetch announcements', loading: false })
        }
      } catch (error) {
        set({ error: (error as Error).message, loading: false })
      }
    },

  fetchDashboardData: async () => {
    const state = get()
    await Promise.all([
      state.fetchStudents(),
      state.fetchTeachers(),
      state.fetchClasses(),
      state.fetchAttendance(),
      state.fetchFees(),
      state.fetchAnnouncements(),
    ])
  },

  addStudent: async (student) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(student),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchStudents()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateStudent: async (id, studentData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(studentData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchStudents()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }
      await get().fetchStudents()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addTeacher: async (teacher) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(teacher),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchTeachers()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateTeacher: async (id, teacherData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(teacherData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchTeachers()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteTeacher: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }
      await get().fetchTeachers()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  markAttendance: async (studentId, classId, date, status) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ studentId, classId, date, status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchAttendance(date)
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addFee: async (fee) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(fee),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchFees()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateFee: async (id, feeData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(feeData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchFees()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addAnnouncement: async (announcement) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(announcement),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchAnnouncements()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteAnnouncement: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }
      await get().fetchAnnouncements()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  addClass: async (classData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(classData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchClasses()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateClass: async (id, classData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(classData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      await get().fetchClasses()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteClass: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }
      await get().fetchClasses()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))
