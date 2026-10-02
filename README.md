<div align="center">

# ⚡ ZenCode

**A modern competitive coding platform that teaches you to _think_, not just code.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

</div>

---

## 📖 About

ZenCode is a full-stack coding practice platform built for developers who want to go beyond memorising solutions. The platform enforces a deliberate learning philosophy:

> **Understand → Brute Force → Find the Bottleneck → Optimise → Analyse Complexity**

Instead of jumping straight to the optimal answer, ZenCode guides you through _why_ a naive approach is slow, and _how_ to derive the efficient solution yourself — with an AI tutor that follows the same teaching methodology.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧩 **Problem Library** | Curated problems categorised by difficulty (Easy / Medium / Hard) with filtering by tags and search |
| 💻 **In-Browser Code Editor** | Monaco Editor (same engine as VS Code) with syntax highlighting for JavaScript, Python, and Java |
| ▶️ **Run & Submit** | Live code execution and judging powered by the Judge0 API with detailed test-case results |
| 🤖 **AI Coding Assistant** | Streaming AI tutor (powered by OpenRouter + Gemini) that teaches brute-force → optimal, not just gives answers |
| 📂 **Problem Playlists** | Create and manage custom playlists to group problems by topic or study plan |
| 👤 **User Profiles** | Track your solved problems, submission history, and progress |
| 🔐 **Authentication** | Secure sign-up / sign-in via Clerk with automatic user onboarding |
| 🛡️ **Role-Based Access** | `ADMIN` role can create and manage problems; `USER` role for regular practice |
| 🌙 **Dark / Light Mode** | Full theme support powered by `next-themes` |
| ⚡ **Rate Limiting** | DB-backed rate limiting on AI requests (20 req/min per user) |

---

## 🛠️ Tech Stack

