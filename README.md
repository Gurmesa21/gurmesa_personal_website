# Gurmesa - Full Stack Developer Website

A production-grade personal full-stack developer website for a portfolio, services, blog, contact, and a private admin CMS.

## Tech Stack
- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma (Planned for Day 2)
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Tooling**: ESLint, Prettier

## Current Status
**Day 1 &mdash; foundation**
Project skeleton has been established with strict typechecking, linting, and formatting. Directory structures and documentation are in place.

## How to Run Locally
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the values (currently placeholders).
3. Run `npm install`.
4. Run `npm run dev` to start the development server.
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Run Tests
- Unit Tests: `npm run test`
- End-to-End Tests: `npx playwright test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
