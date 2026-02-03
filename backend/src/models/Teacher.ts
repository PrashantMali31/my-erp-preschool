import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  schoolId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  joinDate: Date;
  qualification: string;
  specialization: string;
  assignedClasses: mongoose.Types.ObjectId[];
  address: string;
  salary: number;
  profileImage?: string;
  status: 'active' | 'inactive' | 'on-leave';
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    joinDate: { type: Date, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    address: { type: String, required: true },
    salary: { type: Number, required: true },
    profileImage: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  },
  { timestamps: true }
);

teacherSchema.index({ schoolId: 1, email: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, status: 1 });

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);
