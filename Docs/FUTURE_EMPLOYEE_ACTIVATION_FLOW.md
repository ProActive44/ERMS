# Future Employee Activation Flow (v2.0)

## Overview
This document describes the planned employee activation system that will replace the current admin-managed credential system.

## Current System (Workaround - v1.0)
- Admin creates Employee record
- Admin creates User account with credentials
- Admin can see/edit employee passwords (NOT IDEAL)
- Employees receive credentials from admin

## Future System (Target - v2.0)

### 1. Employee Management (Admin Only)

**Admin creates Employee with:**
```typescript
{
  employeeId: string;
  firstName: string;
  lastName: string;
  officialEmail: string;  // unique
  phone: string;
  department: string;
  designation: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
  // ... other employee fields
  // NO password field
  // NO User credentials
}
```

**Important:**
- Creating employee does NOT create login credentials
- Admin never knows or sets employee passwords
- Employee status starts as `PENDING_ACTIVATION`

### 2. Activation Token System

**New Model: ActivationToken**
```typescript
{
  token: string;           // UUID or secure random string
  employeeId: ObjectId;    // Reference to Employee
  email: string;           // Employee's official email
  expiresAt: Date;         // 7 days from creation
  used: boolean;           // false by default
  createdAt: Date;
}
```

**Token Generation:**
- Generate secure random token (crypto.randomBytes)
- Store hashed version in database
- Set expiration (7 days)
- Send activation email

### 3. Email Invitation System

**Email Template:**
```
Subject: Welcome to [Company] - Activate Your Account

Hi [FirstName],

Your employee account has been created. Please activate your account to access the system:

Activation Link: https://erms.company.com/activate?token=xxxxx

This link expires in 7 days.

After activation, you can:
- Set your password
- Mark attendance
- View your profile
- Access payroll information

If you didn't expect this email, please contact HR.

Best regards,
HR Team
```

**Technology Stack:**
- NodeMailer / SendGrid / AWS SES
- Email templates (Handlebars/EJS)
- Queue system (Bull/Redis) for reliable delivery

### 4. Activation Page Flow

**Route:** `/activate?token=xxxxx`

**Steps:**
1. Validate token (not expired, not used)
2. Show activation form:
   - Display: Employee name, email (read-only)
   - Input: Password (with strength meter)
   - Input: Confirm Password
   - Checkbox: Terms & Conditions
   - Button: Activate Account

3. On submit:
   - Validate password strength
   - Hash password (bcrypt)
   - Create User account
   - Link Employee.userId to User._id
   - Update Employee.status to ACTIVE
   - Mark token as used
   - Auto-login user
   - Redirect to dashboard

### 5. Backend Implementation

**New Routes:**
```typescript
POST /api/auth/send-activation        // Admin only - send/resend activation email
POST /api/auth/activate/:token        // Public - activate account
GET  /api/auth/validate-token/:token  // Public - check if token is valid
```

**New Controllers:**
```typescript
// authController.ts

export const sendActivation = async (req, res) => {
  // 1. Find employee by ID
  // 2. Check if already activated (has userId)
  // 3. Invalidate old tokens
  // 4. Generate new activation token
  // 5. Send email
  // 6. Return success
};

export const validateToken = async (req, res) => {
  // 1. Find token
  // 2. Check expiration
  // 3. Check if used
  // 4. Return employee info (name, email)
};

export const activateAccount = async (req, res) => {
  // 1. Validate token
  // 2. Validate password
  // 3. Create User account
  // 4. Hash password
  // 5. Link Employee.userId
  // 6. Update Employee.status = ACTIVE
  // 7. Mark token as used
  // 8. Generate JWT tokens
  // 9. Return success with tokens
};
```

### 6. Security Considerations

**Token Security:**
- Use crypto.randomBytes(32) for token generation
- Store hashed tokens (SHA-256)
- Set reasonable expiration (7 days)
- One-time use only
- Rate limit activation attempts

**Password Security:**
- Minimum 8 characters
- Require: uppercase, lowercase, number, special char
- Use bcrypt with salt rounds >= 10
- Never log or store plain text passwords
- Implement password reset flow

**Email Security:**
- Use HTTPS for activation links
- Verify email domain
- Implement SPF/DKIM/DMARC
- Log all activation attempts

### 7. Database Schema Changes

