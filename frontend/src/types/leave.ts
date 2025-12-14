export interface Leave {
  _id: string;
  employeeId: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    designation: string;
  };
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedDate?: string;
  rejectionReason?: string;
  attachments?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveFormData {
  employeeId?: string;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveFilters {
  employeeId?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  leaveType?: 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Unpaid Leave';
  startDate?: string;
  endDate?: string;
}

export interface LeaveBalance {
  sickLeave: { total: number; used: number; available: number };
  casualLeave: { total: number; used: number; available: number };
  earnedLeave: { total: number; used: number; available: number };
  maternityLeave: { total: number; used: number; available: number };
  paternityLeave: { total: number; used: number; available: number };
  unpaidLeave: { total: number; used: number; available: number };
}

export interface LeaveStats {
  statusCount: { _id: string; count: number }[];
  typeCount: { _id: string; count: number; totalDays: number }[];
  monthlyCount: { _id: { year: number; month: number }; count: number; totalDays: number }[];
  totalCount: { total: number }[];
}
