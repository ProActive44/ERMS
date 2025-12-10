# ERMS API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Register User

Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee",
  "employeeId": "507f1f77bcf86cd799439011"
}
```

**Request Parameters:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| email | string | Yes | User email address | Valid email format |
| username | string | Yes | Unique username | 3-30 characters, alphanumeric only |
| password | string | Yes | User password | Minimum 6 characters |
| firstName | string | Yes | User's first name | 1-50 characters |
| lastName | string | Yes | User's last name | 1-50 characters |
| role | string | No | User role | `admin`, `hr`, or `employee` (default: `employee`) |
| employeeId | string | No | Employee ID to link user to employee | Must be valid Employee ID, employee must exist and not be linked to another user |

**Success Response (201 Created):**
```json
{
  "status": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee",
      "employee": "507f1f77bcf86cd799439011"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** If `employeeId` is provided, the user will be linked to that employee. The `employee` field in the response will contain the employee ID if linked, or `null` if not linked.

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": 400,
  "success": false,
  "message": "Validation error",
  "error": [
    "email: Please provide a valid email address",
    "password: Password must be at least 6 characters long"
  ]
}
```

**400 Bad Request - User Already Exists:**
```json
{
  "status": 400,
  "success": false,
  "message": "Email already registered"
}
```

**400 Bad Request - Employee Not Found:**
```json
{
  "status": 400,
  "success": false,
  "message": "Employee not found"
}
```

**400 Bad Request - Employee Already Linked:**
```json
{
  "status": 400,
  "success": false,
  "message": "Employee already has a user account"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "success": false,
  "message": "Error registering user"
}
```

**Hoppscotch Example:**
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

---

### 2. Login User

Authenticate user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Parameters:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| email | string | Yes | User email address | Valid email format |
| password | string | Yes | User password | Required |

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": 400,
  "success": false,
  "message": "Validation error",
  "error": [
    "email: Please provide a valid email address",
    "password: Password is required"
  ]
}
```

**401 Unauthorized - Invalid Credentials:**
```json
{
  "status": 401,
  "success": false,
  "message": "Invalid email or password"
}
```

**401 Unauthorized - Account Deactivated:**
```json
{
  "status": 401,
  "success": false,
  "message": "Account is deactivated"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "success": false,
  "message": "Error logging in"
}
```

**Hoppscotch Example:**
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepass123"
}
```

---

### 3. Get User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "employee": {
      "_id": "507f1f77bcf86cd799439012",
      "employeeId": "EMP001",
      "designation": "Software Engineer",
      "department": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Engineering",
        "description": "Software Development"
      },
      "address": "123 Main St",
      "documents": []
    },
    "isActive": true,
    "createdAt": "2024-12-19T10:00:00.000Z",
    "updatedAt": "2024-12-19T10:00:00.000Z"
  }
}
```

**Note:** The `employee` field will be populated if the user is linked to an employee record. If not linked, `employee` will be `null`.

**Error Responses:**

**401 Unauthorized - Missing Token:**
```json
{
  "status": 401,
  "success": false,
  "message": "Access token is required"
}
```

**401 Unauthorized - Invalid/Expired Token:**
```json
{
  "status": 401,
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "status": 404,
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "success": false,
  "message": "Error retrieving profile"
}
```

**Hoppscotch Example:**
```
GET http://localhost:8000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Common Response Format

All API responses follow this structure:

```typescript
{
  status: number;        // HTTP status code
  success: boolean;      // Operation success status
  message: string;       // Human-readable message
  data?: any;           // Response data (if successful)
  error?: string | string[]; // Error details (if failed)
}
```

---

## Error Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation errors) |
| 401 | Unauthorized (Authentication required or failed) |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (Rate limit exceeded) |
| 500 | Internal Server Error |

---

## JWT Token Information

### Access Token
- **Expiration:** 1 day (configurable via `JWT_EXPIRES_IN`)
- **Usage:** Include in `Authorization: Bearer <token>` header for protected routes
- **Payload:** Contains `userId`, `email`, `username`, `role`

### Refresh Token
- **Expiration:** 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Usage:** For token refresh (to be implemented)
- **Payload:** Same as access token

---

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `hr` | Human Resources access |
| `employee` | Basic employee access (default) |

---

## Testing with Hoppscotch

### Quick Setup

1. **Import Collection:**
   - Open [Hoppscotch](https://hoppscotch.io)
   - Click "Import" and select `POSTMAN_COLLECTION.json` from the backend folder
   - The collection will be imported with all endpoints pre-configured

2. **Set Environment Variables:**
   - Create a new environment in Hoppscotch
   - Add variable: `baseUrl` = `http://localhost:8000/api`
   - Add variable: `accessToken` = (will be set after login)

