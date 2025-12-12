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
- **Users**: ID, name, email, credits (default 0), logo (default logo URL), timestamps. New users start with 0 credits and must purchase credits to create sites.
- **Sites**: Property details (address, price, bedrooms, etc.), associated user, theme, template, subdomain, custom domain, logo (per-site override), analytics stats (views, unique visitors, leads), timestamps.
- **Themes**: Preset and custom themes with color palettes and optional logos. Preset themes (userId null) available to all users, custom themes tied to specific users.

**Site URL System**:
- Each site gets a unique slug like `3401-toro-canyon-9fb28b69` (address + random hex suffix)
- Default URLs use path-based format: `agentassets.com/p/3401-toro-canyon-9fb28b69`
- Custom domains (e.g., `www.410brookhaven.com`) are supported and take priority when set
- Custom domain detection in frontend routes directly to SubdomainSiteView component
- Path-based URLs use SlugSiteView component via `/p/:slug` route
- Dashboard displays site URLs with copy button (custom domain if set, otherwise path-based URL)
- Collision-resistant slug generation: retries up to 5 times on unique constraint violation

**Logo Management**: Two-tier logo system with user defaults and site-level overrides:
- Users upload a default logo in the dashboard (stored in `users.logo`)
- Individual sites can override with a site-specific logo (stored in `sites.logo`)
- API returns `effectiveLogo` (site logo with fallback to user default) for frontend display
- API returns `effectiveHeroLogo` (heroLogo with fallback to site logo, then user logo) for Modern layout hero
- Layouts display the effective logo in navigation/hero sections

**Modern Layout Features**:
- Hero slider with fade transitions between up to 3 customizable slides (title, subtitle, background image)
- Transparent navigation that becomes solid white with animated logo transition on scroll
- Hero logo (70px) switches to regular profile logo (48px) when scrolled
- All text uses Google Font "Outfit"
- Slide titles at 46px with subtle drop-shadow
- Lighter gradient overlay on hero for better image visibility
- "Have a look" CTA button scrolls to property details

**Magazine Layout Features**:
- Full-screen hero with gradient overlay displaying price, address, and buyer agent compensation
- Typography uses Playfair Display (serif) for headings and Source Sans Pro (sans-serif) for body
- Transparent navigation that becomes solid white on scroll
- Facts bar below hero with property stats (bedrooms, bathrooms, sqft, year built, lot size) in primary theme color
- Two-row infinite marquee photo gallery (top row scrolls left, bottom row scrolls right)
- Tabbed content section for Brochure and Documents downloads
- Open Houses section with formatted date/time display
- Contact section with agent info and lead capture form
- Supports Magazine-specific fields: buyerAgentComp, openHouses array, brochureUrl

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

**Email Sending**: When a lead submits an inquiry via the contact form, an email notification is automatically sent to the site owner (found via `site.userId` → `users.email`). Email is sent using Nodemailer with custom SMTP configuration:
- SMTP settings stored in environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM`
- SMTP password stored securely as `SMTP_PASSWORD` secret
- Email service located in `server/email.ts` with HTML and text templates
- User input is HTML-escaped to prevent injection attacks
- Email failures are logged but don't block lead submission (graceful degradation)

Payment processing (Stripe) and session storage (connect-pg-simple) dependencies are installed but not actively used - suggesting future planned features for production deployment.

### Leads/Inquiries System

Contact form submissions from property sites are stored in the `leads` table:
- Public endpoint `POST /api/leads` accepts form submissions
- Authenticated users can view their leads via `GET /api/leads`
- Site-specific leads available at `GET /api/sites/:siteId/leads`
- Lead count is tracked in site analytics (`site.stats.leads`)

### Password Protection System

Sites can be protected with multiple passwords, each with optional labels and usage tracking:
- **Schema**: `site_passwords` table with id, siteId, passwordHash, label, usageCount, lastUsedAt, createdAt
- **Security**: Passwords hashed with bcrypt (12 salt rounds), never stored in plaintext
- **Management**: Site owners manage passwords in Edit Site step 4 "Password" tab
- **Verification**: Public endpoint `POST /api/sites/:siteId/verify-password` checks password and stores unlock state in session
- **Gating**: PasswordGate component checks protection status and shows unlock form before rendering protected content
- **Analytics**: Dashboard analytics dialog shows password usage stats (label, usage count, last used date) for each site
- **Session Persistence**: Once unlocked, sites stay unlocked for the browser session

### Monthly Analytics Email System

Automated monthly emails summarizing site analytics for all users:
- **Scheduler**: `server/scheduler.ts` uses node-cron to run on the 1st of each month at 9:00 AM
- **Email Template**: Beautiful HTML email with summary stats (active sites, total views, visitors, leads) and per-site breakdown
- **User Tracking**: `users.lastAnalyticsEmailAt` column prevents duplicate sends within the same month
- **Storage Methods**: `getUsersForAnalyticsEmail()` finds eligible users, `markAnalyticsEmailSent()` updates timestamp
- **Admin Trigger**: `POST /api/admin/send-analytics-emails` allows admins to manually trigger emails (optional `userId` for single user)
- **Rate Limiting**: 500ms delay between emails to avoid SMTP rate limits
- **Graceful Handling**: Users with no sites receive a friendly message encouraging them to create their first site

### Analytics Tracking System

Page view and visitor tracking for published property sites:
- **Tracking Endpoint**: `POST /api/sites/:id/track-view` increments views and unique visitors
- **Session-Based**: Uses server session to track unique visitors (one count per session per site)
- **Frontend Integration**: SiteView component tracks on mount, uses sessionStorage to avoid duplicate calls
- **Stats Storage**: Site stats stored in `sites.stats` JSONB column with views, uniqueVisitors, leads counts
- **Daily Stats**: `site_daily_stats` table tracks per-day views and visitors with unique constraint on (site_id, date)
- **Daily Stats API**: `GET /api/sites/:siteId/daily-stats?days=7` retrieves daily breakdown for charts
- **Atomic Upsert**: Daily stats use ON CONFLICT DO UPDATE for race-condition-safe increments
- **Dashboard Chart**: Shows last 7 days of page views with bar chart visualization
- **Published Only**: Only tracks views for sites with status = 'published'

### Partner Membership System (ATXPocket Integration)

Partner organizations can sync their paying members to receive automatic discounts on credit packages:
- **Schema**: `partner_memberships` table with partnerKey, email, memberId, isActive, discountPercent, expiresAt, syncedAt
- **Webhook Endpoint**: `POST /api/webhooks/partner/:partnerKey` receives membership status updates from partners
- **Security**: HMAC-SHA256 signature verification using partner-specific secrets (`WEBHOOK_SECRET_ATXPOCKET`)
- **Webhook Actions**: `activate`, `deactivate`, `update` to manage membership status
  - `activate`: Creates/updates membership with discount enabled
  - `deactivate`: Only removes the discount for future purchases - does NOT affect user's account or existing credits
  - `update`: Modifies discount percent or expiration date
- **Discount Application**: Credits page shows discounted prices with partner badge when discount is active
- **API**: `GET /api/user/partner-discount` returns active discount percent for authenticated user
- **Email Matching**: Memberships matched by email address (case-insensitive)
- **Expiration**: Optional expiration date prevents stale memberships from applying discounts