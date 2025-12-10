import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: mongoose.Types.ObjectId;
  address?: string;
  user?: mongoose.Types.ObjectId; // Optional - employee might not have user account
  documents: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Optional - employee might not have system access
      index: true,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['id_proof', 'offer_letter', 'resume', 'other'],
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ user: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

