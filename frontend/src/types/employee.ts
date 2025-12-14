export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface EmployeeDocument {
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: Address;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  salary: number;
  managerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation?: string;
  };
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  emergencyContact: EmergencyContact;
  documents?: EmployeeDocument[];
  createdBy?: {
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

export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: Address;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  salary: number;
  managerId?: string;
  status?: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  emergencyContact: EmergencyContact;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeStats {
  statusCount: { _id: string; count: number }[];
  departmentCount: { _id: string; count: number }[];
  employmentTypeCount: { _id: string; count: number }[];
  totalCount: { total: number }[];
}
