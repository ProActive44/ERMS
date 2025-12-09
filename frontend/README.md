# ERMS Frontend

React.js frontend application for Employee Resource Management System.

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React.js 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI (to be installed)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios
- **Charts**: Recharts

## Project Structure

```
frontend/
├── public/            # Static files
├── src/
│   ├── api/          # API client and services
│   ├── components/   # Reusable components
│   ├── config/       # Configuration files
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── store/         # Redux store
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point (Vite)
├── index.html         # HTML entry point (Vite)
├── vite.config.ts     # Vite configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `env.example.txt` to `.env`:

```bash
cp env.example.txt .env
```

Update `VITE_API_URL` to match your backend API URL.

**Note**: Vite uses `VITE_` prefix for environment variables instead of `REACT_APP_`

### 3. Install ShadCN UI (Optional but Recommended)

```bash
npx shadcn-ui@latest init
```

Then add components as needed:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

### 4. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (Vite default port)

Vite provides:
- ⚡ Fast HMR (Hot Module Replacement)
- 🚀 Lightning fast builds
- 📦 Optimized production builds

### 5. Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## Development

- **Hot Reload**: Enabled by default
- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: Configured and ready to use

## Styling

Tailwind CSS is configured. Use utility classes for styling:

```tsx
<div className="flex items-center justify-center bg-gray-100 p-4">
  <h1 className="text-2xl font-bold text-gray-800">Hello ERMS</h1>
</div>
```

## Next Steps

1. Setup Redux store in `src/store/`
2. Create API client in `src/api/`
3. Create authentication pages
4. Create employee management pages
5. Add routing configuration
6. Install and configure ShadCN UI components