3. **Register User:**
   - Select `POST /api/auth/register` from the collection
   - Update the request body with your test data
   - Click "Send"

4. **Login:**
   - Select `POST /api/auth/login` from the collection
   - Update the request body with your credentials
   - Click "Send"
   - **Copy the `accessToken` from the response and save it to your environment variable**

5. **Get Profile:**
   - Select `GET /api/auth/profile` from the collection
   - In the Headers section, add: `Authorization: Bearer {{accessToken}}`
   - Click "Send"

### Environment Variables (Hoppscotch)

Create a Hoppscotch environment with:
- `baseUrl`: `http://localhost:8000/api`
- `accessToken`: (manually set after login, or use the response handler)

### Using the Collection

The imported collection includes:
- All authentication endpoints
- All employee management endpoints
- Pre-configured request bodies
- Environment variable placeholders

**Note:** Hoppscotch can import Postman collections directly, so the `POSTMAN_COLLECTION.json` file works perfectly with Hoppscotch.

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 requests per window
- **Response (429):**
```json
{
  "status": 429,
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

---

## Employee Management Endpoints

### 1. Get Employee List

Get a paginated list of employees with optional filters.

**Endpoint:** `GET /api/employees`

**Authentication:** Required (Bearer Token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| search | string | No | Search in name, email, employeeId, mobileNumber |
| department | string | No | Filter by department ID |
| isActive | boolean | No | Filter by active status (true/false) |
| designation | string | No | Filter by designation |

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "mobileNumber": "+1234567890",
        "designation": "Software Engineer",
        "department": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "IT",
          "description": "Information Technology"
        },
        "address": "123 Main St",
        "documents": [],
        "isActive": true,
        "createdAt": "2024-12-19T10:00:00.000Z",
        "updatedAt": "2024-12-19T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

**Hoppscotch Example:**
```
GET http://localhost:8000/api/employees?page=1&limit=10&search=john
Authorization: Bearer {{accessToken}}
```

---

### 2. Get Employee by ID

Get a single employee's details by ID.

**Endpoint:** `GET /api/employees/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` - Employee MongoDB ID

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+1234567890",
    "designation": "Software Engineer",
    "department": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "IT",
      "description": "Information Technology"
    },
    "address": "123 Main St",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "role": "employee"
    },
    "documents": [],
    "isActive": true,
    "createdAt": "2024-12-19T10:00:00.000Z",
    "updatedAt": "2024-12-19T10:00:00.000Z"
  }
}
```

**Note:** The `user` field will be populated if the employee is linked to a user account. If not linked, `user` will be `null`.
```

**Error Response (404 Not Found):**
```json
{
  "status": 404,
  "success": false,
  "message": "Employee not found"
}
```

**Hoppscotch Example:**
```
GET http://localhost:8000/api/employees/507f1f77bcf86cd799439011
Authorization: Bearer {{accessToken}}
```

---

### 3. Create Employee

Create a new employee record.

**Endpoint:** `POST /api/employees`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin or HR only

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+1234567890",
  "designation": "Software Engineer",
  "department": "507f1f77bcf86cd799439012",
  "address": "123 Main St",
  "documents": [
    {
      "type": "id_proof",
      "url": "https://example.com/docs/id.pdf"
    }
  ],
  "isActive": true,
  "userId": "507f1f77bcf86cd799439014"
}
```

**Request Parameters:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| employeeId | string | Yes | Unique employee identifier | Required, unique |
| firstName | string | Yes | Employee's first name | 1-50 characters |
| lastName | string | Yes | Employee's last name | 1-50 characters |
| email | string | Yes | Employee email | Valid email, unique |
| mobileNumber | string | Yes | Mobile phone number | 10-15 digits, unique |
| designation | string | Yes | Job designation | Required |
| department | string | Yes | Department MongoDB ID | Must exist |
| address | string | No | Employee address | Max 500 characters |
| documents | array | No | Employee documents | Array of document objects |
| isActive | boolean | No | Active status | Default: true |
| userId | string | No | User ID to link employee to user account | Must be valid User ID, user must exist and not be linked to another employee |

