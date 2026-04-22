# Backend API (TypeScript + Express + Prisma)
Backend service for user authentication, lawyer discovery, availability management, bookings, chat, and lawyer ranking.
## Tech Stack
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication
## Project Structure
- `src/index.ts` - app bootstrap, middleware, route mounting
- `src/routes` - route definitions
- `src/controllers` - request handlers
- `src/services` - business logic (auth + AI integration)
- `src/middleware` - auth middleware
- `src/lib/prisma.ts` - Prisma client instance
- `prisma/schema.prisma` - DB schema
## Prerequisites
- Node.js 18+ (20+ recommended)
- PostgreSQL running locally or remotely
- npm
## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Create your environment file:
```bash
cp .env.example .env
```
If you are on Windows PowerShell:
```powershell
Copy-Item .env.example .env
```
3. Update `.env` values:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key-change-in-production"
# AI integration (required for /api/chats/message AI response)
AI_API_KEY="your-ai-api-key"
AI_API_URL="https://api.openai.com/v1/chat/completions"
AI_MODEL="gpt-3.5-turbo"
```
4. Create/apply database migration:
```bash
npx prisma migrate dev --name init
```
5. Run development server:
```bash
npm run dev
```
Server starts at `http://localhost:4000`.
## Build and Run (Production-style)
```bash
npm run build
npm start
```
## Database Utilities
- Open Prisma Studio:
```bash
npx prisma studio
```
Useful for inspecting `User`, `Lawyer`, `Booking`, `Chat`, etc.
## Authentication
Protected endpoints require:
```http
Authorization: Bearer <jwt_token>
```
Get a token from:
- `POST /api/auth/signup`
- `POST /api/auth/login`
## API Overview
### Health
- `GET /health`
### Auth (`/api/auth`)
- `POST /signup`
- `POST /login`
- `GET /profile` (protected)
- `PUT /profile` (protected)
### Lawyers (`/api/lawyers`)
- `GET /`
- `GET /:id`
### Availability (`/api/availability`) (protected)
- `POST /` (lawyer only)
- `DELETE /` (lawyer only)
- `GET /` (lawyer only)
- `POST /full-day-unavailable` (lawyer only)
### Bookings (`/api/bookings`) (protected)
- `POST /` (user books a slot)
- `POST /accept` (lawyer only)
- `POST /reject` (lawyer only)
- `POST /cancel` (booking owner)
- `GET /` (current user bookings)
- `GET /lawyer` (lawyer bookings)
### Chat (`/api/chats`) (protected)
- `POST /` (create chat)
- `POST /message` (send message + get AI response)
- `GET /`
- `GET /:chatId`
- `PUT /:chatId`
- `DELETE /:chatId`
### Ranking (`/api/ranking`)
- `GET /lawyers`
- `GET /lawyers/:lawyerId`
## Important Notes for Contributors
- A `LAWYER` role user is created via signup, but lawyer-specific features require a corresponding row in the `Lawyer` table.
- If testing lawyer-only flows, ensure the `Lawyer` record exists (you can add it with Prisma Studio).
- `POST /api/chats/message` depends on external AI configuration (`AI_API_*` env variables).
## Common Test Flow
1. Signup/login a USER and a LAWYER account.
2. Ensure LAWYER has a `Lawyer` table entry.
3. As LAWYER: create availability slot.
4. As USER: create booking for that slot.
5. As LAWYER: accept/reject booking.
6. As USER: test chat and profile endpoints.
7. Test ranking endpoints.
## Scripts
- `npm run dev` - start with `ts-node`
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run compiled app from `dist/index.js`
