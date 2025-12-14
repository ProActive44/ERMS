import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  client?: string;
  projectManager: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  tags?: string[];
  progress: number; // 0-100
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    budget: {
      type: Number,
      min: 0,
    },
    client: {
      type: String,
      trim: true,
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ projectManager: 1, status: 1 });
projectSchema.index({ teamMembers: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
