# Employee Credentials Management - Workaround v1.0

## Overview

This is a **temporary workaround** for managing employee login credentials. The system will be replaced with a secure activation flow in v2.0 (see `FUTURE_EMPLOYEE_ACTIVATION_FLOW.md`).

## Current Implementation

### How It Works

1. **Employee Creation**
   - Admin creates an employee record via Employee Management
   - System automatically creates a User account with:
     - Email: Employee's email
     - Username: Extracted from email (before @)
     - Password: `Employee@123` (default)
     - Role: `employee`
   - Employee and User records are linked via `userId` field

2. **Credential Management**
   - Admin can view/edit employee credentials
   - Access via: Employee Detail → "Credentials" button
   - Can update: username, email, password

3. **Employee Login**
   - Employee uses email/username + password to login
   - Default password should be changed on first login

## API Endpoints

### Get Employee Credentials
```
GET /api/employees/:id/credentials
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Employee credentials retrieved successfully",
  "data": {
    "email": "john.doe@company.com",
    "username": "johndoe",
    "role": "employee"
  }
}
```

### Create/Update Employee Credentials
```
POST /api/employees/:id/credentials
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@company.com",
  "password": "NewPassword123"
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Credentials created successfully",
  "data": {
    "username": "johndoe",
    "email": "john.doe@company.com",
    "role": "employee"
  }
}
```

## Frontend Usage

### Navigate to Credentials Page

From Employee Detail page:
```typescript
navigate(`/employees/${employeeId}/credentials`)
```

### Component Structure

```
frontend/src/pages/Employees/
├── EmployeeCredentials.tsx    # New credentials management page
├── EmployeeDetail.tsx          # Updated with credentials button
└── EmployeeList.tsx            # Existing list page
```

## Backend Updates

### Models

**Employee Model** (`backend/src/models/Employee.ts`):
```typescript
{
  // ... existing fields
  userId?: mongoose.Types.ObjectId;  // Link to User model
}
```

**User Model** (`backend/src/models/User.ts`):
```typescript
{
  email: string;
  username: string;
  password: string;  // Hashed by pre-save hook
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'employee';
}
```

### Controllers

**employeeController.ts**:
- `createEmployee` - Auto-creates User account
- `manageEmployeeCredentials` - Create/update credentials
- `getEmployeeCredentials` - Fetch credentials (no password)

### Routes

**employeeRoutes.ts**:
```typescript
// Get credentials (Admin/HR only)
GET /api/employees/:id/credentials

// Create/Update credentials (Admin/HR only)
POST /api/employees/:id/credentials
```

## Security Considerations

### Current Limitations ⚠️

1. **Admin sees passwords**: Admin can set/view passwords (not ideal)
2. **No email verification**: No confirmation that email is valid
3. **Default password**: Weak default password `Employee@123`
4. **Manual distribution**: Admin must manually share credentials
5. **No audit trail**: Limited tracking of credential changes

### Best Practices (For Now)

1. **Change Default Password**: Employees should change password immediately
2. **Secure Sharing**: Share credentials via secure channels (not email)
3. **Regular Updates**: Periodically update passwords
4. **Role-Based Access**: Only Admin/HR can manage credentials
5. **Audit Logs**: Monitor credential access/changes

## Migration Path to v2.0

### Phase 1: Current State ✅
- Admin manages all credentials
- Direct User account creation
- Manual credential sharing

### Phase 2: Hybrid Approach (Next Sprint)
- Keep current system for existing employees
- Add activation flow for new employees
- Parallel systems running

### Phase 3: Full Migration (Future)
- Deprecate admin credential management
- All employees use activation flow
- Implement password reset
- Add 2FA support

## Testing

### Test Employee Credential Creation

1. **Create Employee**:
```bash
POST /api/employees
{
  "employeeId": "TEST001",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@company.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "department": "IT",
  "designation": "Developer",
  "joiningDate": "2024-01-01",
  "employmentType": "Full-Time",
  "salary": 70000,
  "status": "Active",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567891"
  }
}
```

2. **Verify User Created**:
```bash
GET /api/employees/<employee_id>/credentials
```

3. **Test Login**:
```bash
POST /api/auth/login
{
  "email": "test@company.com",
  "password": "Employee@123"
}
```

4. **Update Credentials**:
```bash
POST /api/employees/<employee_id>/credentials
{
  "username": "testuser",
  "password": "NewPassword123"
}
```

5. **Test Login with New Password**:
```bash
POST /api/auth/login
{
  "email": "test@company.com",
  "password": "NewPassword123"
}
```

## Troubleshooting

### Employee can't login

**Problem**: "Invalid credentials" error

**Solutions**:
1. Check if User account exists:
   ```bash
   GET /api/employees/:id/credentials
   ```
2. Verify userId is linked to employee
3. Reset password via credentials page
4. Check role is set to 'employee'

### User account creation failed

**Problem**: Error during employee creation

**Solutions**:
1. Check if email already has a User account
2. Manually create User account:
   ```bash
   POST /api/auth/register
   ```
3. Link User to Employee:
   ```bash
   POST /api/employees/:id/credentials
   {
     "email": "existing@email.com"
   }
   ```

### Can't update credentials

**Problem**: "User account not found"

**Solutions**:
1. Check employee has userId field set
2. Create credentials first:
   ```bash
   POST /api/employees/:id/credentials
   ```

## Code Comments

Look for these comments in the code to understand workaround locations:

```typescript
// WORKAROUND: <explanation>
// NOTE: This is a temporary solution. Will be replaced by activation flow in v2.0
```

Found in:
- `backend/src/controllers/employeeController.ts`
- `backend/src/routes/employeeRoutes.ts`
- `frontend/src/pages/Employees/EmployeeCredentials.tsx`

## Future Improvements (v2.0)

See `FUTURE_EMPLOYEE_ACTIVATION_FLOW.md` for detailed plans:

1. ✨ **Activation Tokens**: Secure, time-limited tokens
2. 📧 **Email Invitations**: Automated email system
3. 🔐 **Self-Service**: Employees set own passwords
4. ✅ **Email Verification**: Confirm email validity
5. 🔄 **Password Reset**: Self-service password reset
6. 📊 **Audit Trail**: Complete activity logging
7. 🔒 **2FA**: Two-factor authentication
8. 🎯 **Better UX**: Improved user experience

## Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Review `EMPLOYEE_LOGIN_SETUP.md`
3. See `FUTURE_EMPLOYEE_ACTIVATION_FLOW.md` for roadmap
4. Contact development team

---

**Remember**: This is a temporary workaround. The proper activation flow is planned for v2.0!
