import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'On Leave';
  workHours?: number;
  remarks?: string;
  location?: {
    checkIn?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    checkOut?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Late', 'On Leave'],
      default: 'Present',
      required: true,
      index: true,
    },
    workHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location: {
      checkIn: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
      },
      checkOut: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
      },
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

// Compound index for unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Index for date range queries
attendanceSchema.index({ date: -1 });

// Index for filtering by status
attendanceSchema.index({ status: 1 });

// Pre-save middleware to calculate work hours
attendanceSchema.pre('save', function (next) {
  if (this.checkOut && this.checkIn) {
    const diff = this.checkOut.getTime() - this.checkIn.getTime();
    this.workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

// Method to set date to start of day (for consistency)
attendanceSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('date')) {
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);
    this.date = date;
  }
  next();
});

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
