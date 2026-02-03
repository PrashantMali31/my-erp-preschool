import mongoose, { Schema, Document } from 'mongoose';

export interface IFee extends Document {
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  feeType: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'online';
  transactionId?: string;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feeSchema = new Schema<IFee>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    feeType: { type: String, enum: ['tuition', 'transport', 'meals', 'activities', 'other'], required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'partial'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'online'] },
    transactionId: { type: String },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

feeSchema.index({ schoolId: 1, studentId: 1, feeType: 1, dueDate: 1 });
feeSchema.index({ schoolId: 1, status: 1 });
feeSchema.index({ schoolId: 1, dueDate: 1 });

export const Fee = mongoose.model<IFee>('Fee', feeSchema);
