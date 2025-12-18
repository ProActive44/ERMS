# Employee Resource Management System (ERMS)

The Employee Resource Management System (ERMS) is a web-based enterprise application developed to manage employee resources, attendance, leave, and project assignments within an organization. The system provides role-based access for administrators and employees and helps automate core HR operations.

This project was developed as part of the **Master of Computer Applications (MCA)** program at **Uttaranchal University**.

---

## Tech Stack

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (MongoDB Atlas)
- Authentication: JWT (Access & Refresh Tokens)
- Security: bcryptjs for password hashing

### Frontend
- Framework: React.js
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- State Management: Redux Toolkit
- Routing: React Router
- Charts & Analytics: Recharts

---

## Project Structure
ERMS/
├── backend/ # Node.js / Express backend
├── frontend/ # React.js frontend
├── CHANGELOG.md # Development change log
└── README.md # Project documentation

---

## Features

- Employee Management (CRUD)
- Attendance Tracking
- Leave Management
- Project & Task Management
- Dashboard & Reports
- Role-Based Access Control (Admin, Employee)

---

## Deployment

The ERMS application is deployed as a cloud-based web application for academic evaluation and demonstration purposes.

- **Frontend URL:** https://erms-nu.vercel.app  
- **Backend URL:** https://erms-enwm.onrender.com  

The application is hosted on **free-tier cloud services**. As a result, the backend server may take **1–2 minutes to start** on the first request after inactivity (cold start).

---

## Demo Login Credentials

The following credentials are provided **strictly for academic evaluation and demonstration purposes**:

### Admin User
- Email: admin@gmail.com  
- Password: admin@123  

### Employee User
- Email: manny@gmail.com  
- Password: Employee@123  

> Note: Please allow the backend server time to start if the application appears unresponsive initially.

---

## Local Setup (Optional)

### Prerequisites
- Node.js (v18 or above)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure API base URL
npm start
```


## Academic Note
This project is submitted in partial fulfillment of the requirements for the Master of Computer Applications (MCA) degree at Uttaranchal University.
The project is intended solely for academic evaluation.