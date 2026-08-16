# 📚 ZenCode — Master Learning & Architecture Guide

Welcome to the comprehensive learning and architectural documentation for **ZenCode**. This guide breaks down the codebase step-by-step so you can understand the exact mechanics, technologies, design patterns, and workflows used throughout this project.

---

## 📑 Table of Contents

1. [High-Level Project Overview & Tech Stack](#1-high-level-project-overview--tech-stack)
2. [Project Directory & File Structure Map](#2-project-directory--file-structure-map)
3. [Architecture & System Flow Diagrams](#3-architecture--system-flow-diagrams)
4. [Database & Prisma ORM Layer](#4-database--prisma-orm-layer)
5. [Authentication & Role-Based Access Control (RBAC)](#5-authentication--role-based-access-control-rbac)
6. [Providers & Global Layout](#6-providers--global-layout)
7. [Constants, Types & Constraints](#7-constants-types--constraints)
8. [Form Architecture & Custom Hooks (`useCreateProblem`)](#8-form-architecture--custom-hooks-usecreateproblem)
9. [UI Components & Design System](#9-ui-components--design-system)
10. [Judge0 Code Execution Engine & API Route Pipeline](#10-judge0-code-execution-engine--api-route-pipeline)
11. [End-to-End Problem Creation Flow (Walkthrough)](#11-end-to-end-problem-creation-flow-walkthrough)
12. [Summary of Key Takeaways for Developers](#12-summary-of-key-takeaways-for-developers)

---

## 1. High-Level Project Overview & Tech Stack

**ZenCode** is a full-stack competitive programming and coding practice platform inspired by LeetCode. It allows developers to solve algorithm problems, test code in multiple languages in real-time, and provides administrators with a rich interface to design and validate new coding challenges using an automated remote code execution engine.

### 🛠️ Core Technologies Used

| Technology | Role & Purpose | Key Packages |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Full-stack React framework providing Server Components (RSC), Client Components, Server Actions (`"use server"`), and Route Handlers. | `next@16.2.10` |
| **React 19** | Modern UI rendering library with asynchronous transitions and server actions support. | `react@19.2.4`, `react-dom@19.2.4` |
| **TypeScript 5** | Strict static type checking across database models, schemas, and components. | `typescript@^5` |
| **Tailwind CSS v4 & Lucide/Phosphor** | Utility-first styling with native CSS variables, dark mode support, and icons. | `@tailwindcss/postcss@^4`, `tailwindcss@^4`, `lucide-react`, `@phosphor-icons/react` |
| **Clerk Authentication** | Complete identity and session management, hosted sign-in/up, route middleware, and user context. | `@clerk/nextjs@^7.5.12` |
| **Prisma ORM v7 & PostgreSQL** | Type-safe database client and schema definitions using PostgreSQL adapter with connection pooling. | `@prisma/client@^7.8.0`, `prisma@^7.8.0`, `@prisma/adapter-pg`, `pg@^8.22.0` |
| **Docker** | Containerized PostgreSQL database for local development. | `docker-compose.yml` (`postgres:latest`) |
| **Judge0 API (via RapidAPI)** | Sandboxed remote code execution engine for validating reference solutions against test cases in Python, JavaScript, and Java. | `axios@^1.18.1` |
| **Monaco Editor** | The code editor that powers VS Code, embedded for starter code templates and reference solutions. | `@monaco-editor/react@^4.7.0`, `monaco-editor@^0.56.0` |
| **React Hook Form & Zod** | Form state management, dynamic field arrays, and runtime validation schema. | `react-hook-form@^7.83.0`, `zod@^4.4.3`, `@hookform/resolvers@^5.5.7` |
| **Shadcn UI & Radix UI** | Accessible, unstyled component primitives (Dialogs, Dropdowns, Cards, Badges, Tabs, etc.). | `radix-ui`, `@shadcn/react`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| **Sonner & Next Themes** | Modern toast notifications and dark/light theme switching. | `sonner@^2.0.7`, `next-themes@^0.4.6` |

---

## 2. Project Directory & File Structure Map

```text
zen-code/
├── app/                                # Next.js App Router root
│   ├── (auth)/                         # Route group for authentication
│   │   ├── layout.tsx                  # Centered layout for auth pages
│   │   ├── sign-in/[[...sign-in]]/     # Clerk catch-all SignIn page
│   │   │   └── page.tsx
│   │   └── sign-up/[[...sign-up]]/     # Clerk catch-all SignUp page
│   │       └── page.tsx
│   ├── (root)/                         # Main application group
│   │   ├── layout.tsx                  # Root app layout (Navbar + background)
│   │   └── page.tsx                    # Landing page / Home page
│   ├── api/                            # API Route Handlers
│   │   └── create-problem/
│   │       └── route.ts                # POST handler (Judge0 validation & DB insertion)
│   ├── create-problem/
│   │   └── page.tsx                    # Protected admin page to create problems
│   ├── globals.css                     # Global Tailwind v4 styles and CSS color tokens
│   └── layout.tsx                      # Root HTML layout (Fonts, ClerkProvider, ThemeProvider)
├── components/                         # Shared UI Components
│   ├── mode-toggle.tsx                 # Dark / Light / System theme toggle dropdown
│   └── ui/                             # Shadcn & Radix UI component library (60+ components)
│       ├── button.tsx, card.tsx, input.tsx, select.tsx, textarea.tsx, badge.tsx, etc.
├── hooks/                              # Custom React Hooks
│   ├── use-create-problem.ts           # Central hook for problem creation form state & submission
│   └── use-mobile.ts                   # Hook to detect mobile breakpoint (< 768px)
├── lib/                                # Utilities & Infrastructure
│   ├── db.ts                           # Global Prisma Client singleton with pg Pool adapter
│   ├── judge0.ts                       # Judge0 API functions (submitBatch, pollBatchResults)
│   ├── utils.ts                        # `cn()` helper (clsx + tailwind-merge)
│   └── generated/prisma/               # Generated Prisma Client runtime types
├── modules/                            # Feature-Based Modules
│   ├── auth/
│   │   └── actions/
│   │       └── index.ts                # Server Actions: onBoardUser, currentUserRole, getCurrentUserData
│   ├── home/
│   │   └── components/
│   │       └── Navbar.tsx              # Glassmorphic navbar with Clerk auth buttons & RBAC links
│   └── problems/
│       ├── components/
│       │   └── create-problem-form/    # Subdivided form components
│       │       ├── index.tsx           # Form container & submit button
│       │       ├── form-header.tsx     # Header & sample problem loader
│       │       ├── basic-info-section.tsx  # Title, Description, Difficulty
│       │       ├── tags-section.tsx    # Dynamic tags array with add/remove
│       │       ├── test-cases-section.tsx  # Dynamic test cases (input/output)
│       │       ├── language-section.tsx    # Multi-language starter code & solutions
│       │       ├── code-editor.tsx     # Monaco Editor wrapper
│       │       └── additional-info-section.tsx # Constraints, Hints, Editorial
│       ├── constant/
│       │   ├── index.ts                # DIFFICULTIES, LANGUAGE_OPTIONS, EDITOR_OPTIONS, etc.
│       │   └── sample-problem.ts       # Pre-filled DP & String sample problem templates
│       └── schema/
│           └── index.ts                # Zod problemSchema, defaultFormValues, DIFFICULTY_OPTIONS
├── prisma/
│   ├── schema.prisma                   # Database models (User, Problem) & Enums (UserRole, Difficulty)
│   └── migrations/                     # Prisma database migration SQL files
├── providers/
│   └── theme-providers.tsx             # Client wrapper around `next-themes` ThemeProvider
├── docker-compose.yml                  # PostgreSQL container config on port 5439
├── proxy.ts                            # Clerk middleware route protection
├── components.json                     # Shadcn UI configuration file
└── package.json                        # Dependencies and scripts
```

---

## 3. Architecture & System Flow Diagrams

### 🏗️ Complete System Architecture

```mermaid
graph TD
    subgraph Browser ["Client (Browser)"]
        LandingPage["Landing Page (app/(root)/page.tsx)"]
        CreateProblemPage["Create Problem Page (app/create-problem/page.tsx)"]
        Navbar["Navbar Component (RBAC enabled)"]
        Monaco["Monaco Code Editor"]
    end

    subgraph AuthLayer ["Authentication Layer (Clerk)"]
        ClerkProvider["ClerkProvider"]
        ClerkMiddleware["proxy.ts (clerkMiddleware)"]
        ClerkAPI["Clerk Auth Service"]
    end

    subgraph ServerSide ["Next.js Server Side"]
        ServerActions["Server Actions (modules/auth/actions)"]
        APIRoute["POST /api/create-problem (Route Handler)"]
    end

    subgraph ExternalServices ["External Engines & Databases"]
        Judge0["Judge0 Remote Code Execution API (RapidAPI)"]
        Postgres["PostgreSQL Database (Docker / Supabase / Neon)"]
    end

    LandingPage --> ClerkProvider
    LandingPage --> ServerActions
    ServerActions --> Postgres
    CreateProblemPage --> ServerActions
    CreateProblemPage --> APIRoute
    APIRoute --> Judge0
    APIRoute --> Postgres
    Navbar --> ClerkProvider
    ClerkMiddleware --> ClerkAPI
```

---

### 🔄 Problem Creation & Validation Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin User
    participant Form as useCreateProblem (Client Hook)
    participant Page as /create-problem (Server Component)
    participant API as /api/create-problem (Route Handler)
    participant Judge0 as Judge0 Remote Sandbox
    participant DB as PostgreSQL (Prisma)

    Admin->>Page: Navigates to /create-problem
    Page->>DB: getCurrentUserData() via Clerk ID
    DB-->>Page: Returns user record with role
    alt Role is not ADMIN
        Page-->>Admin: Redirects to / (Unauthorized)
    else Role is ADMIN
        Page-->>Admin: Renders CreateProblemForm
    end

    Admin->>Form: Fills form (or clicks "Load Sample")
    Admin->>Form: Clicks "Create Problem"
    Form->>Form: Validates schema locally using Zod (problemSchema)
    Form->>API: HTTP POST /api/create-problem (JSON payload)
    
    API->>DB: Re-verifies user role == ADMIN
    
    loop For each language (JS, PYTHON, JAVA)
        API->>Judge0: submitBatch(submissions for all test cases)
        Judge0-->>API: Returns batch submission tokens
        loop Poll until finished
            API->>Judge0: pollBatchResults(tokens)
            Judge0-->>API: Returns execution status & output
        end
        alt Any test case status != 3 (Accepted)
            API-->>Form: Returns HTTP 400 with testCase failure & stderr
            Form-->>Admin: Displays toast.error with details
        end
    end

    API->>DB: prisma.problem.create({ data: ... })
    DB-->>API: Problem record created
    API-->>Form: Returns HTTP 201 { success: true }
    Form-->>Admin: Displays toast.success & redirects to /problems
```

---

## 4. Database & Prisma ORM Layer

### 4.1 Prisma Schema (`prisma/schema.prisma`)

The database is built on PostgreSQL with two main entities: `User` and `Problem`.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  username  String?  @unique
  email     String   @unique
  role      UserRole @default(USER)

  problems  Problem[]

  firstName String?
  lastName  String?
  imageUrl  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model Problem {
  id                 String     @id @default(cuid())
  title              String
  description        String
  difficulty         Difficulty
  tags               String[]
  examples           Json
  constraints        String
  hints              String?
  editorial          String?

  testCases          Json
  codeSnippets       Json
  referenceSolutions Json
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  userId             String
  user               User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 🔍 Key Database Design Decisions:
1. **`output = "../lib/generated/prisma"`**: Instead of putting generated files in `node_modules`, Prisma generates client code into a local directory `lib/generated/prisma`, ensuring custom types and enums are easy to import anywhere.
2. **`clerkId String @unique`**: Links the external Clerk identity to our internal PostgreSQL database record.
3. **JSON Fields for Flexible Multi-Language Problem Definitions**:
   - `examples`: Stores structured inputs, outputs, and explanations for each language (`JAVASCRIPT`, `PYTHON`, `JAVA`).
   - `testCases`: Stores an array of `{ input: string, output: string }`.
   - `codeSnippets`: Stores starter templates provided to users when they open the code editor.
   - `referenceSolutions`: Stores official working solutions used by the backend to validate against Judge0.
4. **`onDelete: Cascade`**: If a user is deleted, all problems created by that user are automatically deleted.

---

### 4.2 Database Connection & Connection Pooling (`lib/db.ts`)

In Next.js development mode, files recompile frequently on hot reload. If you instantiate `new PrismaClient()` at the top level of every file, it quickly exhausts PostgreSQL's connection limits. `lib/db.ts` solves this using a **global singleton pattern** and PostgreSQL connection pooling (`pg.Pool` + `@prisma/adapter-pg`):

```typescript
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: adapter
});

if (process.env.NODE_ENV === "production") {
    globalForPrisma.prisma = prisma;
}
```

---

### 4.3 Local Database via Docker (`docker-compose.yml`)

The repository includes a pre-configured Docker Compose file to run PostgreSQL locally:

```yaml
services:
  zencode-postgres:
    image: postgres:latest
    container_name: zencode_db
    environment:
      POSTGRES_DB: zencode_db
      POSTGRES_USER: zencode_user
      POSTGRES_PASSWORD: zencode_password
    ports:
      - "5439:5432"
```

The database URL in `.env` connects to `postgresql://zencode_user:zencode_password@localhost:5439/zencode_db`.

---

## 5. Authentication & Role-Based Access Control (RBAC)

ZenCode uses **Clerk** combined with Next.js **Server Actions** and PostgreSQL for complete RBAC.

### 5.1 Route Protection via Clerk Middleware (`proxy.ts`)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', "/"])

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
```
- Public routes: `/`, `/sign-in`, `/sign-up`.
- All other routes (e.g., `/create-problem`, `/problems`) require authentication via `await auth.protect()`.

---

### 5.2 Server Actions for User Sync & Role Verification (`modules/auth/actions/index.ts`)

```typescript
"use server";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// 1. Automatically onboard/sync user on visiting home page
export const onBoardUser = async () => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No authenticated user found" };

        const { id, firstName, lastName, imageUrl, emailAddresses } = user;

        const newUser = await prisma.user.upsert({
            where: { clerkId: id },
            update: {
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
                email: emailAddresses[0].emailAddress || ""
            },
            create: {
                clerkId: id,
                firstName: firstName || null,
                lastName: lastName || null,
                imageUrl: imageUrl || null,
                email: emailAddresses[0].emailAddress || "",
            }
        });
        return { success: true, user: newUser };
    } catch (error) {
        console.error("Error saving user:", error);
        return { success: false, error: "Failed to save user" };
    }
}

// 2. Fetch current user role (USER or ADMIN)
export const currentUserRole = async () => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No authenticated user found" };

        const userRole = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { role: true }
        });
        return userRole?.role;
    } catch (e) {}
}

// 3. Fetch entire database record for current logged-in user
export const getCurrentUserData = async () => {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "No authenticated user found" };

        return await prisma.user.findUnique({
            where: { clerkId: user.id }
        });
    } catch (error) {}
}
```

---

### 5.3 Multi-Tier Security Enforcement

RBAC is enforced at 3 distinct levels:
1. **UI Layer (`modules/home/components/Navbar.tsx`)**:
   - Checks `userRole === UserRole.ADMIN` and conditionally shows the `<Link href="/create-problem">Create Problem</Link>` button.
2. **Page Layer (`app/create-problem/page.tsx`)**:
   - Server Component calls `getCurrentUserData()`. If `user?.role !== UserRole.ADMIN`, it executes `redirect("/")`.
3. **API Route Layer (`app/api/create-problem/route.ts`)**:
   - Re-verifies `userRole !== UserRole.ADMIN` and halts with `{ error: "Unauthorized" }` (HTTP 401).

---

## 6. Providers & Global Layout

### 6.1 Theme Provider (`providers/theme-providers.tsx`)

A client component wrapper (`"use client"`) around `next-themes` that prevents hydration mismatch and manages light/dark/system themes:

```typescript
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

---

### 6.2 Root Layout (`app/layout.tsx`)

The root layout injects Google Fonts (`Geist`, `Geist_Mono`, `JetBrains_Mono`), configures the HTML element with `suppressHydrationWarning`, and nests the `ClerkProvider` and `ThemeProvider`:

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

---

## 7. Constants, Types & Constraints

### 7.1 What are Constraints in Competitive Programming?

Constraints define the physical bounds and input limits under which a solution must execute efficiently.
For example:
- `1 <= n <= 45` (implies \(O(2^n)\) recursion might time out, necessitating \(O(n)\) Dynamic Programming)
- `1 <= s.length <= 2 * 10^5` (implies an \(O(n)\) or \(O(n \log n)\) algorithm is required; \(O(n^2)\) will trigger Time Limit Exceeded)
- `s consists only of printable ASCII characters`

In ZenCode:
- In the Zod schema: `constraints: z.string().min(1, "Constraints are required")`
- In Prisma: `constraints String`
- In the UI: Rendered as a monospace textarea in `AdditionalInfoSection`.

---

### 7.2 Constant Definitions (`modules/problems/constant/index.ts`)

This file exports global settings for filters, colors, and Monaco editor options:

```typescript
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
export const ITEMS_PER_PAGE = 5;

export const DEFAULT_FILTERS = {
    search: "",
    difficulty: "ALL",
    tag: "ALL",
};

export const DIFFICULTY_COLORS = {
    EASY: "bg-green-100 text-green-800 hover:bg-green-100",
    MEDIUM: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    HARD: "bg-red-100 text-red-800 hover:bg-red-100",
};

export const getDifficultyColor = (difficulty: keyof typeof DIFFICULTY_COLORS) => {
    return DIFFICULTY_COLORS[difficulty] || "";
};

export const LANGUAGE_OPTIONS = [
    { value: 'JAVASCRIPT', label: 'JavaScript' },
    { value: 'PYTHON', label: 'Python' },
    { value: 'JAVA', label: 'Java' },
];

export const getEditorLanguage = (language: string) => {
    return language.toLowerCase();
};

export const EDITOR_OPTIONS = {
    minimap: { enabled: false },
    fontSize: 16,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
};
```

---

### 7.3 Sample Problem Templates (`modules/problems/constant/sample-problem.ts`)

Contains full templates for pre-loading demo data:
1. `sampleDPProblem` ("Climbing Stairs")
2. `sampleStringProblem` ("Valid Palindrome")
3. `SAMPLE_PROBLEMS = { DP: sampleDPProblem, string: sampleStringProblem }`

Each sample problem specifies:
- Standard I/O boilerplate (e.g. `readline` in Node.js, `sys.stdin.readline()` in Python, `Scanner` in Java)
- Full starter templates
- Validated reference solutions that pass all test cases on Judge0.

---

### 7.4 Validation Schemas (`modules/problems/schema/index.ts`)

ZenCode uses **Zod** to validate all problem creation data before sending it over the network:

```typescript
import { z } from "zod";

export const problemSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    constraints: z.string().min(1, "Constraints are required"),
    hints: z.string().optional(),
    editorial: z.string().optional(),

    testCases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
            }),
        )
        .min(1, "At least one test case is required"),

    examples: z.object({
        JAVASCRIPT: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
        PYTHON: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
        JAVA: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
    }),

    codeSnippets: z.object({
        JAVASCRIPT: z.string().min(1, "Javascript code snippet is required"),
        PYTHON: z.string().min(1, "Python code snippet is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),

    referenceSolutions: z.object({
        JAVASCRIPT: z.string().min(1, "Javascript code snippet is required"),
        PYTHON: z.string().min(1, "Python code snippet is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),
});
```

---

## 8. Form Architecture & Custom Hooks (`useCreateProblem`)

Handling complex multi-level forms with dynamic nested arrays (tags, test cases) and multiple code editors requires clean architecture. This is abstracted into a custom hook: `hooks/use-create-problem.ts`.

### 8.1 Hook Implementation Breakdown

```typescript
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { defaultFormValues, problemSchema } from "@/modules/problems/schema";
import { SAMPLE_PROBLEMS } from "@/modules/problems/constant/sample-problems";
import { z } from "zod";

type ProblemFormData = z.infer<typeof problemSchema>;

export function useCreateProblem() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sampleType, setSampleType] = useState("DP");

    // 1. Initialize react-hook-form with Zod validation
    const form = useForm<ProblemFormData>({
        resolver: zodResolver(problemSchema),
        defaultValues: defaultFormValues as ProblemFormData,
    });

    // 2. Dynamic test cases array helper
    const testCasesArray = useFieldArray({
        control: form.control,
        name: "testCases" as const,
    });

    // 3. Dynamic tags array helper
    const tagsArray = useFieldArray({
        control: form.control,
        name: "tags" as any,
    }) as any;

    // 4. API Submit Handler
    const onSubmit = async (values: ProblemFormData) => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/create-problem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Problem created successfully");
                router.push("/problems");
            } else {
                toast.error(data.error || "Failed to create problems");
            }
        } catch (error: any) {
            console.error("Error creating problems:", error);
            toast.error(error.message || "Failed to create problems");
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Pre-fill sample problems helper
    const loadSampleData = () => {
        const sampleData = SAMPLE_PROBLEMS[sampleType as keyof typeof SAMPLE_PROBLEMS];
        tagsArray.replace(sampleData.tags);
        testCasesArray.replace(sampleData.testCases);
        form.reset(sampleData as any);
    };

    return {
        form,
        testCasesArray,
        tagsArray,
        isLoading,
        sampleType,
        setSampleType,
        onSubmit: form.handleSubmit(onSubmit),
        loadSampleData,
    };
}
```

---

## 9. UI Components & Design System

The problem creation UI is modularized into 8 dedicated components under `modules/problems/components/create-problem-form/`:

```text
create-problem-form/
├── index.tsx                   # Main form wrapper & SubmitButton with loading spinner
├── form-header.tsx             # Header title + sample switcher (DP vs String) + load button
├── basic-info-section.tsx      # Title, Description, and Difficulty Select dropdown
├── tags-section.tsx            # Dynamic tag inputs with +Add Tag and trash icons
├── test-cases-section.tsx      # Dynamic test cases (Input & Expected Output textareas)
├── language-section.tsx        # Tabs for JAVASCRIPT, PYTHON, JAVA code & examples
├── code-editor.tsx             # Monaco Editor instance configured for dark theme
└── additional-info-section.tsx # Constraints, Hints, and Editorial textareas
```

### 9.1 Monaco Editor Integration (`code-editor.tsx`)

The Monaco Editor is wrapped to provide a VS Code experience inside the browser:

```tsx
"use client";
import { Editor } from "@monaco-editor/react";

const LANGUAGE_MAP = {
    javascript: "javascript",
    python: "python",
    java: "java",
};

export function CodeEditor({ value, onChange, language = "javascript" }: any) {
    return (
        <div className="border rounded-md bg-slate-950 text-slate-50">
            <div className="px-4 py-2 bg-slate-800 border-b text-sm font-mono">
                {language}
            </div>

            <div className="h-75 w-full">
                <Editor
                    height={"300px"}
                    defaultLanguage={LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP]}
                    theme="vs-dark"
                    value={value}
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 18,
                        lineNumbers: "on",
                        readOnly: false,
                        wordWrap: "on",
                        formatOnPaste: true,
                        formatOnType: true,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}
```

---

## 10. Judge0 Code Execution Engine & API Route Pipeline

A competitive programming platform must guarantee that any problem submitted by an admin has **working reference solutions that pass all test cases** across all supported languages before saving to the database.

### 10.1 Judge0 Client Library (`lib/judge0.ts`)

ZenCode connects to the RapidAPI Judge0 batch execution endpoint:

```typescript
import axios from 'axios';

// Maps language names to Judge0 Language IDs
export function getJudge0languageId(language: string) {
    const languageMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "JAVA": 62,
    };
    return languageMap[language.toUpperCase() as keyof typeof languageMap];
}

// Submits a batch of test cases in one HTTP POST request
export async function submitBatch(submissions: any) {
    const options = {
        method: 'POST',
        url: 'https://judge0-extra-ce1.p.rapidapi.com/submissions/batch',
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '...',
            'x-rapidapi-host': 'judge0-extra-ce1.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { submissions: submissions }
    };
    const { data } = await axios.request(options);
    return data;
}

// Polls Judge0 until all test cases have finished processing
export async function pollBatchResults(tokens: string[]) {
    const options = {
        method: 'GET',
        url: 'https://judge0-extra-ce1.p.rapidapi.com/submissions/batch',
        params: {
            tokens: tokens.join(','),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '...',
            'x-rapidapi-host': 'judge0-extra-ce1.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };

    const { data } = await axios.request(options);
    const results = data.submissions;
    
    // Status ID 1 = In Queue, Status ID 2 = Processing, Status ID 3 = Accepted
    const isAllDone = results.every((r: any) => r.status.id !== 1 && r.status.id !== 2);
    
    if (isAllDone) {
        return results;
    }
    await sleep(1000);
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

---

### 10.2 Problem Creation API Route (`app/api/create-problem/route.ts`)

When an admin posts a new problem, this route performs the full validation and database persistence pipeline:

```typescript
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { getJudge0languageId, pollBatchResults, submitBatch } from "@/lib/judge0";
import { currentUserRole, getCurrentUserData } from "@/modules/auth/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate & authorize caller
        const userRole = await currentUserRole();
        const user = await getCurrentUserData();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        if (userRole !== UserRole.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request payload
        const {
            title, description, difficulty, tags, examples,
            constraints, testCases, codeSnippets, referenceSolutions,
        } = await request.json();

        if (!title || !description || !difficulty || !testCases || !codeSnippets || !referenceSolutions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return NextResponse.json({ error: "At least one test case is required" }, { status: 400 });
        }

        // 3. Test every language's reference solution against all test cases via Judge0
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0languageId(language);

            // Prepare submissions for all test cases
            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));

            // Submit batch
            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((res: any) => res.token);

            // Poll until execution finishes
            const results = await pollBatchResults(tokens);

            // Verify status.id == 3 (Accepted)
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3) {
                    return NextResponse.json(
                        {
                            error: `Validation failed for ${language}`,
                            testCase: {
                                input: submissions[i].stdin,
                                expectedOutput: submissions[i].expected_output,
                                actualOutput: result.stdout,
                                error: result.stderr || result.compile_output,
                            },
                            details: result,
                        },
                        { status: 400 },
                    );
                }
            }
        }

        // 4. Save validated problems into PostgreSQL
        const newProblem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testCases,
                codeSnippets,
                referenceSolutions,
                userId: user.id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Problem Created Successfully",
                data: newProblem,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Failed to save problems to database" },
            { status: 500 },
        );
    }
}
```

---

## 11. End-to-End Problem Creation Flow (Walkthrough)

Here is what happens step-by-step when an Admin creates a new coding problem:

1. **Accessing the Page**:
   - Admin navigates to `/create-problem`.
   - `app/create-problem/page.tsx` runs on the server, fetches user info from PostgreSQL using Clerk ID, checks if `role === ADMIN`. If yes, page renders.
2. **Filling Out Details**:
   - The user can either fill out the form manually or click **"Load Sample"** to load the pre-built Dynamic Programming or String problem.
   - Tags can be added or deleted dynamically via `tagsArray.append("")` / `tagsArray.remove(index)`.
   - Test cases can be added or deleted dynamically via `testCasesArray.append({ input: "", output: "" })`.
   - Code templates and reference solutions for JavaScript, Python, and Java are written directly inside Monaco Editor instances.
3. **Form Submission**:
   - Admin clicks **"Create Problem"**.
   - `useCreateProblem` triggers `form.handleSubmit(onSubmit)`. Zod validates all inputs client-side.
   - If valid, a `POST` request with the JSON payload is dispatched to `/api/create-problem`.
4. **Judge0 Sandboxed Testing**:
   - The server extracts `referenceSolutions` for JavaScript (ID: 63), Python (ID: 71), and Java (ID: 62).
   - For each language, it packages all test case inputs/outputs into a Judge0 batch and submits it to RapidAPI.
   - The server polls Judge0 until execution concludes.
   - If a solution throws a syntax error, runtime error, or returns the wrong output, Judge0 returns a status other than `3` (Accepted). The API immediately stops and returns HTTP 400 detailing which test case failed and why.
5. **Database Storage & Redirection**:
   - Once all 3 languages pass 100% of the test cases, the server creates the problem record in PostgreSQL linked to the admin's `userId`.
   - The client receives `{ success: true }`, triggers a toast notification via `sonner`, and redirects to `/problems`.

---

## 12. Summary of Key Takeaways for Developers

| Concept | Implementation in ZenCode |
| :--- | :--- |
| **Server Actions** | Located in `modules/auth/actions/index.ts`. Used for database mutations and reads (`onBoardUser`, `currentUserRole`) directly on the server without custom HTTP boilerplate. |
| **Route Handlers** | Located in `app/api/create-problem/route.ts`. Used when external asynchronous webhook/polling pipelines (like Judge0) need to coordinate before database insertion. |
| **Singleton Database Pattern** | Located in `lib/db.ts`. Uses `globalThis` to preserve a single `pg.Pool` connection pool during Next.js hot-reloading in local development. |
| **Form Management** | `react-hook-form` + `@hookform/resolvers/zod` + `useFieldArray`. Decoupled into a clean custom hook (`useCreateProblem`) and modular UI sections. |
| **Monaco Integration** | Uses `@monaco-editor/react` with dark theme (`vs-dark`) and automatic resizing for real-time coding experiences. |
| **Remote Sandboxing** | Batch submission and polling via Judge0 API prevents server resource starvation and safely executes untrusted code. |
| **Design System** | Clean dark/light theme support using `next-themes`, Tailwind CSS v4 variables, and accessible Radix/Shadcn primitives. |

---

*Documentation created for ZenCode. Happy coding! 🚀*
