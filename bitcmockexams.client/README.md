# BITC Mock Exams — Client

React 19 + TypeScript + Vite app structured for scalability with feature-based folders, shared UI, and path aliases.

## Project Structure

```
src/
  app/
    App.tsx                  # App shell + routes
  features/
    auth/
      components/            # Auth-specific UI (LoginModal, ProtectedRoute)
      context/               # Auth + LoginModal contexts
  shared/
    api/                     # API hooks/services
      api.ts
    config/                  # Cross-cutting runtime config
      axios.ts
    contexts/                # App-wide contexts (e.g., Loading)
      LoadingContext.tsx
    components/
      layout/                # Layout primitives (Header, Footer, Loader, Layout)
      ui/                    # Reusable UI components (Button, Input, Card)
  pages/                     # Route screens (kept simple; can migrate to features/* later)
  data/                      # Mock/static data
  types/                     # Global types
  assets/                    # Static assets
```

## Path Aliases

Configured in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`:

```
@app/*      -> src/app/*
@features/* -> src/features/*
@shared/*   -> src/shared/*
@config/*   -> src/shared/config/*
@api/*      -> src/shared/api/*
@types/*    -> src/types/*
```

Example:

```
import Button from '@shared/components/ui/Button'
import { useAuth } from '@features/auth/context/AuthContext'
```

## Develop

```powershell
npm install
npm run dev
```

**Performance Monitoring**: In development mode, performance metrics are automatically logged to the console after page load. Check for FCP (First Contentful Paint) and bundle size metrics.

## Build

```powershell
npm run build
npm run preview
```

**Bundle Analysis**: After build, check `dist/assets/` to verify:
- Initial bundle is <300KB (gzipped <100KB)
- Pages are split into separate chunks
- Vendor chunks are properly separated

## Performance Optimizations

This app implements Netflix/YouTube-style loading strategies:

- ⚡ **Route-based code splitting** - Pages load on-demand
- 📦 **Smart vendor chunking** - React, Router, Icons separated
- 🚀 **<500ms FCP target** - Critical path optimized
- 💾 **Aggressive caching** - Hashed filenames for long-term caching

See [QUICK_START_PERFORMANCE.md](QUICK_START_PERFORMANCE.md) for details or [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for in-depth guide.
