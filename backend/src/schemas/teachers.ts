import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    dateOfBirth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.enum(['male', 'female', 'other']),
    qualification: z.string().min(2, 'Qualification is too short'),
    specialization: z.string().min(2, 'Specialization is too short'),
    address: z.string().min(5, 'Address is too short'),
    salary: z.number().positive('Salary must be positive').optional(),
    joinDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    assignedClasses: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID')).optional(),
  }),
});

export const updateTeacherSchema = createTeacherSchema.partial();
