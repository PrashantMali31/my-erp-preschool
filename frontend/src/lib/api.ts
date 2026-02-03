const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  count?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'An error occurred', response.status, data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout. Please try again.', 408);
        }
        
        if ((error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) && retries > 0) {
          await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
          return this.request<T>(endpoint, options, retries - 1);
        }
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error. Please check your connection.',
        0
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE_URL);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (data: RegisterData) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const studentsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ students: Student[] }>('/students', params),
  getById: (id: string) => api.get<{ student: Student }>(`/students/${id}`),
  create: (data: Partial<Student>) => api.post<{ student: Student }>('/students', data),
  update: (id: string, data: Partial<Student>) =>
    api.put<{ student: Student }>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const teachersApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ teachers: Teacher[] }>('/teachers', params),
  getById: (id: string) => api.get<{ teacher: Teacher }>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => api.post<{ teacher: Teacher }>('/teachers', data),
  update: (id: string, data: Partial<Teacher>) =>
    api.put<{ teacher: Teacher }>(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

export const classesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ classes: Class[] }>('/classes', params),
  getById: (id: string) => api.get<{ class: Class }>(`/classes/${id}`),
  getStudents: (id: string) =>
    api.get<{ students: Student[] }>(`/classes/${id}/students`),
  create: (data: Partial<Class>) => api.post<{ class: Class }>('/classes', data),
  update: (id: string, data: Partial<Class>) =>
    api.put<{ class: Class }>(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
};

export const attendanceApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ attendance: Attendance[] }>('/attendance', params),
  getSummary: (params?: Record<string, string>) =>
    api.get<{ summary: AttendanceSummary }>('/attendance/summary', params),
  mark: (data: MarkAttendance) =>
    api.post<{ attendance: Attendance }>('/attendance', data),
  bulkMark: (date: string, records: MarkAttendance[]) =>
    api.post<{ attendance: Attendance[] }>('/attendance/bulk', { date, records }),
  update: (id: string, data: Partial<Attendance>) =>
    api.put<{ attendance: Attendance }>(`/attendance/${id}`, data),
};

export const feesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ fees: Fee[] }>('/fees', params),
  getSummary: () => api.get<{ summary: FeeSummary }>('/fees/summary'),
  getById: (id: string) => api.get<{ fee: Fee }>(`/fees/${id}`),
  create: (data: Partial<Fee>) => api.post<{ fee: Fee }>('/fees', data),
  update: (id: string, data: Partial<Fee>) =>
    api.put<{ fee: Fee }>(`/fees/${id}`, data),
  pay: (id: string, paymentMethod: string, transactionId?: string) =>
    api.post<{ fee: Fee }>(`/fees/${id}/pay`, { paymentMethod, transactionId }),
  delete: (id: string) => api.delete(`/fees/${id}`),
};

export const announcementsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ announcements: Announcement[] }>('/announcements', params),
  getActive: () => api.get<{ announcements: Announcement[] }>('/announcements/active'),
  getById: (id: string) =>
    api.get<{ announcement: Announcement }>(`/announcements/${id}`),
  create: (data: Partial<Announcement>) =>
    api.post<{ announcement: Announcement }>('/announcements', data),
  update: (id: string, data: Partial<Announcement>) =>
    api.put<{ announcement: Announcement }>(`/announcements/${id}`, data),
  publish: (id: string) =>
    api.post<{ announcement: Announcement }>(`/announcements/${id}/publish`),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get<{ stats: DashboardStats }>('/dashboard/stats'),
  getClasses: () => api.get<{ classes: ClassStats[] }>('/dashboard/classes'),
  getAttendanceOverview: () =>
    api.get<{ attendanceOverview: AttendanceOverview[] }>('/dashboard/attendance-overview'),
  getFeeOverview: () => api.get<{ feeOverview: FeeOverview }>('/dashboard/fee-overview'),
};

export const reportsApi = {
  getAttendance: (params?: Record<string, string>) =>
    api.get<{ report: AttendanceReport }>('/reports/attendance', params),
  getFees: (params?: Record<string, string>) =>
    api.get<{ report: FeeReport }>('/reports/fees', params),
  getStudents: (params?: Record<string, string>) =>
    api.get<{ report: StudentReport }>('/reports/students', params),
  getTeachers: (params?: Record<string, string>) =>
    api.get<{ report: TeacherReport }>('/reports/teachers', params),
};

export const settingsApi = {
  get: () => api.get<{ settings: Settings }>('/settings'),
  update: (data: Partial<Settings>) =>
    api.put<{ settings: Settings }>('/settings', data),
  getAcademicYears: () =>
    api.get<{ academicYears: string[] }>('/settings/academic-years'),
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
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
  status: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  joinDate: string;
  qualification: string;
  specialization: string;
  assignedClasses: string[];
  address: string;
  salary: number;
  status: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  teacherName: string;
  capacity: number;
  currentStrength: number;
  academicYear: string;
  status: string;
}

interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: string;
  remarks?: string;
}

interface AttendanceSummary {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface MarkAttendance {
  studentId: string;
  status: string;
  remarks?: string;
}

interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
}

interface FeeSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionRate: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  status: string;
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  pendingFees: number;
  attendanceRate: number;
  feeCollectionRate: number;
  recentActivities: { id: string; type: string; message: string; timestamp: string }[];
  upcomingEvents: { id: string; title: string; date: string; type: string }[];
}

interface ClassStats {
  id: string;
  name: string;
  teacherName: string;
  totalStudents: number;
  capacity: number;
  status: string;
}

interface AttendanceOverview {
  date: string;
  day: string;
  present: number;
  absent: number;
  total: number;
}

interface FeeOverview {
  tuition: { total: number; paid: number; pending: number };
  transport: { total: number; paid: number; pending: number };
  meals: { total: number; paid: number; pending: number };
  activities: { total: number; paid: number; pending: number };
  other: { total: number; paid: number; pending: number };
}

interface AttendanceReport {
  summary: {
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  byClass: {
    classId: string;
    className: string;
    total: number;
    present: number;
    absent: number;
    attendanceRate: number;
  }[];
}

interface FeeReport {
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    collectionRate: number;
  };
  byClass: {
    classId: string;
    className: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    collectionRate: number;
  }[];
}

interface StudentReport {
  summary: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    graduatedStudents: number;
  };
  byClass: {
    classId: string;
    className: string;
    totalStudents: number;
    activeStudents: number;
    capacity: number;
  }[];
  byGender: {
    male: number;
    female: number;
    other: number;
  };
}

interface TeacherReport {
  summary: {
    totalTeachers: number;
    activeTeachers: number;
    onLeaveTeachers: number;
    totalSalaryExpense: number;
    averageSalary: number;
  };
  bySpecialization: Record<string, number>;
}

interface Settings {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  academicYear: string;
  currency: string;
  timezone: string;
  workingDays: string[];
  schoolTimings: {
    startTime: string;
    endTime: string;
  };
  feeSettings: {
    lateFeePercentage: number;
    gracePeriodDays: number;
  };
}
