# ERMS Project Setup Instructions

Complete setup guide for the Employee Resource Management System.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **MongoDB** installed locally OR MongoDB Atlas account
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## Quick Start

### 1. Navigate to Project Directory

```bash
cd ERMS
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
# Copy .env.example content and create .env file
# Update MongoDB URI and JWT secrets

# Start development server
npm run dev
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
# Copy .env.example content and create .env file
# Update REACT_APP_API_URL if needed

# Start development server
npm start
```

Frontend will run on `http://localhost:5173` (Vite default port)

## Detailed Setup

### Backend Configuration

1. **Environment Variables**

Create `backend/.env` file:

```env
PORT=8000
NODE_ENV=development

# MongoDB - Local
MONGODB_URI=mongodb://localhost:27017/erms

# MongoDB - Atlas (Alternative)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erms

# JWT Secrets (Change these!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173
```

2. **MongoDB Setup**

**Option A: Local MongoDB**
```bash
# Install MongoDB (if not installed)
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

3. **Verify Backend**

```bash
cd backend
npm run dev
```

Visit `http://localhost:8000/health` - should return:
```json
{
  "status": 200,
  "success": true,
  "message": "ERMS Server is running"
}
```

### Frontend Configuration

1. **Environment Variables**

Create `frontend/.env` file:

```env
# Note: Vite uses VITE_ prefix instead of REACT_APP_
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=ERMS
VITE_APP_VERSION=1.0.0
```

2. **Install ShadCN UI (Recommended)**

```bash
cd frontend
npx shadcn-ui@latest init
```

Follow the prompts. Then install common components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
```

3. **Verify Frontend**

```bash
cd frontend
npm run dev
```

Browser should open to `http://localhost:5173` showing ERMS welcome page (Vite default port).

**Note**: Frontend uses Vite instead of Create React App for faster development and builds.

## Project Structure Overview

```
ERMS/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── server.ts        # Server entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React.js frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   └── App.tsx         # Main app
│   ├── package.json
│   └── tailwind.config.js
│
├── CHANGELOG.md            # Change tracker
├── README.md               # Project overview
└── SETUP_INSTRUCTIONS.md  # This file
```

## Next Steps

1. **Review Documentation**
   - Read `README.md` for project overview
   - Check `CHANGELOG.md` for change tracking
   - See `TRACKER_GUIDE.md` for how to use changelog

2. **Start Development**
   - Create MongoDB models (see `ERMS_STARTER_TEMPLATE.md`)
   - Build API endpoints
   - Create frontend pages
   - Update changelog as you work

3. **Development Workflow**
   - Make changes
   - Test locally
   - Update `CHANGELOG.md`
   - Commit changes (if using Git)

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- Check MongoDB logs

**Port Already in Use**
- Change `PORT` in `.env`
- Or kill process using port 8000

**TypeScript Errors**
- Run `npm install` again
- Check `tsconfig.json` is correct

### Frontend Issues

**API Connection Error**
- Verify backend is running
- Check `VITE_API_URL` in `.env` (note: Vite uses `VITE_` prefix)
- Check CORS settings in backend

**Tailwind Not Working**
- Verify `tailwind.config.js` exists
- Check `postcss.config.js` exists
- Restart dev server

**ShadCN UI Not Styling**
- Run `npx shadcn-ui@latest init` again
- Check `tailwind.config.js` content paths

## Development Commands

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Useful Resources

- **MongoDB Docs**: https://mongoosejs.com/docs/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **ShadCN UI**: https://ui.shadcn.com/
- **Redux Toolkit**: https://redux-toolkit.js.org/

## Support

For issues or questions:
1. Check the documentation files
2. Review `CHANGELOG.md` for recent changes
3. Check error messages carefully
4. Verify all environment variables are set

---

**Happy Coding! 🚀**

