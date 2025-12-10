# Employee Management Guide

## Overview

Employee Management module provides full CRUD operations for managing employees in the ERMS system.

## Prerequisites

Before creating employees, you need to:

1. **Create Departments** - Employees must be assigned to a department
   - You can create departments directly in MongoDB or via API (to be implemented)
   - Department must exist before creating an employee

## API Endpoints

### Base URL
```
http://localhost:8000/api/employees
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/employees` | List employees (with pagination & filters) | Yes | Any |
| GET | `/api/employees/:id` | Get employee by ID | Yes | Any |
| POST | `/api/employees` | Create new employee | Yes | Admin/HR |
| PUT | `/api/employees/:id` | Update employee | Yes | Admin/HR |
| DELETE | `/api/employees/:id` | Delete employee (soft delete) | Yes | Admin/HR |

## Quick Start

### 1. Create a Department (Manual - MongoDB)

First, create a department in MongoDB:

```javascript
// In MongoDB shell or Compass
db.departments.insertOne({
  name: "IT",
  description: "Information Technology",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Save the `_id` from the response - you'll need it for creating employees.

### 2. Create an Employee

```bash
POST http://localhost:8000/api/employees
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+1234567890",
  "designation": "Software Engineer",
  "department": "<department_id_from_step_1>",
  "address": "123 Main St"
}
```

### 3. List Employees

```bash
GET http://localhost:8000/api/employees?page=1&limit=10
Authorization: Bearer <your_token>
```

### 4. Get Employee Details

```bash
GET http://localhost:8000/api/employees/<employee_id>
Authorization: Bearer <your_token>
```

### 5. Update Employee

```bash
PUT http://localhost:8000/api/employees/<employee_id>
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "designation": "Senior Software Engineer",
  "address": "456 Oak Ave"
}
```

### 6. Delete Employee

```bash
DELETE http://localhost:8000/api/employees/<employee_id>
Authorization: Bearer <your_token>
```

## Query Parameters (List Employees)

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in firstName, lastName, email, employeeId, mobileNumber
- `department` - Filter by department ID
- `isActive` - Filter by active status (true/false)
- `designation` - Filter by designation

## Employee Fields

### Required Fields
- `employeeId` - Unique employee identifier
- `firstName` - Employee's first name
- `lastName` - Employee's last name
- `email` - Employee email (must be unique)
- `mobileNumber` - Mobile phone number (must be unique)
- `designation` - Job designation
- `department` - Department MongoDB ID

### Optional Fields
- `address` - Employee address
- `documents` - Array of document objects
  - `type` - Document type: 'id_proof', 'offer_letter', 'resume', 'other'
  - `url` - Document URL
  - `uploadedAt` - Upload timestamp
- `isActive` - Active status (default: true)

## Validation Rules

- **employeeId**: Required, must be unique
- **email**: Valid email format, must be unique
- **mobileNumber**: 10-15 digits, must be unique
- **firstName/lastName**: 1-50 characters
- **address**: Max 500 characters
- **department**: Must exist in database

## Role-Based Access

- **View (GET)**: All authenticated users
- **Create/Update/Delete**: Admin and HR only
- **Employees**: Can only view their own information (to be implemented)

## Soft Delete

Deleting an employee sets `isActive: false` instead of removing the record. This allows:
- Data retention for historical records
- Easy restoration if needed
- Audit trail maintenance

## Next Steps

1. Create Department Management API (CRUD for departments)
2. Add file upload for employee documents
3. Add employee search and advanced filtering
4. Implement employee profile image upload
5. Add employee history/audit log

## See Also

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [API Collection](./POSTMAN_COLLECTION.json) - Import into Hoppscotch (or Postman) for testing

