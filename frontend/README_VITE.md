# Vite React Setup

This frontend uses **Vite** instead of Create React App for faster development and builds.

## Why Vite?

- ⚡ **Faster Development**: Instant server start and HMR (Hot Module Replacement)
- 🚀 **Faster Builds**: Optimized production builds using Rollup
- 📦 **Smaller Bundle**: Better tree-shaking and code splitting
- 🔧 **Better DX**: Simpler configuration, TypeScript support out of the box

## Key Differences from Create React App

### 1. Entry Point
- **CRA**: `src/index.tsx`
- **Vite**: `src/main.tsx` (and `index.html` in root)

### 2. Environment Variables
- **CRA**: `REACT_APP_*`
- **Vite**: `VITE_*`

### 3. Accessing Environment Variables
- **CRA**: `process.env.REACT_APP_API_URL`
- **Vite**: `import.meta.env.VITE_API_URL`

### 4. Scripts
- **CRA**: `npm start`
- **Vite**: `npm run dev`

### 5. Build Output
- **CRA**: `build/` directory
- **Vite**: `dist/` directory

## Configuration

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Path Aliases

You can use `@/` to import from `src/`:

```typescript
import { config } from '@/config/env';
import Button from '@/components/Button';
```

## Development

```bash
npm run dev
```

Starts the Vite dev server with:
- Hot Module Replacement (HMR)
- Fast refresh
- Automatic browser opening

## Building

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deploying.

## More Information

- [Vite Documentation](https://vitejs.dev/)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react)

