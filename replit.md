# AgentAssets - Single Property Website Builder

## Overview

AgentAssets is a platform for real estate agents to create beautiful single property websites (microsites) to showcase their listings. The application allows users to create, customize, and manage property websites with custom themes, templates, and branding. Built as a full-stack TypeScript application with a React frontend and Express backend, it features a credit-based system where users purchase credits to create new property sites.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: Shadcn/ui (Radix UI primitives) with Tailwind CSS for styling. The design system uses a sage green color palette (#558B73 primary) with custom CSS variables for theming.

**Routing**: Wouter for lightweight client-side routing with pages for home, dashboard, site creation wizard, theme management, credits/pricing, admin panel, and individual site views.

**State Management**: TanStack Query (React Query) for server state management with optimistic updates and cache invalidation. No global state management library needed - component state and query cache handle all application state.

**Form Handling**: React Hook Form with Zod validation for type-safe form schemas.

**Key Design Patterns**:
- Multi-step wizard pattern for site creation (property details → template selection → branding → review)
- Responsive design with mobile-first approach
- Shared component library in `client/src/components/ui/`
- Path aliases configured (`@/` for client, `@shared/` for shared code)

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API with routes organized by resource (users, sites, themes). JSON request/response format with standard HTTP status codes.

**Error Handling**: Centralized error handling middleware with request/response logging. Zod validation for API request validation with structured error responses.

**Key Design Patterns**:
- Repository pattern via `IStorage` interface for data access abstraction
- Service-based architecture separating storage layer from HTTP routes
- Middleware-based request processing (JSON parsing, logging, static file serving)
- Development vs. production build separation (Vite dev server vs. compiled static assets)

### Data Storage

**Database**: PostgreSQL via Neon serverless driver with WebSocket support for connection pooling.

**ORM**: Drizzle ORM for type-safe database queries and schema management. Schema definitions in `shared/schema.ts` create shared types between frontend and backend.

**Schema Design**:
- **Users**: ID, name, email, credits, logo (default logo URL), timestamps. Credits track available site creation capacity.
- **Sites**: Property details (address, price, bedrooms, etc.), associated user, theme, template, custom domain, logo (per-site override), analytics stats (views, unique visitors, leads), timestamps.
- **Themes**: Preset and custom themes with color palettes and optional logos. Preset themes (userId null) available to all users, custom themes tied to specific users.

**Logo Management**: Two-tier logo system with user defaults and site-level overrides:
- Users upload a default logo in the dashboard (stored in `users.logo`)
- Individual sites can override with a site-specific logo (stored in `sites.logo`)
- API returns `effectiveLogo` (site logo with fallback to user default) for frontend display
- Layouts display the effective logo in navigation/hero sections

**Migration Strategy**: Drizzle Kit handles schema migrations with `npm run db:push` command.

### Data Flow Architecture

1. Client makes API request via TanStack Query hooks (`useUser`, `useSites`, `useCreateSite`, etc.)
2. Express routes in `server/routes.ts` validate request with Zod schemas
3. Routes call `storage` methods (DatabaseStorage class implementing IStorage interface)
4. Drizzle ORM executes type-safe queries against PostgreSQL
5. Response flows back through middleware to client
6. TanStack Query caches response and triggers UI updates

**Why This Approach**: Separating storage interface from implementation allows for future database swaps or caching layers without changing route logic. Shared Zod schemas ensure validation consistency between client forms and API endpoints.

### Authentication & Authorization

Currently uses a demo user system with hardcoded `DEMO_USER_ID`. Authentication infrastructure is minimal - designed for single-user demo or future expansion to multi-user with passport/session management (dependencies installed but not implemented).

**Admin Access**: Basic admin panel at `/admin` for managing preset themes (no authentication required currently).

### Asset Management

**Static Assets**: Stored in `attached_assets/` directory with generated images for templates and hero backgrounds.

**Public Assets**: Served from `client/public/` including favicon and OpenGraph images.

**Image Handling**: Custom Vite plugin (`vite-plugin-meta-images.ts`) updates meta tags with correct Replit deployment URLs for social sharing.

## External Dependencies

### Third-Party Services

**Database Hosting**: Neon Postgres serverless database (expects `DATABASE_URL` environment variable).

**Deployment Platform**: Designed for Replit deployment with custom Vite plugins for Replit-specific features (cartographer, dev banner, error overlay).

### Key NPM Packages

**Backend**:
- `express` - HTTP server framework
- `drizzle-orm` + `@neondatabase/serverless` - Database ORM and driver
- `zod` + `drizzle-zod` - Runtime validation and schema generation
- `ws` - WebSocket support for Neon database connections

**Frontend**:
- `react` + `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `react-hook-form` + `@hookform/resolvers` - Form management
- `@radix-ui/*` - Headless UI primitives (30+ packages)
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `recharts` - Charts for analytics dashboard

**Build Tools**:
- `vite` - Frontend build tool and dev server
- `esbuild` - Backend bundling for production
- `tsx` - TypeScript execution for development
- `drizzle-kit` - Database migration tool

### External Integrations

**Email Sending (TODO)**: Contact form submissions are currently stored in the `leads` table but email notifications to site owners are not yet implemented. To enable email notifications:
1. Set up Resend or SendGrid integration via Replit's integration panel
2. Update the `/api/leads` endpoint in `server/routes.ts` to send email notifications
3. The email should be sent to the site owner's email address (found via `site.userId` → `users.email`)

Payment processing (Stripe), email services (Nodemailer), and session storage (connect-pg-simple) dependencies are installed but not actively used - suggesting future planned features for production deployment.

### Leads/Inquiries System

Contact form submissions from property sites are stored in the `leads` table:
- Public endpoint `POST /api/leads` accepts form submissions
- Authenticated users can view their leads via `GET /api/leads`
- Site-specific leads available at `GET /api/sites/:siteId/leads`
- Lead count is tracked in site analytics (`site.stats.leads`)