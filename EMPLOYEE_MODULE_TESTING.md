# Employee Management Module - Testing Guide

## Quick Test Steps

### 1. Start Both Servers

**Backend:**
```bash
cd backend
npm run dev
# Should run on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Should run on http://localhost:5173
```

### 2. Test Authentication First

1. Go to http://localhost:5173
2. Register a new user (make sure to use role: "Admin" or "HR" for full access)
3. Login with your credentials
4. Verify you reach the dashboard

### 3. Test Employee Module

#### A. Navigate to Employees
- Click "Employee Management" on dashboard
- Or go to: http://localhost:5173/employees
- Should see empty employee list

#### B. Create New Employee
1. Click "Add Employee" button (top right)
2. Fill in the form:

**Basic Information:**
- Employee ID: EMP001
- First Name: John
- Last Name: Doe
- Email: john.doe@company.com
- Phone: 1234567890
- Date of Birth: 1990-01-01
- Gender: Male

**Address:**
- Street: 123 Main St
- City: New York
- State: NY
- Zip Code: 10001
- Country: USA

**Employment Details:**
- Department: IT
- Designation: Software Engineer
- Joining Date: 2024-01-01
- Employment Type: Full-Time
- Salary: 80000
- Status: Active

**Emergency Contact:**
- Name: Jane Doe
- Relationship: Spouse
- Phone: 0987654321

3. Click "Create Employee"
4. Should see success toast notification
5. Should redirect to employee list
6. Should see the new employee in the table

#### C. View Employee Details
1. Click the eye icon on the employee row
2. Should navigate to employee detail page
3. Verify all information is displayed correctly
4. Check personal info, contact, employment details, emergency contact

#### D. Edit Employee
1. From detail page, click "Edit" button
2. Or from list page, click edit icon
3. Update some fields (e.g., change designation to "Senior Software Engineer")
4. Click "Update Employee"
5. Should see success toast
6. Verify changes on detail page

#### E. Search & Filter
1. Go back to employee list
2. Add more employees with different departments
3. Test search: Type employee name, email, or ID in search box
4. Test filters:
   - Filter by Department
   - Filter by Status
   - Filter by Employment Type
5. Test pagination (if you have more than 10 employees)

#### F. Delete Employee (Admin Only)
1. Ensure you're logged in as Admin
2. Click delete icon (trash) on an employee
3. Confirm deletion
4. Employee status should change to "Terminated" (soft delete)

### 4. Test Role-Based Access

#### As Admin:
- ✅ Can view all employees
- ✅ Can create employees
- ✅ Can edit employees
- ✅ Can delete employees

#### As HR:
- ✅ Can view all employees
- ✅ Can create employees
- ✅ Can edit employees
- ❌ Cannot delete employees (no delete button)

#### As Employee:
- ✅ Can view all employees
- ❌ Cannot create employees (no "Add Employee" button)
- ❌ Cannot edit employees (no edit button)
- ❌ Cannot delete employees (no delete button)

### 5. Test Validation

Try these invalid inputs to test validation:

1. **Duplicate Employee ID**
   - Create employee with ID: EMP001
   - Try creating another with same ID
   - Should show error: "Employee ID already exists"

2. **Duplicate Email**
   - Try creating employee with existing email
   - Should show error: "Email already exists"

3. **Invalid Email**
   - Enter invalid email format
   - Should show validation error

4. **Invalid Phone**
   - Enter less than 10 digits
   - Should show validation error

5. **Empty Required Fields**
   - Try submitting form with empty required fields
   - Should show validation errors

### 6. Test API Endpoints (Optional - Using Postman)

#### Get All Employees
```
GET http://localhost:8000/api/employees
Headers: Authorization: Bearer <your_token>
```

#### Get Employee by ID
```
GET http://localhost:8000/api/employees/:id
Headers: Authorization: Bearer <your_token>
```

#### Create Employee
```
POST http://localhost:8000/api/employees
Headers: 
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body: (see employee form data structure)
```

#### Update Employee
```
PUT http://localhost:8000/api/employees/:id
Headers: 
  Authorization: Bearer <your_token>
  Content-Type: application/json
Body: (partial employee data)
```

#### Delete Employee
```
DELETE http://localhost:8000/api/employees/:id
Headers: Authorization: Bearer <your_token>
```

#### Get Employee Stats
```
GET http://localhost:8000/api/employees/stats
Headers: Authorization: Bearer <your_token>
```

## Expected Results

### ✅ Success Indicators:
- Form validation works correctly
- Toast notifications appear for actions
- Data persists in MongoDB
- Search and filters work properly
- Pagination functions correctly
- Role-based permissions enforced
- No console errors
- Responsive design works on different screen sizes

### ❌ Common Issues & Solutions:

**Issue: "Cannot connect to MongoDB"**
- Solution: Make sure MongoDB is running
- Check .env file has correct MONGO_URI

**Issue: "Unauthorized" errors**
- Solution: Make sure you're logged in
- Check token in localStorage
- Token might be expired - login again

**Issue: "CORS errors"**
- Solution: Check backend CORS configuration
- Verify frontend is running on port 5173

**Issue: Form not submitting**
- Solution: Check browser console for validation errors
- Ensure all required fields are filled

## Next Steps After Testing

If all tests pass:
1. ✅ Employee module is working correctly
2. ✅ Ready to move to next module (Attendance, Leave, etc.)
3. ✅ Consider adding more features:
   - Export employees to CSV/Excel
   - Bulk import employees
   - Advanced search with multiple filters
   - Employee photo upload
   - Department-wise reports

## Performance Considerations

- With 100+ employees, test pagination
- Check search performance with large datasets
- Monitor API response times
- Consider adding indexes if queries are slow

---

**Happy Testing! 🎉**