**Employee Model Changes:**
```typescript
// Add enum for status
status: {
  type: String,
  enum: ['PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE', 'TERMINATED'],
  default: 'PENDING_ACTIVATION'
}

// Keep userId as optional
userId?: mongoose.Types.ObjectId;
```

**New ActivationToken Model:**
```typescript
const activationTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: Date
}, { timestamps: true });

// Auto-delete expired tokens
activationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 8. Frontend Implementation

**New Pages:**
- `/activate` - Activation page with password setup
- `/activation-success` - Success confirmation page
- `/activation-expired` - Token expired page

**Employee Management Updates:**
- Add "Send Activation" button for PENDING_ACTIVATION employees
- Show activation status badge
- Add "Resend Activation" option
- Display activation sent date/time

**Activation Page Component:**
```tsx
const ActivationPage = () => {
  const [token] = useSearchParams();
  const [employee, setEmployee] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    // Validate token and fetch employee info
  }, [token]);
  
  const handleActivate = async () => {
    // Submit activation with password
    // Auto-login on success
    // Redirect to dashboard
  };
  
  return (
    // Activation form UI
  );
};
```

### 9. Migration Strategy

**Phase 1: Current Workaround (NOW)**
- Admin creates Employee
- Admin creates User manually
- Admin manages credentials
- Direct userId linking

**Phase 2: Parallel System (TRANSITION)**
- Keep current system working
- Implement activation system
- New employees use activation flow
- Existing employees keep current access
- Gradually migrate old employees

**Phase 3: Full Migration (FUTURE)**
- Disable admin credential management
- All employees must use activation
- Implement password reset flow
- Add 2FA support

### 10. Additional Features for v2.0

**Password Reset Flow:**
- Forgot password link
- Email verification
- Secure reset token
- New password setup

**Email Notifications:**
- Welcome email on activation
- Password change confirmation
- Login from new device alerts
- Attendance reminders

**Admin Dashboard:**
- Track activation rates
- View pending activations
- Resend activation emails
- Deactivate accounts

**Audit Log:**
- Track activation attempts
- Log password changes
- Monitor failed logins
- Security event tracking

### 11. Testing Checklist

**Unit Tests:**
- [ ] Token generation
- [ ] Token validation
- [ ] Password hashing
- [ ] Email sending
- [ ] Account creation

**Integration Tests:**
- [ ] Complete activation flow
- [ ] Token expiration
- [ ] Duplicate activation prevention
- [ ] Email delivery
- [ ] User login after activation

**Security Tests:**
- [ ] Token brute force protection
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting

### 12. Environment Variables

```env
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=xxxxx
SMTP_FROM=HR Team <noreply@company.com>

# Activation
ACTIVATION_TOKEN_EXPIRY=7d
ACTIVATION_URL=https://erms.company.com/activate

# Security
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_UPPERCASE=true
```

### 13. Code Structure

```
backend/
├── src/
│   ├── models/
│   │   └── ActivationToken.ts
│   ├── controllers/
│   │   └── activationController.ts
│   ├── services/
│   │   ├── emailService.ts
│   │   └── tokenService.ts
│   ├── utils/
│   │   ├── passwordValidator.ts
│   │   └── tokenGenerator.ts
│   └── templates/
│       └── activation-email.html

frontend/
├── src/
│   ├── pages/
│   │   ├── Activation.tsx
│   │   ├── ActivationSuccess.tsx
│   │   └── ActivationExpired.tsx
│   ├── components/
│   │   └── PasswordStrengthMeter.tsx
│   └── api/
│       └── activationApi.ts
```

### 14. Timeline

- **Week 1-2**: Backend activation system
- **Week 3**: Email service integration
- **Week 4**: Frontend activation pages
- **Week 5**: Testing & bug fixes
- **Week 6**: Deployment & migration

---

## Notes

This is a **future enhancement**. The current system uses admin-managed credentials as a temporary workaround. This document serves as a roadmap for implementing a more secure, user-friendly activation system.

**Benefits of Future System:**
- ✅ Better security (admin never sees passwords)
- ✅ Better UX (employees set their own passwords)
- ✅ Audit trail (track activations)
- ✅ Email verification
- ✅ Scalable for large organizations

**Current Workaround Limitations:**
- ❌ Admin can see/edit passwords
- ❌ No email verification
- ❌ Manual credential distribution
- ❌ Security concerns with shared secrets
