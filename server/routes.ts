import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertSiteSchema, insertThemeSchema, insertLayoutSchema, insertLeadSchema, insertCouponSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import archiver from "archiver";
import { sendLeadNotificationEmail } from "./email";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/zip': '.zip',
  };
  return mimeToExt[mimeType] || '';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (username/password)
  setupAuth(app);

  // Credits route - update user credits (protected)
  app.patch("/api/user/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { credits } = req.body;
      if (typeof credits !== 'number') {
        return res.status(400).json({ error: "Credits must be a number" });
      }
      const user = await storage.updateUserCredits(userId, credits);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update credits" });
    }
  });

  // User logo route - update user's default logo (protected)
  app.patch("/api/user/logo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { logo } = req.body;
      if (logo !== null && typeof logo !== 'string') {
        return res.status(400).json({ error: "Logo must be a string or null" });
      }
      const user = await storage.updateUserLogo(userId, logo);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update logo" });
    }
  });

  // User profile route - update user's full profile (protected)
  const updateProfileSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().nullable(),
    brokerage: z.string().optional().nullable(),
    teamName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    profileImageUrl: z.string().optional().nullable(),
    socialMedia: z.object({
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      x: z.string().optional(),
    }).optional().nullable(),
  });
  
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = updateProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid profile data", details: result.error.issues });
      }
      const user = await storage.updateUserProfile(userId, result.data);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Site routes (protected)
  app.get("/api/sites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sites = await storage.getSitesByUser(userId);
      res.json(sites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  // Lookup site by host (subdomain or custom domain) - used for custom domain routing
  app.get("/api/sites/by-host/:host", async (req, res) => {
    try {
      const host = req.params.host.toLowerCase();
      const site = await storage.getSiteByHost(host);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      // Get user for logo fallbacks and agent info
      const user = site.userId ? await storage.getUser(site.userId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo)
      const effectiveLogo = site.logo || user?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || null;
      
      // Include agent info for contact section
      const agentInfo = user ? {
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
        profileImageUrl: user.profileImageUrl || null,
        brokerage: user.brokerage || null,
        teamName: user.teamName || null,
        address: user.address || null,
        socialMedia: user.socialMedia || null,
      } : null;
      
      res.json({ ...site, effectiveLogo, effectiveHeroLogo, agentInfo });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  // Check if a slug is available
  app.get("/api/sites/check-slug/:slug", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const slug = req.params.slug.toLowerCase();
      const siteId = req.query.siteId as string | undefined;
      
      // Validate slug format
      const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
      if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 50) {
        return res.json({ 
          available: false, 
          reason: "Slug must be 3-50 characters, only lowercase letters, numbers, and dashes"
        });
      }
      
      // If siteId is provided, verify ownership before allowing it to bypass conflict check
      let validatedSiteId: string | undefined = undefined;
      if (siteId) {
        const site = await storage.getSite(siteId);
        if (site && site.userId === userId) {
          validatedSiteId = siteId;
        }
      }
      
      const available = await storage.isSlugAvailable(slug, validatedSiteId);
      res.json({ available, reason: available ? null : "This URL is already taken" });
    } catch (error) {
      res.status(500).json({ error: "Failed to check slug availability" });
    }
  });

  // Update site slug
  app.patch("/api/sites/:id/slug", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const siteId = req.params.id;
      const { slug } = req.body;
      
      // Verify site ownership
      const site = await storage.getSite(siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Validate and normalize slug
      const normalizedSlug = slug.toLowerCase().trim();
      const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
      if (!slugRegex.test(normalizedSlug) || normalizedSlug.length < 3 || normalizedSlug.length > 50) {
        return res.status(400).json({ 
          error: "Slug must be 3-50 characters, only lowercase letters, numbers, and dashes"
        });
      }
      
      // Check availability
      const available = await storage.isSlugAvailable(normalizedSlug, siteId);
      if (!available) {
        return res.status(409).json({ error: "This URL is already taken" });
      }
      
      const updatedSite = await storage.updateSiteSlug(siteId, normalizedSlug);
      res.json(updatedSite);
    } catch (error) {
      res.status(500).json({ error: "Failed to update slug" });
    }
  });

  // Lookup site by slug (subdomain value) - used for path-based URLs like /p/:slug
  app.get("/api/sites/by-slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug.toLowerCase();
      const site = await storage.getSiteBySubdomain(slug);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      // Get user for logo fallbacks and agent info
      const user = site.userId ? await storage.getUser(site.userId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo)
      const effectiveLogo = site.logo || user?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || null;
      
      // Include agent info for contact section
      const agentInfo = user ? {
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
        profileImageUrl: user.profileImageUrl || null,
        brokerage: user.brokerage || null,
        teamName: user.teamName || null,
        address: user.address || null,
        socialMedia: user.socialMedia || null,
      } : null;
      
      res.json({ ...site, effectiveLogo, effectiveHeroLogo, agentInfo });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  // Public site view (for viewing published sites)
  app.get("/api/sites/:id", async (req, res) => {
    try {
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      // Get user for logo fallbacks and agent info
      const user = site.userId ? await storage.getUser(site.userId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo)
      const effectiveLogo = site.logo || user?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || null;
      
      // Include agent info for contact section
      const agentInfo = user ? {
        name: user.name || null,
        email: user.email || null,
        phone: user.phone || null,
        profileImageUrl: user.profileImageUrl || null,
        brokerage: user.brokerage || null,
        teamName: user.teamName || null,
        address: user.address || null,
        socialMedia: user.socialMedia || null,
      } : null;
      
      res.json({ ...site, effectiveLogo, effectiveHeroLogo, agentInfo });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  app.post("/api/sites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Extract control flag before validation
      const { useTrialCredit, ...siteData } = req.body;
      const wantsTrialCredit = useTrialCredit === true;
      
      // Check for available credits
      const hasRegularCredits = user.credits > 0;
      // Allow trial if user has trial credits and either trialEndsAt is in the future, or it's null (new user)
      const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const isTrialValid = trialEndsAt > new Date();
      const hasTrialCredits = (user.trialCredits || 0) > 0 && isTrialValid;
      
      if (!hasRegularCredits && !hasTrialCredits) {
        return res.status(403).json({ error: "Insufficient credits. Purchase credits to create new sites." });
      }
      
      // Determine which credit type to use
      const shouldUseTrial = wantsTrialCredit && hasTrialCredits;
      
      // Validate site data without the control flag
      const validated = insertSiteSchema.parse({ ...siteData, userId });
      
      let site;
      if (shouldUseTrial) {
        // Create trial site with 7-day expiration (uses user's trialEndsAt or a new 7-day window)
        site = await storage.createTrialSite(validated, trialEndsAt);
        // Decrement trial credits
        await storage.updateUserTrialCredits(userId, (user.trialCredits || 1) - 1);
      } else if (hasRegularCredits) {
        // Create regular site with 3-month expiration (default)
        site = await storage.createSite(validated);
        // Decrement regular credits
        await storage.updateUserCredits(userId, user.credits - 1);
      } else {
        return res.status(403).json({ error: "Insufficient credits" });
      }
      
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Failed to create site:", error);
      res.status(500).json({ error: "Failed to create site" });
    }
  });

  app.patch("/api/sites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.updateSite(req.params.id, req.body);
      res.json(site);
    } catch (error) {
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteSite(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete site" });
    }
  });

  // Unpublish a site (protected)
  app.post("/api/sites/:id/unpublish", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const site = await storage.getSite(req.params.id);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      if (site.userId !== userId) {
        return res.status(403).json({ error: "You can only unpublish your own sites" });
      }
      
      if (site.status !== 'published') {
        return res.status(400).json({ error: "Site is not currently published" });
      }
      
      const updatedSite = await storage.unpublishSite(req.params.id);
      res.json(updatedSite);
    } catch (error) {
      console.error("Failed to unpublish site:", error);
      res.status(500).json({ error: "Failed to unpublish site" });
    }
  });

  // Republish a site (protected)
  app.post("/api/sites/:id/republish", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const site = await storage.getSite(req.params.id);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      if (site.userId !== userId) {
        return res.status(403).json({ error: "You can only republish your own sites" });
      }
      
      if (site.status === 'published') {
        return res.status(400).json({ error: "Site is already published" });
      }
      
      // Check if site has expired
      if (site.expiresAt && new Date(site.expiresAt) < new Date()) {
        return res.status(403).json({ error: "Site has expired. Please create a new site or purchase a renewal." });
      }
      
      const updatedSite = await storage.republishSite(req.params.id);
      res.json(updatedSite);
    } catch (error) {
      console.error("Failed to republish site:", error);
      res.status(500).json({ error: "Failed to republish site" });
    }
  });

  // Theme routes
  app.get("/api/themes", async (req, res) => {
    try {
      const { userId, preset } = req.query;
      
      if (preset === 'true') {
        const themes = await storage.getPresetThemes();
        return res.json(themes);
      }
      
      if (userId && typeof userId === 'string') {
        const themes = await storage.getThemesByUser(userId);
        return res.json(themes);
      }
      
      const themes = await storage.getAllThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch themes" });
    }
  });

  app.get("/api/themes/:id", async (req, res) => {
    try {
      const theme = await storage.getTheme(req.params.id);
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.post("/api/themes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertThemeSchema.parse({ ...req.body, userId });
      const theme = await storage.createTheme(validated);
      res.status(201).json(theme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create theme" });
    }
  });

  app.patch("/api/themes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const theme = await storage.getTheme(req.params.id);
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      // Allow editing preset themes (userId null) or user's own themes
      if (theme.userId !== null && theme.userId !== req.user.id) {
        return res.status(403).json({ error: "You can only edit your own themes" });
      }
      const updated = await storage.updateTheme(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update theme" });
    }
  });

  app.delete("/api/themes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const theme = await storage.getTheme(req.params.id);
      if (!theme) {
        return res.status(404).json({ error: "Theme not found" });
      }
      // Allow deleting preset themes (userId null) or user's own themes
      if (theme.userId !== null && theme.userId !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own themes" });
      }
      await storage.deleteTheme(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete theme" });
    }
  });

  // Layout routes
  app.get("/api/layouts", async (req, res) => {
    try {
      const { preset, userId, enabledOnly } = req.query;
      
      if (preset === 'true') {
        // If enabledOnly=true, only return enabled layouts (for regular users)
        // If enabledOnly=false or not specified, return all layouts (for admin)
        if (enabledOnly === 'true') {
          const layouts = await storage.getEnabledPresetLayouts();
          return res.json(layouts);
        }
        const layouts = await storage.getPresetLayouts();
        return res.json(layouts);
      }
      
      if (userId && typeof userId === 'string') {
        const layouts = await storage.getLayoutsByUser(userId);
        return res.json(layouts);
      }
      
      const layouts = await storage.getAllLayouts();
      res.json(layouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch layouts" });
    }
  });

  app.get("/api/layouts/:id", async (req, res) => {
    try {
      const layout = await storage.getLayout(req.params.id);
      if (!layout) {
        return res.status(404).json({ error: "Layout not found" });
      }
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch layout" });
    }
  });

  app.post("/api/layouts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertLayoutSchema.parse({ ...req.body, userId });
      const layout = await storage.createLayout(validated);
      res.status(201).json(layout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create layout" });
    }
  });

  app.patch("/api/layouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const layout = await storage.updateLayout(req.params.id, req.body);
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: "Failed to update layout" });
    }
  });

  app.delete("/api/layouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteLayout(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete layout" });
    }
  });

  // Lead/Inquiry routes - public submission, authenticated viewing
  app.post("/api/leads", async (req, res) => {
    try {
      const validated = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validated);
      
      // Update site stats to increment leads count
      const site = await storage.getSite(validated.siteId);
      if (site && site.stats) {
        await storage.updateSiteStats(validated.siteId, {
          ...site.stats,
          leads: (site.stats.leads || 0) + 1
        });
      }
      
      // Send email notification to site owner
      if (site && site.userId) {
        const siteOwner = await storage.getUser(site.userId);
        if (siteOwner && siteOwner.email) {
          sendLeadNotificationEmail({
            recipientEmail: siteOwner.email,
            recipientName: siteOwner.name || 'Agent',
            propertyAddress: site.address,
            propertyTitle: site.title || '',
            leadFirstName: validated.firstName,
            leadLastName: validated.lastName,
            leadEmail: validated.email,
            leadPhone: validated.phone,
            leadMessage: validated.message,
          }).catch(err => {
            console.error('Failed to send lead email notification:', err);
          });
        }
      }
      
      res.status(201).json({ success: true, lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  app.get("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const leads = await storage.getLeadsByUser(userId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/sites/:siteId/leads", isAuthenticated, async (req: any, res) => {
    try {
      const leads = await storage.getLeadsBySite(req.params.siteId);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Site password management routes
  app.get("/api/sites/:siteId/passwords", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      if (site.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const passwords = await storage.getSitePasswords(req.params.siteId);
      res.json(passwords.map(p => ({
        id: p.id,
        label: p.label,
        usageCount: p.usageCount,
        lastUsedAt: p.lastUsedAt,
        createdAt: p.createdAt
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch passwords" });
    }
  });

  const createPasswordSchema = z.object({
    password: z.string().min(4).max(50),
    label: z.string().max(50).optional()
  });

  app.post("/api/sites/:siteId/passwords", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      if (site.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const validated = createPasswordSchema.parse(req.body);
      const newPassword = await storage.createSitePassword({
        siteId: req.params.siteId,
        passwordHash: validated.password,
        label: validated.label || null
      });
      
      res.status(201).json({
        id: newPassword.id,
        label: newPassword.label,
        usageCount: newPassword.usageCount,
        lastUsedAt: newPassword.lastUsedAt,
        createdAt: newPassword.createdAt
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create password" });
    }
  });

  app.delete("/api/sites/:siteId/passwords/:passwordId", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      if (site.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await storage.deleteSitePassword(req.params.passwordId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete password" });
    }
  });

  // Public password verification endpoint
  const verifyPasswordSchema = z.object({
    password: z.string()
  });

  app.post("/api/sites/:siteId/verify-password", async (req, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      const validated = verifyPasswordSchema.parse(req.body);
      const matchedPassword = await storage.verifySitePassword(req.params.siteId, validated.password);
      
      if (matchedPassword) {
        await storage.incrementPasswordUsage(matchedPassword.id);
        res.json({ 
          success: true,
          accessToken: Buffer.from(`${req.params.siteId}:${Date.now()}`).toString('base64')
        });
      } else {
        res.status(401).json({ success: false, error: "Invalid password" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to verify password" });
    }
  });

  // Check if site is password protected (public)
  app.get("/api/sites/:siteId/protected", async (req, res) => {
    try {
      const passwords = await storage.getSitePasswords(req.params.siteId);
      res.json({ isProtected: passwords.length > 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to check protection status" });
    }
  });

  // Partner webhook endpoint for ATXPocket membership sync
  const partnerWebhookSchema = z.object({
    action: z.enum(["activate", "deactivate", "update"]),
    email: z.string().email(),
    member_id: z.string().optional(),
    discount_percent: z.number().min(0).max(100).optional().default(20),
    expires_at: z.string().datetime().optional().nullable(),
  });

  app.post("/api/webhooks/partner/:partnerKey", async (req, res) => {
    try {
      const { partnerKey } = req.params;
      
      // Verify HMAC signature
      const signature = req.headers["x-webhook-signature"] as string;
      const webhookSecret = process.env[`WEBHOOK_SECRET_${partnerKey.toUpperCase()}`];
      
      if (!webhookSecret) {
        console.warn(`No webhook secret configured for partner: ${partnerKey}`);
        return res.status(401).json({ error: "Invalid partner key" });
      }
      
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");
      
      // Validate signature (handle length mismatch safely)
      if (!signature || signature.length !== expectedSignature.length) {
        return res.status(401).json({ error: "Invalid signature" });
      }
      
      try {
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
          return res.status(401).json({ error: "Invalid signature" });
        }
      } catch {
        return res.status(401).json({ error: "Invalid signature" });
      }
      
      const validated = partnerWebhookSchema.parse(req.body);
      
      if (validated.action === "deactivate") {
        await storage.deactivatePartnerMembership(partnerKey, validated.email);
        console.log(`Deactivated ${partnerKey} membership for ${validated.email}`);
      } else {
        await storage.upsertPartnerMembership({
          partnerKey,
          email: validated.email,
          memberId: validated.member_id || null,
          isActive: validated.action === "activate" || validated.action === "update",
          discountPercent: validated.discount_percent,
          expiresAt: validated.expires_at ? new Date(validated.expires_at) : null,
        });
        console.log(`${validated.action}d ${partnerKey} membership for ${validated.email} (${validated.discount_percent}% discount)`);
      }
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Partner webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Get current user's partner discount (authenticated)
  app.get("/api/user/partner-discount", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.email) {
        return res.json({ discount: null });
      }
      
      const discount = await storage.getActivePartnerDiscount(user.email);
      res.json({ discount });
    } catch (error) {
      res.status(500).json({ error: "Failed to check partner discount" });
    }
  });

  // Stripe routes
  const CREDIT_PACKAGES = [
    { id: 'starter', name: 'Starter', credits: 1, price: 29 },
    { id: 'growth', name: 'Growth', credits: 5, price: 125 },
    { id: 'agency', name: 'Agency', credits: 10, price: 200 },
  ];

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Failed to get Stripe publishable key:", error);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  const checkoutSchema = z.object({
    packageId: z.enum(['starter', 'growth', 'agency']),
  });

  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const validated = checkoutSchema.parse(req.body);
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const pkg = CREDIT_PACKAGES.find(p => p.id === validated.packageId);
      if (!pkg) {
        return res.status(400).json({ error: "Invalid package" });
      }

      const stripe = await getUncachableStripeClient();
      
      let finalPrice = pkg.price;
      
      if (user.email) {
        const discount = await storage.getActivePartnerDiscount(user.email);
        if (discount) {
          finalPrice = Math.floor(pkg.price * (1 - discount / 100));
        }
      }

      // Use custom BASE_URL if set, otherwise fall back to REPLIT_DOMAINS
      let baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
        baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.name} - ${pkg.credits} Credit${pkg.credits > 1 ? 's' : ''}`,
              description: `Purchase ${pkg.credits} credit${pkg.credits > 1 ? 's' : ''} for AgentAssets`,
            },
            unit_amount: finalPrice * 100,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/credits?success=true&credits=${pkg.credits}`,
        cancel_url: `${baseUrl}/credits?canceled=true`,
        metadata: {
          userId: user.id,
          credits: pkg.credits.toString(),
          packageId: pkg.id,
        },
        customer_email: user.email || undefined,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/checkout-success", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      if (!userId || userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserCredits(user.id, user.credits + credits);
      }

      res.json({ success: true, credits });
    } catch (error) {
      console.error("Checkout success error:", error);
      res.status(500).json({ error: "Failed to process checkout" });
    }
  });

  // Download all documents as zip
  app.get("/api/sites/:siteId/documents/download-all", async (req, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const documents = site.documents || [];
      if (documents.length === 0) {
        return res.status(400).json({ error: "No documents to download" });
      }

      const objectStorageService = new ObjectStorageService();
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${site.title || 'property'}-documents.zip"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      for (const doc of documents) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(doc.url);
          const [metadata] = await objectFile.getMetadata();
          const extension = metadata.contentType ? getExtensionFromMime(metadata.contentType) : '';
          const filename = `${doc.name}${extension}`;
          
          archive.append(objectFile.createReadStream(), { name: filename });
        } catch (error) {
          console.error(`Error adding document ${doc.name} to archive:`, error);
        }
      }

      await archive.finalize();
    } catch (error) {
      console.error("Error creating documents zip:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create documents archive" });
      }
    }
  });

  // Object storage routes for photo uploads
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded objects (public access for property photos)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Update site photos
  app.post("/api/sites/:id/photos", isAuthenticated, async (req: any, res) => {
    try {
      const { photoUrl } = req.body;
      if (!photoUrl) {
        return res.status(400).json({ error: "photoUrl is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(photoUrl);
      
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const photos = site.photos || [];
      photos.push(normalizedPath);
      
      const updatedSite = await storage.updateSite(req.params.id, { photos });
      res.json(updatedSite);
    } catch (error) {
      console.error("Error adding photo:", error);
      res.status(500).json({ error: "Failed to add photo" });
    }
  });

  // Delete photo from site
  app.delete("/api/sites/:id/photos", isAuthenticated, async (req: any, res) => {
    try {
      const { photoUrl } = req.body;
      if (!photoUrl) {
        return res.status(400).json({ error: "photoUrl is required" });
      }

      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const photos = (site.photos || []).filter((p: string) => p !== photoUrl);
      // Also remove from heroPhotos if present
      const heroPhotos = (site.heroPhotos || []).filter((p: string) => p !== photoUrl);
      const updatedSite = await storage.updateSite(req.params.id, { photos, heroPhotos });
      res.json(updatedSite);
    } catch (error) {
      console.error("Error removing photo:", error);
      res.status(500).json({ error: "Failed to remove photo" });
    }
  });

  // Reorder photos for a site
  app.put("/api/sites/:id/photos/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const { photos } = req.body;
      if (!Array.isArray(photos)) {
        return res.status(400).json({ error: "photos array is required" });
      }

      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const updatedSite = await storage.updateSite(req.params.id, { photos });
      res.json(updatedSite);
    } catch (error) {
      console.error("Error reordering photos:", error);
      res.status(500).json({ error: "Failed to reorder photos" });
    }
  });

  // ========= ADMIN ROUTES =========

  // Coupon management routes (admin)
  app.get("/api/admin/coupons", isAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAdmin, async (req, res) => {
    try {
      const result = insertCouponSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid coupon data", details: result.error.issues });
      }
      const coupon = await storage.createCoupon(result.data);
      res.json(coupon);
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "A coupon with this code already exists" });
      }
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  app.patch("/api/admin/coupons/:id", isAdmin, async (req, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      res.json(coupon);
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "A coupon with this code already exists" });
      }
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // User management routes (admin)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(({ password: _, ...safeUser }) => safeUser);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin route to adjust user credits
  app.patch("/api/admin/users/:id/credits", isAdmin, async (req, res) => {
    try {
      const { credits } = req.body;
      if (typeof credits !== 'number' || credits < 0) {
        return res.status(400).json({ error: "Credits must be a non-negative number" });
      }
      const user = await storage.updateUserCredits(req.params.id, credits);
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user credits:", error);
      res.status(500).json({ error: "Failed to update user credits" });
    }
  });

  // Admin route to delete a user
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Public coupon validation endpoint (for users to check/redeem coupons)
  app.post("/api/coupons/validate", isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }

      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      // Check if coupon is active
      if (coupon.isActive !== 'true') {
        return res.status(400).json({ error: "This coupon is no longer active" });
      }

      // Check if coupon has expired
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This coupon has expired" });
      }

      // Check if coupon has reached max uses
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: "This coupon has reached its maximum uses" });
      }

      // Check if user has already used this coupon
      const hasRedeemed = await storage.hasUserRedeemedCoupon(coupon.id, req.user.id);
      if (hasRedeemed) {
        return res.status(400).json({ error: "You have already used this coupon" });
      }

      res.json({ valid: true, coupon });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // Redeem coupon (apply it to user)
  app.post("/api/coupons/redeem", isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }

      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }

      // Validation checks
      if (coupon.isActive !== 'true') {
        return res.status(400).json({ error: "This coupon is no longer active" });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This coupon has expired" });
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: "This coupon has reached its maximum uses" });
      }

      const hasRedeemed = await storage.hasUserRedeemedCoupon(coupon.id, req.user.id);
      if (hasRedeemed) {
        return res.status(400).json({ error: "You have already used this coupon" });
      }

      // Apply the coupon based on type
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let message = "";
      if (coupon.type === 'free_credits') {
        const newCredits = user.credits + coupon.value;
        await storage.updateUserCredits(user.id, newCredits);
        message = `Added ${coupon.value} credit${coupon.value !== 1 ? 's' : ''} to your account!`;
      } else if (coupon.type === 'first_site_free') {
        // Give 1 free credit
        const newCredits = user.credits + 1;
        await storage.updateUserCredits(user.id, newCredits);
        message = "Your first site is now free! 1 credit has been added.";
      } else {
        message = "Coupon applied successfully!";
      }

      // Record the redemption and increment usage
      await storage.redeemCoupon(coupon.id, user.id);
      await storage.incrementCouponUsage(coupon.id);

      const updatedUser = await storage.getUser(req.user.id);
      res.json({ 
        success: true, 
        message,
        credits: updatedUser?.credits || user.credits
      });
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      res.status(500).json({ error: "Failed to redeem coupon" });
    }
  });

  return httpServer;
}