**Success Response (201 Created):**
```json
{
  "status": 201,
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+1234567890",
    "designation": "Software Engineer",
    "department": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "IT",
      "description": "Information Technology"
    },
    "address": "123 Main St",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "role": "employee"
    },
    "documents": [],
    "isActive": true,
    "createdAt": "2024-12-19T10:00:00.000Z",
    "updatedAt": "2024-12-19T10:00:00.000Z"
  }
}
```

**Note:** The `user` field will be populated if the employee is linked to a user account. If not linked, `user` will be `null`.
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "status": 400,
  "success": false,
  "message": "Validation error",
  "error": [
    "email: Please provide a valid email address",
    "mobileNumber: Mobile number must be at least 10 digits"
  ]
}
```

**400 Bad Request - Duplicate Entry:**
```json
{
  "status": 400,
  "success": false,
  "message": "Email already registered"
}
```

**400 Bad Request - Department Not Found:**
```json
{
  "status": 400,
  "success": false,
  "message": "Department not found"
}
```

**403 Forbidden:**
```json
{
  "status": 403,
  "success": false,
  "message": "Insufficient permissions"
}
```

**Hoppscotch Example:**
```
POST http://localhost:8000/api/employees
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "+1234567890",
  "designation": "Software Engineer",
  "department": "507f1f77bcf86cd799439012",
  "address": "123 Main St"
}
```

---

### 4. Update Employee

Update an existing employee record.

**Endpoint:** `PUT /api/employees/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin or HR only

**URL Parameters:**
- `id` - Employee MongoDB ID

**Request Body:** (All fields optional)
```json
{
  "firstName": "Jane",
  "designation": "Senior Software Engineer",
  "address": "456 Oak Ave",
  "userId": "507f1f77bcf86cd799439014"
}
```

**Note:** To link an employee to a user, provide `userId`. To unlink, set `userId` to `null`. The user must exist and not be linked to another employee.

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employeeId": "EMP001",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+1234567890",
    "designation": "Senior Software Engineer",
    "department": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "IT"
    },
    "address": "456 Oak Ave",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "role": "employee"
    },
    "isActive": true,
    "updatedAt": "2024-12-19T11:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - User Not Found:**
```json
{
  "status": 400,
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request - User Already Linked:**
```json
{
  "status": 400,
  "success": false,
  "message": "User is already linked to another employee"
}
```

**400 Bad Request - Employee Already Linked:**
```json
{
  "status": 400,
  "success": false,
  "message": "Employee is already linked to another user"
}
```

**404 Not Found:**
```json
{
  "status": 404,
  "success": false,
  "message": "Employee not found"
}
```

**400 Bad Request - Duplicate Entry:**
```json
{
  "status": 400,
  "success": false,
  "message": "Email already registered"
}
```

**Hoppscotch Example:**
```
PUT http://localhost:8000/api/employees/507f1f77bcf86cd799439011
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "firstName": "Jane",
  "designation": "Senior Software Engineer"
}
```

---

### 5. Delete Employee

Soft delete an employee (sets isActive to false).

**Endpoint:** `DELETE /api/employees/:id`

**Authentication:** Required (Bearer Token)

**Authorization:** Admin or HR only

**URL Parameters:**
- `id` - Employee MongoDB ID

**Success Response (200 OK):**
```json
{
  "status": 200,
  "success": true,
  "message": "Employee deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": 404,
  "success": false,
  "message": "Employee not found"
}
```

**Hoppscotch Example:**
```
DELETE http://localhost:8000/api/employees/507f1f77bcf86cd799439011
Authorization: Bearer {{accessToken}}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Passwords are hashed using bcrypt before storage
- User passwords are never returned in API responses
- Email and username must be unique
- Tokens should be stored securely on the client side
- Refresh token functionality will be implemented in future updates
- **Employee Management:**
  - Employee ID, email, and mobile number must be unique
  - Department must exist before creating employee
  - Soft delete is used (sets isActive to false)
  - All employee routes require authentication
  - Create/Update/Delete operations require Admin or HR role

---

## Support

For issues or questions, refer to:
- Backend README: `ERMS/backend/README.md`
- Setup Instructions: `ERMS/SETUP_INSTRUCTIONS.md`

