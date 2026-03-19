# Smart LPG Booking System

Smart LPG Booking System is a full-stack platform for LPG cylinder booking, tracking, and delivery management built using React, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## How to run locally

The only requirement is having Node.js & npm (or bun) installed.

```sh
# Install dependencies
npm i

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start dev server (localhost:8080)
- `npm run build` - Build for production
- `npm run lint` - Lint code
- `npm run preview` - Preview production build

## Technologies

- Vite + React + TypeScript
- shadcn/ui + Tailwind CSS
- React Router
- Supabase (auth, database)
- TanStack Query
- Lucide React icons

## Project Structure

```
src/
├── components/     # UI components (shadcn)
├── hooks/          # Custom hooks (useAuth)
├── pages/          # Route pages (BookCylinder, Dashboards)
├── lib/            # Utilities
└── integrations/   # Supabase client
```

## Deployment

Deploy to Vercel, Netlify, or any static host. Configure Supabase env vars.

## Custom Domain

Configure via hosting provider (Vercel/Netlify DNS).
