import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Unpaid Leave';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments?: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
leaveSchema.index({ employeeId: 1, startDate: -1 });
leaveSchema.index({ status: 1, appliedDate: -1 });

// Pre-validate middleware to calculate number of days
leaveSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    this.numberOfDays = diffDays;
  }
  next();
});

export const Leave = mongoose.model<ILeave>('Leave', leaveSchema);