**Framework & Language**
- [Next.js 16](https://nextjs.org) (App Router, Turbopack) — React 19
- [TypeScript 5](https://www.typescriptlang.org)

**Database & ORM**
- [PostgreSQL](https://www.postgresql.org) — primary database
- [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` driver adapter

**Authentication**
- [Clerk](https://clerk.com) — managed auth with webhooks for user sync

**Code Execution**
- [Judge0](https://judge0.com) via RapidAPI — sandboxed code execution engine

**AI Assistant**
- [OpenRouter](https://openrouter.ai) API (model-agnostic) — defaults to `google/gemini-2.5-flash`
- Streaming Server-Sent Events (SSE) response

**UI & Styling**
- [Tailwind CSS 4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) component library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
- [Lucide React](https://lucide.dev) icons

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 9  (`npm install -g pnpm`)
- [Docker](https://www.docker.com) (for local PostgreSQL) **or** a hosted Postgres URL

### 1. Clone the repository

```bash
git clone https://github.com/your-username/zen-code.git
cd zen-code
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

See the [Environment Variables](#-environment-variables) section below for a full reference.

### 4. Start the local database

A `docker-compose.yml` is included for spinning up a local PostgreSQL instance:

```bash
docker compose up -d
```

This starts a Postgres container on **port 5439** with:
- Database: `zencode_db`
- User: `zencode_user`
- Password: `zencode_password`

So your `DATABASE_URL` for local dev would be:

```
DATABASE_URL="postgresql://zencode_user:zencode_password@localhost:5439/zencode_db"
```

### 5. Run database migrations

```bash
pnpm prisma migrate dev
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file at the root of the project. All variables below are required unless marked optional.

```env
# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/zencode_db"

# ── Clerk Authentication ───────────────────────────────────────────────────────
# Get these from https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# ── Judge0 Code Execution ──────────────────────────────────────────────────────
# Get your RapidAPI key at https://rapidapi.com/judge0-official/api/judge0-ce
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key

# ── OpenRouter AI Assistant ────────────────────────────────────────────────────
# Get your key at https://openrouter.ai/keys
# IMPORTANT: Do NOT prefix with NEXT_PUBLIC_ — must stay server-side only.
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Change to any model supported by OpenRouter
OPENROUTER_MODEL=google/gemini-2.5-flash
```

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the Next.js dev server with Turbopack |
| `pnpm build` | Generate Prisma client, then build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma migrate dev` | Create and apply a new migration |
| `pnpm prisma studio` | Open the Prisma visual database browser |
| `pnpm prisma generate` | Regenerate the Prisma client after schema changes |
| `pnpm verify:problems` | Audit the built-in problem bank: runs every reference solution (JS/Python/Java), starter code and a deliberately wrong solution through the same judging code the site uses |

### Built-in problem bank

`modules/problems/problem-bank/` contains 45 ready-made problems: 5 each for **String, Array, 2D Array, Sliding Window, Linked List, Doubly Linked List, Stack, Queue and Graph**. Each problem is a small spec (statement, test cases, and a reference solution per language); `builder.ts` generates the starter code, the stdin/stdout harness and the reference solutions for JavaScript, Python and Java.

They are added the same way as every other problem: sign in as an `ADMIN`, open **Create Problem**, pick a problem in the sample dropdown (grouped by topic), click **Load Sample** and then **Create Problem**. `/api/create-problem` validates the reference solutions on Judge0 before inserting into the database. Nothing is written until you click Create.

```bash
pnpm verify:problems   # offline audit: correct code => Accepted, wrong/empty code => rejected
```

`verify:problems` needs `node`, `python` and a JDK (`javac`, `java`) on your PATH (use `-- --skip-java` without a JDK).

Submissions are judged server-side against the test cases stored in the database (`executeCode` never trusts client-supplied expected outputs). A test case passes only if the program ran cleanly (no compile/runtime error or timeout) **and** its output matches the expected output (line endings and trailing spaces are ignored).

---

## 🗄️ Database Schema

The data model is defined in [`prisma/schema.prisma`](./prisma/schema.prisma).

```
User
 ├── Problem[]         (problems created by the user)
 ├── Submission[]      (all code submissions)
 ├── ProblemSolved[]   (solved problems tracker)
 └── Playlist[]        (custom problem playlists)

Problem
 ├── Submission[]
 ├── ProblemSolved[]
 └── ProblemInPlaylist[]

Submission
 └── TestCaseResult[]  (per-test-case execution results)

Playlist
 └── ProblemInPlaylist[]

RateLimit              (DB-backed rate limiting for API routes)
```

**Enums:** `UserRole` (`USER` | `ADMIN`), `Difficulty` (`EASY` | `MEDIUM` | `HARD`)

---

## 🌐 Deploying to Vercel

### Manual deployment steps

1. Push your code to GitHub.
2. Import the repository on [vercel.com](https://vercel.com).
3. In **Settings → Environment Variables**, add all variables from the [Environment Variables](#-environment-variables) section above.
4. The build command is already configured in `package.json`:
   ```
   prisma generate && next build
   ```
5. Deploy. Vercel will automatically run `prisma generate` before each build.

> **Important:** Make sure your `DATABASE_URL` points to a **publicly accessible** PostgreSQL instance (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app)). Docker-local databases are not reachable from Vercel's build servers.

---

## 📁 Project Structure

```
zen-code/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Sign-in / Sign-up pages (Clerk)
│   ├── (root)/                 # Main app layout (navbar + footer)
│   │   ├── page.tsx            # Landing / home page
│   │   ├── about/              # About page
│   │   ├── problems/           # Problem list page
│   │   └── profile/            # User profile page
│   ├── create-problem/         # Admin: problem creation page
│   ├── problem/[id]/           # Individual problem solver page
│   └── api/
│       ├── assistant/          # AI assistant (streaming SSE)
│       ├── create-problem/     # Problem creation API
│       └── playlist/           # Playlist CRUD API
│
├── modules/                    # Feature-based module organisation
│   ├── auth/                   # Auth actions (onboarding, getCurrentUser)
│   ├── home/                   # Navbar, footer components
│   ├── problems/               # Problem list, editor, submission logic
│   ├── playlists/              # Playlist management
│   └── profile/                # Profile UI components
│
├── lib/
│   ├── db.ts                   # Prisma client singleton (with PG adapter)
│   ├── judge0.ts               # Judge0 API helpers
│   ├── ratelimit.ts            # DB-backed rate limiter
│   ├── utils.ts                # Shared utilities
│   └── generated/prisma/       # Auto-generated Prisma client
│
├── components/                 # Shared UI components (shadcn/ui)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── prisma.config.ts            # Prisma configuration
├── docker-compose.yml          # Local PostgreSQL setup
└── next.config.ts              # Next.js configuration
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request

Please ensure your code passes linting (`pnpm lint`) before submitting a PR.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ by <strong>The Zenith Company</strong>
</div>
