import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  schoolId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'general' | 'event' | 'holiday' | 'urgent' | 'reminder';
  targetAudience: 'all' | 'teachers' | 'parents' | 'staff';
  priority: 'low' | 'medium' | 'high';
  publishDate: Date;
  expiryDate?: Date;
  status: 'draft' | 'published' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'event', 'holiday', 'urgent', 'reminder'], default: 'general' },
    targetAudience: { type: String, enum: ['all', 'teachers', 'parents', 'staff'], default: 'all' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    publishDate: { type: Date, required: true },
    expiryDate: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ schoolId: 1, status: 1, publishDate: -1 });
announcementSchema.index({ schoolId: 1, type: 1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
