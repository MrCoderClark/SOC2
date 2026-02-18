# Phase 1 Issues - Foundation & Core Setup

Use these to create GitHub Issues. Copy each section as a new issue.

---

## Issue #1: Initialize Monorepo Structure

**Labels:** `phase: 1-foundation`, `type: task`, `priority: critical`, `component: backend`, `component: frontend`

### Description
Set up the monorepo structure using pnpm workspaces with Next.js frontend and NestJS backend.

### Tasks
- [ ] Initialize pnpm workspace
- [ ] Create `apps/web` - Next.js 14 with App Router
- [ ] Create `apps/api` - NestJS application
- [ ] Create `packages/shared` - Shared types and utilities
- [ ] Create `packages/database` - Prisma schema and client
- [ ] Configure TypeScript paths and references
- [ ] Set up ESLint and Prettier
- [ ] Create root scripts for dev, build, test

### Acceptance Criteria
- [ ] `pnpm dev` starts both frontend and backend
- [ ] `pnpm build` builds all packages
- [ ] TypeScript compilation works across packages

---

## Issue #2: Database Schema Design

**Labels:** `phase: 1-foundation`, `type: task`, `priority: critical`, `component: database`

### Description
Design and implement the initial PostgreSQL database schema using Prisma.

### Tasks
- [ ] Design ERD for core entities
- [ ] Create Prisma schema with models:
  - Organization
  - User
  - Framework
  - Control
  - Evidence
  - Policy
  - AuditLog
- [ ] Set up database migrations
- [ ] Create seed data for SOC 2 controls
- [ ] Configure Prisma client generation

### Acceptance Criteria
- [ ] Migrations run successfully
- [ ] Seed data populates SOC 2 framework
- [ ] Prisma client is generated and typed

---

## Issue #3: Authentication System

**Labels:** `phase: 1-foundation`, `type: feature`, `priority: critical`, `component: auth`

### Description
Implement authentication using Clerk or Auth0 with support for email/password and OAuth.

### Tasks
- [ ] Choose and configure auth provider (Clerk recommended)
- [ ] Set up auth middleware in NestJS
- [ ] Implement protected routes in Next.js
- [ ] Create user sync between auth provider and database
- [ ] Implement organization-based multi-tenancy
- [ ] Add role-based access control (RBAC)

### Acceptance Criteria
- [ ] Users can sign up and log in
- [ ] OAuth works (Google, GitHub)
- [ ] Protected routes redirect to login
- [ ] User data syncs to database

---

## Issue #4: Basic UI Shell

**Labels:** `phase: 1-foundation`, `type: feature`, `priority: high`, `component: frontend`

### Description
Create the basic application shell with navigation, layout, and core UI components.

### Tasks
- [ ] Set up TailwindCSS and shadcn/ui
- [ ] Create app layout with sidebar navigation
- [ ] Implement responsive design
- [ ] Create core pages:
  - Dashboard
  - Controls
  - Evidence
  - Policies
  - Settings
- [ ] Add loading states and error boundaries
- [ ] Implement dark mode support

### Acceptance Criteria
- [ ] Navigation works between all pages
- [ ] Layout is responsive on mobile/tablet/desktop
- [ ] Dark mode toggle works
- [ ] Loading states display correctly

---

## Issue #5: CI/CD Pipeline

**Labels:** `phase: 1-foundation`, `type: task`, `priority: high`

### Description
Set up GitHub Actions for continuous integration and deployment.

### Tasks
- [ ] Create workflow for PR checks (lint, type-check, test)
- [ ] Create workflow for main branch deployment
- [ ] Set up environment variables in GitHub Secrets
- [ ] Configure preview deployments for PRs
- [ ] Add database migration step to deployment

### Acceptance Criteria
- [ ] PRs run automated checks
- [ ] Main branch auto-deploys to staging
- [ ] Preview URLs generated for PRs

---

## Issue #6: API Foundation

**Labels:** `phase: 1-foundation`, `type: task`, `priority: high`, `component: backend`

### Description
Set up the NestJS API with core modules and middleware.

### Tasks
- [ ] Configure NestJS with proper module structure
- [ ] Set up Swagger/OpenAPI documentation
- [ ] Implement global exception handling
- [ ] Add request validation with class-validator
- [ ] Configure CORS and security headers
- [ ] Set up logging with structured output
- [ ] Create health check endpoint

### Acceptance Criteria
- [ ] API documentation available at /api/docs
- [ ] Validation errors return proper responses
- [ ] Logs are structured and queryable

---

## Issue #7: Environment Configuration

**Labels:** `phase: 1-foundation`, `type: task`, `priority: medium`

### Description
Set up environment configuration for local development and production.

### Tasks
- [ ] Create `.env.example` files
- [ ] Set up environment validation with Zod
- [ ] Configure different environments (dev, staging, prod)
- [ ] Document required environment variables
- [ ] Set up Docker Compose for local development

### Acceptance Criteria
- [ ] App fails fast on missing env vars
- [ ] Docker Compose starts all services
- [ ] Environment docs are complete
