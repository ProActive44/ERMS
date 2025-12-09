# Employee Resource Management System (ERMS)

A comprehensive web-based enterprise application for managing employee resources, attendance, leave, and projects.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Forms**: Formik with Yup validation
- **Charts**: Recharts

## Project Structure

```
ERMS/
├── backend/          # Node.js/Express backend
├── frontend/         # React.js frontend
├── CHANGELOG.md      # Change tracker and history
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secrets
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your API URL
npm start
```

## Features

- ✅ Employee Management
- ✅ Attendance Tracking
- ✅ Leave Management
- ✅ Project & Task Management
- ✅ Dashboard & Reports
- ✅ Role-based Access Control (Admin, HR, Employee)

## Development

See `CHANGELOG.md` for detailed change history and tracking.

## License

MIT

