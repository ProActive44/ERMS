export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Attendance {
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
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'On Leave';
  workHours?: number;
  remarks?: string;
  location?: {
    checkIn?: AttendanceLocation;
    checkOut?: AttendanceLocation;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckInData {
  employeeId: string;
  checkIn?: string;
  remarks?: string;
  location?: AttendanceLocation;
}

export interface CheckOutData {
  checkOut?: string;
  remarks?: string;
  location?: AttendanceLocation;
}

export interface AttendanceFormData {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'On Leave';
  remarks?: string;
}

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'On Leave';
}

export interface AttendanceStats {
  _id: string;
  count: number;
  avgWorkHours: number;
}
