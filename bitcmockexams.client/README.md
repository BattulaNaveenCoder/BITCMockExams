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

## Build

```powershell
npm run build
npm run preview
```
