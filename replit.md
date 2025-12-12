# AgentAssets - Single Property Website Builder

## Overview

AgentAssets is a platform enabling real estate agents to create and manage customizable single property websites (microsites) for their listings. It features a credit-based system for site creation, custom themes, and branding options, aiming to provide a comprehensive solution for showcasing properties online. The project's ambition is to empower real estate professionals with an easy-to-use tool to enhance their digital presence and marketing efforts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript using Vite, featuring Shadcn/ui (Radix UI + Tailwind CSS) for UI components with a sage green color palette. Wouter handles client-side routing. State management relies on TanStack Query for server state and component state. Forms are managed with React Hook Form and Zod for validation. A multi-step wizard guides site creation, and the design is responsive and mobile-first.

### Backend

The backend utilizes Express.js with TypeScript, providing a RESTful API with JSON for communication. It implements a service-based architecture with a repository pattern for data access abstraction (`IStorage`). Zod is used for API request validation, and a centralized middleware handles error logging and processing.

### Data Storage

PostgreSQL, accessed via Neon serverless driver and Drizzle ORM, is used for data persistence. The schema, defined in `shared/schema.ts`, includes `Users`, `Sites`, `Themes`, `Leads`, `SitePasswords`, `SiteDailyStats`, `SiteTrafficSources`, and `PartnerMemberships`. Key features include a two-tier logo management system (user default and site-specific override), collision-resistant slug generation for site URLs, and support for custom domains. Drizzle Kit is used for schema migrations.

### Data Flow

Client API requests via TanStack Query are validated by Zod in Express routes, which then interact with the `DatabaseStorage` class (implementing `IStorage`). Drizzle ORM executes type-safe queries against PostgreSQL. Responses are cached by TanStack Query, updating the UI.

### Key Features and Design Patterns

- **Authentication & Authorization**: Currently uses a demo user system with a hardcoded `DEMO_USER_ID`, with provisions for future multi-user expansion. An `/admin` panel manages preset themes.
- **Asset Management**: Static assets are stored locally, and a custom Vite plugin handles Replit-specific deployment URLs for social sharing.
- **Email System**: Nodemailer sends email notifications for lead submissions and monthly analytics summaries, with secure SMTP configuration via environment variables.
- **Leads/Inquiries System**: Stores contact form submissions in a `leads` table, accessible via API.
- **Password Protection System**: Allows sites to be protected with multiple bcrypt-hashed passwords, managed by site owners, and verified via a public endpoint. Password usage is tracked.
- **Monthly Analytics Email System**: Automated monthly emails summarizing site analytics for users, triggered by a node-cron scheduler.
- **Analytics Tracking System**: Tracks page views, unique visitors, and traffic sources for published sites, storing data in `sites.stats` (JSONB) and `site_daily_stats` tables. Provides daily stats and traffic source breakdown for dashboard charts.
- **Partner Membership System**: Integrates with partners (e.g., ATXPocket) via webhooks to provide membership-based discounts on credit packages, using HMAC-SHA256 for security and email matching for user identification.

## External Dependencies

### Third-Party Services

- **Database Hosting**: Neon Postgres (serverless).
- **Deployment Platform**: Replit (with custom Vite plugins for Replit-specific features).

### Key NPM Packages

- **Backend**: `express`, `drizzle-orm`, `@neondatabase/serverless`, `zod`, `drizzle-zod`, `ws`.
- **Frontend**: `react`, `react-dom`, `@tanstack/react-query`, `wouter`, `react-hook-form`, `@hookform/resolvers`, `@radix-ui/*`, `tailwindcss`, `lucide-react`, `recharts`.
- **Build Tools**: `vite`, `esbuild`, `tsx`, `drizzle-kit`.

### External Integrations

- **Email Sending**: Nodemailer (via custom SMTP configuration).
- **Partner Webhooks**: Integration with partners like ATXPocket for membership synchronization (HMAC-SHA256 verified).