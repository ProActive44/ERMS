# Employee Login Setup Guide

## Overview
The ERMS system has two main models:
- **User**: Handles authentication (login credentials, roles)
- **Employee**: Stores employee information (personal details, employment info)

To enable employees to mark their attendance, they need:
1. A User account (for login)
2. An Employee record (for personal/employment data)
3. A link between their User and Employee records

## How It Works

### 1. User Model (Authentication)
- Email & Password for login
- Role: `admin`, `hr`, or `employee`
- Username

### 2. Employee Model (HR Data)
- Personal information
- Employment details
- Department, designation, salary
- **userId field**: Links to User model

### 3. Attendance System
When an employee logs in and marks attendance:
1. System identifies logged-in user from JWT token
2. Finds employee record using `userId` field
3. Creates attendance record for that employee

## Setup Process

### Option 1: Create New Employee with User Account (Recommended)

When creating a new employee, also create their user account:

1. **Register User** (POST `/api/auth/register`):
```json
{
  "email": "john.doe@company.com",
  "username": "johndoe",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

2. **Create Employee** (POST `/api/employees`):
```json
{
  "employeeId": "EMP001",
  "userId": "<user_id_from_step_1>",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "department": "Engineering",
  "designation": "Software Developer",
  "joiningDate": "2024-01-01",
  "employmentType": "Full-Time",
  "salary": 75000,
  "status": "Active",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891"
  }
}
```

### Option 2: Link Existing Employee to User Account

If you already have employee records without user accounts:

1. **Create User Account** for the employee (see Option 1, Step 1)

2. **Update Employee Record** (PUT `/api/employees/:id`):
```json
{
  "userId": "<new_user_id>"
}
```

### Option 3: Manual Database Update (For Bulk Operations)

Use MongoDB shell or Compass to update multiple employees:

```javascript
// Link employee to user by matching emails
db.employees.updateOne(
  { email: "john.doe@company.com" },
  { $set: { userId: ObjectId("user_id_here") } }
);
```

## Employee Attendance Flow

### For Regular Employees:

1. **Login** at `/login`
2. **Navigate** to Attendance page
3. **Click "Check In Now"** button
   - System automatically finds employee record via userId
   - No need to select employee from dropdown
4. **Click "Check Out"** when leaving
   - Shows on today's attendance card

### For Admin/HR:

1. **Login** at `/login`
2. **Navigate** to Attendance page
3. **Select Employee** from dropdown (can check in for any employee)
4. **Click "Check In"** button
5. Can view all attendance records and statistics

## Important Notes

### Database Schema Changes
The Employee model now includes:
```typescript
userId?: mongoose.Types.ObjectId; // Reference to User model
```

### Backend Updates
- `checkIn` controller: Automatically finds employee by userId if no employeeId provided
- `getTodayAttendance` controller: Finds employee by userId if no employeeId parameter
- Validation: employeeId is now optional in check-in requests

### Frontend Updates
- Attendance page shows "Check In Now" button for employees
- Admin/HR see dropdown to select employee
- Today's attendance auto-loads for logged-in user

## Troubleshooting

### Employee Can't Mark Attendance
**Error**: "No employee record found for this user"

**Solution**: The user account is not linked to an employee record
1. Find the user's ID from Users collection
2. Update the employee record with that userId
3. Or create a new employee record with the userId

### Multiple Employees with Same Email
This shouldn't happen as email has a unique constraint. If it does:
1. Update emails to be unique
2. Link correct employee to user

### Testing the System

1. **Create Test User**:
```bash
POST /api/auth/register
{
  "email": "test@company.com",
  "username": "testuser",
  "password": "Test123",
  "firstName": "Test",
  "lastName": "User",
  "role": "employee"
}
```

2. **Create Test Employee**:
```bash
POST /api/employees
{
  "employeeId": "TEST001",
  "userId": "<userId from step 1>",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@company.com",
  ...other required fields
}
```

3. **Login as Test User**:
```bash
POST /api/auth/login
{
  "email": "test@company.com",
  "password": "Test123"
}
```

4. **Mark Attendance**:
```bash
POST /api/attendance/check-in
{
  // No employeeId needed - uses logged-in user's userId
}
```

## Migration Script

For existing systems with employees but no user accounts, here's a script:

```javascript
// Run in MongoDB shell
const employees = db.employees.find({ userId: { $exists: false } });

employees.forEach(async (emp) => {
  // Create user for each employee
  const user = {
    email: emp.email,
    username: emp.email.split('@')[0],
    password: "$2a$10$defaultHashedPassword", // Change this!
    firstName: emp.firstName,
    lastName: emp.lastName,
    role: "employee",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const userId = db.users.insertOne(user).insertedId;
  
  // Link employee to user
  db.employees.updateOne(
    { _id: emp._id },
    { $set: { userId: userId } }
  );
  
  print(`Linked ${emp.firstName} ${emp.lastName} to user account`);
});
```

**Important**: Before running, change the default password hash to a proper bcrypt hash.

## Security Considerations

1. **Default Passwords**: Never use default passwords in production
2. **Role Assignment**: Carefully assign roles (admin/hr/employee)
3. **Email Verification**: Consider adding email verification
4. **Password Policy**: Enforce strong password requirements
5. **Two-Factor Auth**: Consider implementing 2FA for sensitive roles

## Future Enhancements

1. Self-service employee registration portal
2. Automatic user account creation when employee is added
3. Email invitations to new employees to set up accounts
4. Biometric/QR code based attendance
5. Mobile app for attendance marking
