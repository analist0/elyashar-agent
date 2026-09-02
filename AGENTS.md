# Repository Guidelines

## Project Structure & Module Organization

This repository contains a full-stack multi-agent voice appointment platform.

- `backend/`: Express API, xAI realtime voice proxy, Supabase-backed services, appointment tools, Telegram notifications, and API tests.
- `backend/src/routes/`: HTTP route modules. Keep route handlers thin and move reusable logic into `backend/src/services/` or `backend/src/tools/`.
- `backend/test/`: Node.js built-in test runner suites using the `*.test.js` pattern.
- `frontend/`: React, TypeScript, Vite dashboard and public voice-booking UI.
- `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/hooks/`, and `frontend/src/services/`: UI building blocks, route pages, React hooks, and API client code.
- `scripts/`: repository helper scripts, when present.

## Build, Test, and Development Commands

- `cd backend && npm install`: install backend dependencies from `package-lock.json`.
- `cd backend && npm run dev`: start the Express API with `node src/server.js`.
- `cd backend && npm test`: run backend tests with `node --test`.
- `cd frontend && npm install`: install frontend dependencies.
- `cd frontend && npm run dev`: start the Vite development server.
- `cd frontend && npm run build`: type-check the React app and produce a production build.
- `cd frontend && npm run preview`: preview the built frontend locally.

## Coding Style & Naming Conventions

Use ES modules throughout. Backend JavaScript follows two-space indentation, semicolons, descriptive `camelCase` exports, and service filenames such as `appointmentService.js`. Frontend code uses TypeScript and React components in `PascalCase` files, such as `VoiceAgent.tsx`; hooks should use `useName` naming. Prefer shared UI primitives in `frontend/src/components/ui/` before adding new local button or input styles.

## Testing Guidelines

Backend tests use Node.js's built-in test runner. Add or update `backend/test/*.test.js` when changing routes, services, realtime behavior, or agent tools. Cover success paths, validation failures, and external-service error handling. The frontend currently has no test script, so run `npm run build` as the minimum verification for UI changes.

## Commit & Pull Request Guidelines

The visible Git history contains a single imperative commit (`Build multi-agent voice appointment platform`). Continue using short imperative subjects, for example `Add booking slot validation`. Pull requests should describe the behavior change, list commands run, link related issues, include screenshots for UI changes, and call out new environment variables or API contract changes.

## Security & Configuration

Copy `backend/.env.example` and `frontend/.env.example` for local configuration. Never commit real API keys, Supabase credentials, webhook URLs, Telegram tokens, or xAI credentials. Keep sensitive upstream error details out of user-facing responses.
