## Project Summary
A comprehensive ERP system for pre-schools, including modules for student management, teacher management, attendance, fees, announcements, and reports. It features distinct roles for Admins, Teachers, and Parents, with role-based access control (RBAC).

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React, Framer Motion, Zustand (State Management), Bun
- **Backend**: Node.js, Express, MongoDB (Mongoose), TypeScript, tsx
- **Database**: MongoDB (Local instance at `mongodb://127.0.0.1:27017/preschool-erp`)
- **Authentication**: Custom JWT-based authentication

## Architecture
- `frontend/`: Next.js client-side application with App Router. Components are organized into `ui/`, `dashboard/`, and `layout/`.
- `backend/`: Express API server. Follows a model-route-controller pattern (though routes currently contain logic).
- `ROOT`: Contains configuration and root `package.json` for managing both frontend and backend.

## User Preferences
- Use functional components.
- No comments unless requested.

## Project Guidelines
- Frontend uses Tailwind CSS for styling.
- Backend uses `tsx` for watching and running TypeScript files.
- Local MongoDB is preferred for development.

## Common Patterns
- Zustand is used for state management in `frontend/src/store/index.ts`.
- `framer-motion` is used for animations.
- Role-based access control is implemented via `frontend/src/lib/rbac.ts`.
