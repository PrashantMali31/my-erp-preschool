import mongoose, { Schema, Document } from 'mongoose';

interface ISchedule {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
}

export interface IClass extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  section: string;
  teacherId?: mongoose.Types.ObjectId;
  capacity: number;
  academicYear: string;
  schedule: ISchedule[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
  },
  { _id: false }
);

const classSchema = new Schema<IClass>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    capacity: { type: Number, required: true },
    academicYear: { type: String, required: true },
    schedule: [scheduleSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, name: 1, section: 1, academicYear: 1 }, { unique: true });

export const Class = mongoose.model<IClass>('Class', classSchema);
