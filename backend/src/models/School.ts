import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'trial' | 'expired' | 'suspended';
  trialEndsAt?: Date;
  settings: {
    currency: string;
    timezone: string;
    academicYear: string;
    workingDays: string[];
    schoolTimings: {
      startTime: string;
      endTime: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    logo: { type: String },
    subscriptionPlan: { 
      type: String, 
      enum: ['free', 'basic', 'premium', 'enterprise'], 
      default: 'free' 
    },
    status: { 
      type: String, 
      enum: ['active', 'trial', 'expired', 'suspended'], 
      default: 'trial' 
    },
    trialEndsAt: { type: Date },
    settings: {
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      academicYear: { type: String, default: '2025-2026' },
      workingDays: { type: [String], default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
      schoolTimings: {
        startTime: { type: String, default: '08:00' },
        endTime: { type: String, default: '14:00' },
      },
    },
  },
  { timestamps: true }
);

schoolSchema.index({ email: 1 }, { unique: true });
schoolSchema.index({ status: 1 });

export const School = mongoose.model<ISchool>('School', schoolSchema);
