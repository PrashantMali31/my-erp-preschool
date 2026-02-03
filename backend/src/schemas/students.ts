import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    dateOfBirth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    gender: z.enum(['male', 'female', 'other']),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),
    admissionDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    address: z.string().min(5, 'Address is too short'),
    parentName: z.string().min(2, 'Parent name is too short'),
    parentPhone: z.string().min(10, 'Invalid phone number'),
    parentEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  }),
});

export const updateStudentSchema = createStudentSchema.partial();
