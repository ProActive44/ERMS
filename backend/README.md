# ERMS Backend

Node.js/Express backend API for Employee Resource Management System.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # API controllers
│   ├── middleware/      # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── validation/     # Joi validation schemas
│   └── server.ts       # Express server entry point
├── uploads/            # File uploads directory
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env.example        # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `PORT`: Server port (default: 8000)

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:8000`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### API Base URL
All API endpoints will be prefixed with `/api`

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

**For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

**For Postman collection, import [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)**

## Development

- **Hot Reload**: Enabled with `ts-node-dev`
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint (configure as needed)

## Database

MongoDB connection is configured in `src/config/database.ts`. Make sure MongoDB is running before starting the server.

For local MongoDB:
```bash
mongod
```

For MongoDB Atlas, use the connection string in `.env`.

## Next Steps

1. Create Mongoose models in `src/models/`
2. Create controllers in `src/controllers/`
3. Create routes in `src/routes/`
4. Implement authentication middleware
5. Add validation schemas

