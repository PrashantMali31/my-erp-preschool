import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  schoolId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  admissionDate: Date;
  classId: mongoose.Types.ObjectId;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact: string;
  profileImage?: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    admissionDate: { type: Date, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String, required: true },
    bloodGroup: { type: String },
    allergies: { type: String },
    emergencyContact: { type: String, required: true },
    profileImage: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active' },
  },
  { timestamps: true }
);

studentSchema.index({ schoolId: 1, classId: 1 });
studentSchema.index({ schoolId: 1, status: 1 });

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
