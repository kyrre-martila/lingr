# Lingr — Project Structure

Monorepo architecture, setup conventions and development order

---

# Repository Structure

txt id="w0u7hr" lingr/ ├── apps/ │   ├── mobile/                  # React Native (Expo) │   └── api/                     # Express backend ├── packages/ │   └── shared/                  # Shared types + Zod schemas ├── docs/ │   ├── concept-summary.md │   ├── data-model.md │   ├── api-spec.md │   ├── AI_GUIDE.md │   ├── wireframe-spec.md │   └── user-journey.md ├── .github/ │   └── workflows/ ├── .prettierrc ├── .eslintrc.js ├── package.json └── tsconfig.base.json 

---

# Monorepo Philosophy

Lingr uses a monorepo to keep:

- mobile
- backend
- shared validation
- shared types

In sync.

The goals are:

txt id="mx30h3" - single source of truth - shared schemas - predictable architecture - low cognitive overhead - easy onboarding 

---

# Root Configuration

---

# package.json

json id="r4b5w6" {   "name": "lingr",   "private": true,    "workspaces": [     "apps/*",     "packages/*"   ],    "scripts": {     "mobile": "npm run start --workspace=apps/mobile",     "api": "npm run dev --workspace=apps/api",      "lint": "eslint . --ext .ts,.tsx",     "format": "prettier --write ."   },    "devDependencies": {     "typescript": "^5.0.0",     "prettier": "^3.0.0",     "eslint": "^8.0.0",     "@typescript-eslint/parser": "^6.0.0",     "@typescript-eslint/eslint-plugin": "^6.0.0"   } } 

---

# .prettierrc

json id="m5dc4r" {   "semi": false,   "singleQuote": true,   "trailingComma": "es5",   "printWidth": 100,   "tabWidth": 2,   "useTabs": false,   "bracketSpacing": true,   "arrowParens": "avoid" } 

---

# tsconfig.base.json

json id="f6i2op" {   "compilerOptions": {     "strict": true,     "esModuleInterop": true,     "skipLibCheck": true,     "forceConsistentCasingInFileNames": true,     "resolveJsonModule": true,     "moduleResolution": "bundler"   } } 

---

# .eslintrc.js

js id="j7dr4n" module.exports = {   root: true,    parser: '@typescript-eslint/parser',    plugins: ['@typescript-eslint'],    extends: [     'eslint:recommended',     'plugin:@typescript-eslint/recommended',   ],    rules: {     '@typescript-eslint/no-explicit-any': 'error',     '@typescript-eslint/no-unused-vars': 'error',     'no-console': 'warn',   }, } 

---

# packages/shared

Shared package for:

- TypeScript types
- Zod schemas
- reusable interfaces
- validation contracts

Used by BOTH:

txt id="w81k9t" apps/mobile apps/api 

---

# Shared Structure

txt id="7r8zt5" packages/shared/ ├── src/ │   ├── types/ │   ├── schemas/ │   └── index.ts ├── package.json └── tsconfig.json 

---

# Shared Package Philosophy

The shared package exists to eliminate duplication.

Examples:

txt id="hdy3lf" - one validation schema - one message type - one API contract 

The API and mobile app should never disagree about structure.

---

# Example Shared Type

ts id="x3n44r" export type Layer = 1 | 2 | 3 | 4  export interface Connection {   id: string   currentLayer: Layer    windowActive: boolean    unreadCount: number    partner: {     displayName: string     avatarUrl: string     avatarBlurLevel: number   } } 

---

# Example Shared Schema

ts id="6cbl5q" import { z } from 'zod'  export const SendMessageSchema = z.object({   content: z.string().min(1).max(2000).optional(),   mediaId: z.string().uuid().optional(), }).refine(   data => data.content || data.mediaId,   {     message: 'Message must contain content or media',   } ) 

---

# apps/api

Express.js backend application.

---

# API Structure

txt id="tkl1ki" apps/api/ ├── src/ │   ├── routes/ │   ├── controllers/ │   ├── services/ │   ├── repositories/ │   ├── middleware/ │   ├── socket/ │   ├── jobs/ │   ├── db/ │   ├── utils/ │   ├── constants/ │   ├── app.ts │   └── server.ts ├── package.json └── .env.example 

---

# Backend Architecture Philosophy

Strict separation of concerns.

---

# Routes

Routes only define:

txt id="8mhlm0" - URL - middleware - controller mapping 

No business logic.

---

# Controllers

Controllers:

txt id="wlp8pi" - receive validated requests - call services - return responses 

Controllers should stay small.

---

# Services

Services contain:

txt id="dcjlwm" - business rules - workflows - orchestration - permissions - Layer logic 

Most application complexity belongs here.

---

# Repositories

Repositories contain ONLY:

txt id="2zswut" - SQL queries - persistence logic 

Never business rules.

---

# Middleware

Middleware handles:

txt id="cq6hwm" - auth - validation - rate limiting - error handling - request IDs 

---

# Socket Layer

Socket.io used ONLY for:

txt id="ik3cf0" - real-time chat - typing indicators - layer unlock events - Window activation - Snuggle presence 

Never duplicate REST responsibilities unnecessarily.

---

# Jobs

Background jobs handle:

txt id="ygj6pj" - nightly discovery generation - cleanup tasks - token cleanup - media cleanup - retention policies 

---

# Database Structure

txt id="6r7sz0" db/ ├── client.ts └── migrations/ 

---

# Migration Philosophy

Every schema change must be:

