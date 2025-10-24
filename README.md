# Product Dashboard (frontend)

This is a Next.js (app router) frontend for a realtime product management dashboard.

Quick summary:
- Next.js + React 19 (app directory)
- Redux Toolkit Query for API calls (RTK Query)
- Firebase Firestore used for realtime invalidation (onSnapshot 12 RTK Query cache invalidation)
- Tailwind CSS and Radix UI primitives for the design system
- Image uploads use ImgBB (optional) from the product form

## Quick start (development)

Install dependencies and run the dev server (PowerShell):

```powershell
npm install
npm run dev
```

App runs at http://localhost:3000 by default.

Available npm scripts (from `package.json`):

- `dev` 12 next dev
- `build` 12 next build
- `start` 12 next start

## Required environment variables

Create a `.env.local` file at the project root. The app expects the following public env vars (examples):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxx:web:yyyy
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key  # optional: required for image uploads in ProductModal
```

Notes:
- Firebase config is read from `lib/firebase/config.ts` and used only for Firestore realtime listeners.
- The frontend API base URL defaults to `http://localhost:5000/api` but is configurable via `NEXT_PUBLIC_API_URL`.

## Architecture and key concepts

1. Next.js app router
   - Entry layout: `app/layout.tsx` 12 global styles and font.
   - Providers: `app/providers.tsx` (wraps app with Redux `Provider`).

2. State & data fetching
   - Redux store: `lib/redux/store.ts` 12 wires RTK Query APIs and middleware.
   - RTK Query APIs:
     - `lib/redux/features/products/productsApi.ts` 12 endpoints for CRUD on products. Uses `tagTypes: ['Products']` and invalidation to refresh lists.
     - `lib/redux/features/auth/authApi.ts` 12 login/logout/verify endpoints.
   - RTK Query baseQuery uses `credentials: 'include'` to keep cookie-based sessions.

3. Realtime updates
   - Firestore is used to trigger realtime cache invalidation. See `hooks/useRealtimeProducts.ts`:
     - Listens to `products` collection with `onSnapshot` and calls `productsApi.util.invalidateTags(['Products'])` to force refetch.

4. UI system and patterns
   - `components/ui/*` contains UI primitives (Radix-based) used across the app (buttons, dialogs, inputs, table, toast, etc.). Follow those components for consistent styling.
   - Page-level product views live in `components/products/*`:
     - `ProductsTable.tsx` 12 list + actions (edit/delete). Uses `@tanstack/react-table`.
     - `ProductModal.tsx` 12 create/update product form using `react-hook-form`, `zod`, and `@hookform/resolvers/zod`.
     - `DeleteConfirmModal.tsx` 12 confirmation dialog wired to `useDeleteProductMutation()`.

5. Types
   - Shared types are in `types/index.ts` (Product, Auth types, ApiError). Use these when adding endpoints or components.

## Data flow example (create product)

1. User opens `ProductModal` and submits the form.
2. `useCreateProductMutation()` (RTK Query) posts to `${NEXT_PUBLIC_API_URL}/products`.
3. Server stores the product and (optionally) writes to Firestore.
4. `useRealtimeProducts` (client) hears Firestore `onSnapshot` for the `products` collection and invalidates RTK Query tag `Products`.
5. `useGetProductsQuery()` refetches and the UI updates.

This separation means the app uses RTK Query for primary CRUD and Firestore as a lightweight realtime trigger to keep caches fresh.

## Conventions & patterns to follow

- 'use client' is used on interactive components (see `components/products/*`). Follow React/Next client vs server component rules.
- Forms: use `react-hook-form` + `zod` schemas (see `ProductModal.tsx` for schema + validation pattern).
- RTK Query: add endpoints in `lib/redux/features/*` and use tag invalidation (`Products`) for cache updates.
- Keep env vars in `.env.local`. Never commit secrets.
- UI primitives: prefer components under `components/ui` to keep consistent styling and accessibility.

## Extending the API integration

- To add a new endpoint for products: update `productsApi` in `lib/redux/features/products/productsApi.ts`. Use `providesTags` / `invalidatesTags` to integrate with the realtime invalidation flow.
- If you need to trigger a client-side refresh manually, call `productsApi.util.invalidateTags(['Products'])` (this is used by `useRealtimeProducts`).

## Image uploads

- `ProductModal.tsx` uploads images to ImgBB when `NEXT_PUBLIC_IMGBB_API_KEY` is configured. If you don't set it, image upload will throw 12 the field is optional.

## Debugging and development tips

- API server: the frontend expects CORS and cookie-based auth support. The base URL is `NEXT_PUBLIC_API_URL`.
- RTK Query devtools are available when running in development; review network requests in browser devtools to inspect RTK Query requests.
- Firestore realtime: if realtime updates aren't happening, verify `lib/firebase/config.ts` environment variables and that the Firestore rules allow reads on `products`.

## Deployment

- Works with Vercel (Next.js). Set the same environment variables in your deployment settings.

## Files to look at when you start contributing

- `app/layout.tsx` app shell and global styles
- `app/providers.tsx` Redux provider wiring
- `lib/redux/store.ts` RTK store and middleware
- `lib/redux/features/products/productsApi.ts` products endpoints (RTK Query)
- `lib/redux/features/auth/authApi.ts` auth endpoints
- `lib/firebase/config.ts` Firestore initialization (env-based)
- `hooks/useRealtimeProducts.ts` realtime invalidation pattern
- `components/products/*` product UI (table, modal, delete)
- `components/ui/*` shared UI primitives
- `types/index.ts` TypeScript types used across the app