txt id="6o4jlwm" - explicit - versioned - reproducible - committed 

Never manually alter production schema.

---

# apps/mobile

React Native app built with Expo.

---

# Mobile Structure

txt id="nqvk5r" apps/mobile/ ├── app/ ├── components/ ├── hooks/ ├── store/ ├── api/ ├── socket/ ├── constants/ ├── utils/ ├── assets/ └── package.json 

---

# Expo Router

Lingr uses Expo Router.

Navigation is:

txt id="8dggxp" - file-based - predictable - scalable 

Avoid custom navigation complexity unless necessary.

---

# Mobile Screen Groups

txt id="v2n7m9" (auth) (onboarding) (tabs) connection/ glimps/ 

This structure keeps flows isolated and understandable.

---

# Components

Two component categories:

---

# Generic UI Components

txt id="3xg6vr" components/ui/ 

Reusable primitives:

txt id="7l7m2f" Button Input Card Tag Avatar 

---

# Lingr-Specific Components

txt id="e1jlwm" components/lingr/ 

Examples:

txt id="9g4r6l" GlimpsCard SparkButton LayerIndicator PulsePrompt SnuggleButton 

These contain Lingr-specific behavior and emotional UX.

---

# State Management

Lingr uses Zustand.

---

# Global State

Use Zustand ONLY for:

txt id="r4tkh9" - auth session - discovery state - connections - socket state 

---

# Local State

Prefer local component state for:

txt id="v18v7g" - inputs - animations - toggles - temporary UI state 

Avoid globalizing everything.

---

# API Client

Centralized Axios instance.

Responsibilities:

txt id="n3auz9" - token injection - token refresh - error normalization - auth retry flow 

---

# Secure Token Storage

Refresh tokens stored ONLY in:

txt id="vhw1w6" expo-secure-store 

Never AsyncStorage.

---

# Socket Client

Single socket singleton.

Avoid:

txt id="2rjlwm" - duplicate connections - per-screen socket creation 

---

# Assets

txt id="74wlbw" assets/ ├── fonts/ └── images/ 

Fonts are part of the Lingr identity.

Primary typography:

txt id="wjlwm9" Cormorant Garamond DM Sans 

---

# Constants

Centralized design tokens:

txt id="6h2a3i" colors.ts spacing.ts typography.ts 

Never hardcode colors throughout the app.

---

# Design Philosophy

Lingr should visually feel:

txt id="xjlwm0" - calm - warm - quiet - premium - spacious 

Avoid:

txt id="tjlwm7" - loud gradients - flashy interactions - dopamine-heavy animation - gamification aesthetics 

---

# Environment Variables

---

# Backend

Stored in:

txt id="nq2jlwm" apps/api/.env 

Never committed.

---

# Example Environment Variables

env id="1a0wlp" PORT=3000  DATABASE_URL=postgresql://...  JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=...  MEDIA_STORAGE_PATH=/var/lingr/media  GOOGLE_CLIENT_ID=... APPLE_CLIENT_ID=... 

---

# Security Notes

Never commit:

txt id="wlq3n0" - .env - JWT secrets - API credentials - Apple private keys - uploaded media 

---

# First Run Setup

---

# 1. Clone Repository

bash id="j8mjlwm" git clone git@github.com:yourname/lingr.git 

---

# 2. Install Dependencies

bash id="5jlwm9" npm install 

---

# 3. Configure Environment

bash id="7jlwmr" cp apps/api/.env.example apps/api/.env 

Fill in secrets manually.

---

# 4. Create Database

bash id="jlwm56" createdb lingr_dev 

---

# 5. Run Migrations

bash id="jlwm98" npm run migrate --workspace=apps/api 

---

# 6. Start API

bash id="jlwm23" npm run api 

---

# 7. Start Mobile App

bash id="jlwm78" npm run mobile 

---

# Migration Tracking

Migrations tracked in:

sql id="jlwm44" CREATE TABLE migrations (   id SERIAL PRIMARY KEY,   filename TEXT NOT NULL UNIQUE,   applied_at TIMESTAMPTZ DEFAULT NOW() ); 

---

# Git Conventions

---

# Branch Naming

txt id="jlwm89" feature/glimps-upload feature/spark-flow fix/layer-calculation chore/dependency-update 

---

# Commit Messages

txt id="jlwm66" feat: add spark endpoint fix: correct layer unlock logic docs: update API specification chore: upgrade Expo SDK 

---

# Never Commit

txt id="jlwm12" node_modules/ dist/ .env media uploads generated secrets 

---

# Development Philosophy

Build Lingr in layers.

Not all at once.

Prioritize:

txt id="jlwm45" 1. foundations 2. privacy 3. architecture 4. emotional UX 5. polish 

---

# Recommended Development Order

txt id="jlwm90" 1. Monorepo setup 2. Shared schemas/types 3. Database migrations 4. Authentication 5. Onboarding 6. Glimps uploads 7. Discovery generation 8. Spark system 9. Connections 10. Layer progression 11. Chat 12. Pulse 13. Window 14. Snuggle 15. Final polish 

---

# Codex Session Philosophy

Each Codex session should focus on ONE bounded problem.

Good:

txt id="jlwm34" Build Spark service Build Layer calculation Build Glimps upload flow 

Bad:

txt id="jlwm55" Build the entire app 

---

# Final Principle

The architecture should feel like the product itself:

txt id="jlwm87" - calm - intentional - understandable - human 

If the codebase becomes noisy,
the product eventually will too.

---

Document version: 1.1
