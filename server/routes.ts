import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, isAuthenticated, isAdmin, isBrokerageAdmin, isBrokerageMember } from "./auth";
import { insertSiteSchema, insertThemeSchema, insertLayoutSchema, insertLeadSchema, insertCouponSchema, brokerageMembers, leads } from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import archiver from "archiver";
import { sendLeadNotificationEmail, sendAgentInvitationEmail } from "./email";
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

  // Test email endpoint (admin only, or dev mode)
  app.post("/api/test/invitation-email", async (req: any, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const baseUrl = process.env.BASE_URL || 'https://agentassets.com';
      
      await sendAgentInvitationEmail({
        recipientEmail: email,
        recipientName: 'Test User',
        brokerageName: 'Buddy Realty',
        inviterName: 'Admin',
        setupToken: 'test-token-12345',
        baseUrl,
      });
      
      res.json({ success: true, message: `Test email sent to ${email}` });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ error: "Failed to send test email" });
    }
  });

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
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      if (error?.code === '23505' && error?.constraint === 'users_email_unique') {
        return res.status(400).json({ error: "This email is already in use by another account" });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Change password route (protected)
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  });

  app.post("/api/user/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = changePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error.issues });
      }

      const { currentPassword, newPassword } = result.data;

      // Get current user
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ error: "User not found or no password set" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, hashedPassword);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
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
      
      // Get brokerage for logo fallback
      const brokerageMembership = user?.id ? await storage.getBrokerageMembership(user.id) : null;
      const brokerage = brokerageMembership ? await storage.getBrokerage(brokerageMembership.brokerageId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo or brokerage logo)
      const effectiveLogo = site.logo || user?.logo || brokerage?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo or brokerage logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || brokerage?.logo || null;
      
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
      
      // Get brokerage for logo fallback
      const brokerageMembership = user?.id ? await storage.getBrokerageMembership(user.id) : null;
      const brokerage = brokerageMembership ? await storage.getBrokerage(brokerageMembership.brokerageId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo or brokerage logo)
      const effectiveLogo = site.logo || user?.logo || brokerage?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo or brokerage logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || brokerage?.logo || null;
      
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

  // Helper to categorize traffic source from referrer
  function categorizeTrafficSource(referrer: string | undefined): { source: 'direct' | 'social' | 'search' | 'referral'; referrerDomain?: string } {
    if (!referrer) {
      return { source: 'direct' };
    }
    
    try {
      const url = new URL(referrer);
      const domain = url.hostname.toLowerCase();
      
      // Social media platforms
      const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'pinterest.com', 'tiktok.com', 'youtube.com', 't.co'];
      if (socialDomains.some(s => domain.includes(s))) {
        return { source: 'social', referrerDomain: domain };
      }
      
      // Search engines
      const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.com'];
      if (searchDomains.some(s => domain.includes(s))) {
        return { source: 'search', referrerDomain: domain };
      }
      
      // Everything else is a referral
      return { source: 'referral', referrerDomain: domain };
    } catch {
      return { source: 'direct' };
    }
  }

  // Track page view for analytics (public endpoint)
  app.post("/api/sites/:id/track-view", async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Get current stats or initialize
      const currentStats = site.stats || { views: 0, uniqueVisitors: 0, leads: 0 };
      
      // Check if this is a unique visitor using session
      const sessionKey = `viewed_site_${site.id}`;
      const isNewVisitor = !req.session?.[sessionKey];
      
      // Mark this site as viewed in the session
      if (req.session) {
        req.session[sessionKey] = true;
      }

      // Update total stats
      await storage.updateSiteStats(site.id, {
        views: currentStats.views + 1,
        uniqueVisitors: isNewVisitor ? currentStats.uniqueVisitors + 1 : currentStats.uniqueVisitors,
        leads: currentStats.leads
      });
      
      // Record daily stats for charts
      await storage.recordDailyStats(site.id, isNewVisitor);
      
      // Record traffic source (only for new visitors to avoid skewing data)
      if (isNewVisitor) {
        const referrer = req.get('referer') || req.body.referrer;
        const { source, referrerDomain } = categorizeTrafficSource(referrer);
        await storage.recordTrafficSource(site.id, source, referrerDomain);
      }

      res.json({ success: true, isNewVisitor });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });
  
  // Get traffic sources for a site (protected - owner only)
  app.get("/api/sites/:siteId/traffic-sources", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Verify ownership
      if (site.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const sources = await storage.getTrafficSources(site.id);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching traffic sources:", error);
      res.status(500).json({ error: "Failed to fetch traffic sources" });
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
      
      // Get brokerage for logo fallback
      const brokerageMembership = user?.id ? await storage.getBrokerageMembership(user.id) : null;
      const brokerage = brokerageMembership ? await storage.getBrokerage(brokerageMembership.brokerageId) : null;
      
      // Include effective logo (site logo or fallback to user's default logo or brokerage logo)
      const effectiveLogo = site.logo || user?.logo || brokerage?.logo || null;
      
      // Include effective hero logo (heroLogo or fallback to site logo or user's default logo or brokerage logo)
      const effectiveHeroLogo = site.heroLogo || site.logo || user?.logo || brokerage?.logo || null;
      
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
      
      // Check if user is a brokerage agent (has unlimited credits)
      const brokerageMembership = await storage.getBrokerageMembership(userId);
      const isBrokerageAgent = brokerageMembership && brokerageMembership.status === 'active';
      
      // Check for available credits
      const hasRegularCredits = user.credits > 0;
      // Allow trial if user has trial credits and either trialEndsAt is in the future, or it's null (new user)
      const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const isTrialValid = trialEndsAt > new Date();
      const hasTrialCredits = (user.trialCredits || 0) > 0 && isTrialValid;
      
      // Brokerage agents have unlimited credits
      if (!isBrokerageAgent && !hasRegularCredits && !hasTrialCredits) {
        return res.status(403).json({ error: "Insufficient credits. Purchase credits to create new sites." });
      }
      
      // Determine which credit type to use
      const shouldUseTrial = wantsTrialCredit && hasTrialCredits;
      
      // Validate site data without the control flag
      const validated = insertSiteSchema.parse({ ...siteData, userId });
      
      let site;
      if (isBrokerageAgent) {
        // Brokerage agents get sites for free (no credit deduction)
        site = await storage.createSite(validated);
      } else if (shouldUseTrial) {
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
  app.get("/api/themes", async (req: any, res) => {
    try {
      const { userId, preset, forUser } = req.query;
      
      // If forUser=true, return themes visible to the user (includes group-assigned brokerage templates)
      // Falls back to preset themes if not authenticated
      if (forUser === 'true') {
        if (req.isAuthenticated && req.isAuthenticated()) {
          const { themes } = await storage.getTemplatesForUser(req.user.id);
          return res.json(themes);
        } else {
          // Not authenticated - return preset themes only
          const themes = await storage.getPresetThemes();
          return res.json(themes);
        }
      }
      
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
  app.get("/api/layouts", async (req: any, res) => {
    try {
      const { preset, userId, enabledOnly, forUser } = req.query;
      
      // If forUser=true, return layouts visible to the user (includes group-assigned brokerage templates)
      // Falls back to enabled preset layouts if not authenticated
      if (forUser === 'true') {
        if (req.isAuthenticated && req.isAuthenticated()) {
          const { layouts } = await storage.getTemplatesForUser(req.user.id);
          return res.json(layouts);
        } else {
          // Not authenticated - return enabled preset layouts only
          const layouts = await storage.getEnabledPresetLayouts();
          return res.json(layouts);
        }
      }
      
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

  // Get daily stats for a site (for charts)
  app.get("/api/sites/:siteId/daily-stats", isAuthenticated, async (req: any, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Verify ownership
      if (site.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const days = parseInt(req.query.days as string) || 7;
      const stats = await storage.getDailyStats(req.params.siteId, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ error: "Failed to fetch daily stats" });
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

  // Brokerage registration (free trial)
  const brokerageRegisterSchema = z.object({
    brokerageName: z.string().min(2, "Brokerage name must be at least 2 characters"),
    contactName: z.string().min(2, "Name must be at least 2 characters"),
    contactEmail: z.string().email("Please enter a valid email"),
    contactPhone: z.string().optional(),
    plannedAgentCount: z.string().min(1, "Please select agent count range"),
  });

  app.post("/api/brokerage/register", isAuthenticated, async (req: any, res) => {
    try {
      const validated = brokerageRegisterSchema.parse(req.body);
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has a brokerage membership
      const existingMembership = await storage.getBrokerageMembership(user.id);
      if (existingMembership) {
        return res.status(400).json({ error: "You are already a member of a brokerage" });
      }

      // Update user profile with contact info if not already set (skip email to avoid conflicts)
      const profileUpdates: Record<string, string> = {};
      if (!user.name && validated.contactName) profileUpdates.name = validated.contactName;
      if (!user.phone && validated.contactPhone) profileUpdates.phone = validated.contactPhone;
      
      if (Object.keys(profileUpdates).length > 0) {
        try {
          await storage.updateUserProfile(user.id, profileUpdates);
        } catch (e) {
          // Ignore profile update errors - brokerage creation is more important
          console.log("Profile update skipped:", e);
        }
      }

      // Create the brokerage with 7-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const brokerage = await storage.createBrokerage({
        name: validated.brokerageName,
        ownerUserId: user.id,
        email: validated.contactEmail,
        phone: validated.contactPhone || null,
        status: 'trial',
        plannedAgentCount: validated.plannedAgentCount,
        includedSeats: 15,
        additionalSeats: 0,
      });

      // Update with trial end date
      await storage.updateBrokerage(brokerage.id, { trialEndsAt });

      // Add the user as brokerage admin
      await storage.addBrokerageMember({
        brokerageId: brokerage.id,
        userId: user.id,
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
      });

      res.status(201).json({ success: true, brokerageId: brokerage.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Brokerage registration error:", error);
      res.status(500).json({ error: "Failed to register brokerage" });
    }
  });

  // Brokerage subscription checkout (for upgrading from trial)
  app.post("/api/stripe/brokerage-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const { couponCode } = req.body;
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has a brokerage membership
      const membership = await storage.getBrokerageMembership(user.id);
      if (!membership || membership.role !== 'admin') {
        return res.status(400).json({ error: "You must be a brokerage admin to upgrade" });
      }

      const brokerage = await storage.getBrokerage(membership.brokerageId);
      if (!brokerage) {
        return res.status(404).json({ error: "Brokerage not found" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Use custom BASE_URL if set, otherwise fall back to REPLIT_DOMAINS
      let baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
        baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';
      }

      // Validate coupon or promotion code if provided
      let discounts: ({ coupon: string } | { promotion_code: string })[] | undefined;
      if (couponCode) {
        // First try to find a promotion code
        const promoCodes = await stripe.promotionCodes.list({ code: couponCode, active: true, limit: 1 });
        if (promoCodes.data.length > 0) {
          const promoCode = promoCodes.data[0];
          // Get coupon ID - it's in promoCode.promotion.coupon (not promoCode.coupon)
          const promotion = (promoCode as any).promotion;
          const couponId = promotion?.coupon || (promoCode as any).coupon;
          if (couponId) {
            const coupon = await stripe.coupons.retrieve(couponId);
            if (!coupon.valid) {
              return res.status(400).json({ error: "This promotion code is no longer valid" });
            }
          }
          discounts = [{ promotion_code: promoCode.id }];
        } else {
          // Fall back to direct coupon ID lookup
          try {
            const coupon = await stripe.coupons.retrieve(couponCode);
            if (!coupon.valid) {
              return res.status(400).json({ error: "This coupon is no longer valid" });
            }
            discounts = [{ coupon: couponCode }];
          } catch (couponError: any) {
            if (couponError.code === 'resource_missing') {
              return res.status(400).json({ error: "Invalid coupon code" });
            }
            throw couponError;
          }
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Brokerage Plan',
              description: 'Manage up to 15 agents with your brokerage account. Additional seats available.',
            },
            unit_amount: 24900, // $249.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        // Can only use one of discounts OR allow_promotion_codes, not both
        ...(discounts ? { discounts } : { allow_promotion_codes: true }),
        success_url: `${baseUrl}/brokerage?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/brokerage?canceled=true`,
        metadata: {
          userId: user.id,
          brokerageId: brokerage.id,
          type: 'brokerage_subscription',
        },
        customer_email: brokerage.email || user.email || undefined,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Brokerage checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Validate a Stripe coupon or promotion code
  app.post("/api/stripe/validate-coupon", isAuthenticated, async (req: any, res) => {
    try {
      const { couponCode } = req.body;
      if (!couponCode) {
        return res.status(400).json({ error: "Coupon code is required" });
      }

      const stripe = await getUncachableStripeClient();
      
      // First try to find a promotion code
      try {
        console.log(`Looking up promotion code: ${couponCode}`);
        const promoCodes = await stripe.promotionCodes.list({ 
          code: couponCode, 
          active: true, 
          limit: 1
        });
        console.log(`Promotion codes found: ${promoCodes.data.length}`);
        if (promoCodes.data.length > 0) {
          const promoCode = promoCodes.data[0];
          // Get the coupon ID - it's in promoCode.promotion.coupon (not promoCode.coupon)
          const promotion = (promoCode as any).promotion;
          const couponId = promotion?.coupon || (promoCode as any).coupon;
          console.log(`Promotion code found, coupon ID: ${couponId}`);
          
          if (!couponId) {
            return res.status(400).json({ error: "Promotion code has no associated coupon", valid: false });
          }
          
          // Fetch the full coupon details
          const couponData = await stripe.coupons.retrieve(couponId);
          console.log('Retrieved coupon:', JSON.stringify(couponData, null, 2));
          
          // Check if coupon is valid
          if (!couponData.valid) {
            return res.status(400).json({ error: "This coupon is no longer valid", valid: false });
          }
          
          return res.json({
            valid: true,
            isPromoCode: true,
            promoCodeId: promoCode.id,
            coupon: {
              id: couponData.id,
              percentOff: couponData.percent_off,
              amountOff: couponData.amount_off,
              currency: couponData.currency,
              duration: couponData.duration,
              durationInMonths: couponData.duration_in_months,
              name: couponData.name || promoCode.code,
            }
          });
        }
      } catch (promoError: any) {
        console.log(`Promotion code lookup error:`, promoError.message);
        // Continue to try coupon lookup
      }
      
      // Fall back to direct coupon ID lookup
      try {
        console.log(`Looking up coupon by ID: ${couponCode}`);
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (!coupon.valid) {
          return res.status(400).json({ error: "This coupon is no longer valid", valid: false });
        }
        
        res.json({
          valid: true,
          isPromoCode: false,
          coupon: {
            id: coupon.id,
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
            durationInMonths: coupon.duration_in_months,
            name: coupon.name,
          }
        });
      } catch (couponError: any) {
        if (couponError.code === 'resource_missing') {
          return res.status(400).json({ error: "Invalid coupon code", valid: false });
        }
        throw couponError;
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // Purchase additional seats for brokerage
  const purchaseSeatsSchema = z.object({
    seats: z.number().min(1).max(100),
  });

  app.post("/api/stripe/purchase-seats", isAuthenticated, async (req: any, res) => {
    try {
      const validated = purchaseSeatsSchema.parse(req.body);
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has a brokerage membership
      const membership = await storage.getBrokerageMembership(user.id);
      if (!membership || membership.role !== 'admin') {
        return res.status(400).json({ error: "You must be a brokerage admin to purchase seats" });
      }

      const brokerage = await storage.getBrokerage(membership.brokerageId);
      if (!brokerage) {
        return res.status(404).json({ error: "Brokerage not found" });
      }

      // Check if brokerage has an active subscription
      if (!brokerage.stripeSubscriptionId) {
        return res.status(400).json({ error: "You must have an active subscription to purchase additional seats" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Get the current subscription
      const subscription = await stripe.subscriptions.retrieve(brokerage.stripeSubscriptionId);
      
      if (subscription.status !== 'active') {
        return res.status(400).json({ error: "Your subscription must be active to add seats" });
      }

      // Use custom BASE_URL if set, otherwise fall back to REPLIT_DOMAINS
      let baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
        baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';
      }

      // Create a checkout session for additional seats
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Additional Agent Seats',
              description: `${validated.seats} additional seat${validated.seats > 1 ? 's' : ''} for your brokerage`,
            },
            unit_amount: 1500, // $15.00 per seat per month
            recurring: {
              interval: 'month',
            },
          },
          quantity: validated.seats,
        }],
        mode: 'subscription',
        success_url: `${baseUrl}/brokerage?seats_added=${validated.seats}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/brokerage?canceled=true`,
        metadata: {
          userId: user.id,
          brokerageId: brokerage.id,
          seats: validated.seats.toString(),
          type: 'additional_seats',
        },
        customer: brokerage.stripeCustomerId || undefined,
        customer_email: !brokerage.stripeCustomerId ? (brokerage.email || user.email || undefined) : undefined,
      });

      res.json({ url: session.url });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Purchase seats error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Handle seat purchase success
  app.post("/api/stripe/seats-success", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid' || session.metadata?.type !== 'additional_seats') {
        return res.status(400).json({ error: "Invalid or unpaid session" });
      }

      const userId = session.metadata?.userId;
      const brokerageId = session.metadata?.brokerageId;
      const seats = parseInt(session.metadata?.seats || '0', 10);

      if (!userId || userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!brokerageId || seats <= 0) {
        return res.status(400).json({ error: "Invalid session data" });
      }

      // Get current brokerage and update additional seats
      const brokerage = await storage.getBrokerage(brokerageId);
      if (!brokerage) {
        return res.status(404).json({ error: "Brokerage not found" });
      }

      const newAdditionalSeats = (brokerage.additionalSeats || 0) + seats;
      await storage.updateBrokerage(brokerageId, { 
        additionalSeats: newAdditionalSeats 
      });

      res.json({ 
        success: true, 
        addedSeats: seats,
        totalSeats: brokerage.includedSeats + newAdditionalSeats
      });
    } catch (error) {
      console.error("Seats success error:", error);
      res.status(500).json({ error: "Failed to process seat purchase" });
    }
  });

  // Handle brokerage subscription success (called after Stripe redirect)
  app.post("/api/stripe/brokerage-success", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid' || session.metadata?.type !== 'brokerage_subscription') {
        return res.status(400).json({ error: "Invalid or unpaid session" });
      }

      const userId = session.metadata?.userId;
      const brokerageName = session.metadata?.brokerageName;

      if (!userId || userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check if brokerage was already created (idempotency)
      const existingMembership = await storage.getBrokerageMembership(userId);
      if (existingMembership) {
        return res.json({ success: true, brokerageId: existingMembership.brokerageId });
      }

      // Create the brokerage
      const brokerage = await storage.createBrokerage({
        name: brokerageName || 'My Brokerage',
        ownerUserId: userId,
        status: 'active',
        includedSeats: 15,
        additionalSeats: 0,
      });

      // Update brokerage with Stripe IDs
      if (session.customer || session.subscription) {
        await storage.updateBrokerage(brokerage.id, {
          stripeCustomerId: session.customer as string || null,
          stripeSubscriptionId: session.subscription as string || null,
        });
      }

      // Add the user as brokerage admin
      await storage.addBrokerageMember({
        brokerageId: brokerage.id,
        userId: userId,
        role: 'admin',
        status: 'active',
      });

      res.json({ success: true, brokerageId: brokerage.id });
    } catch (error) {
      console.error("Brokerage success error:", error);
      res.status(500).json({ error: "Failed to process brokerage subscription" });
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

  // Admin stats/overview endpoint
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sites = await storage.getAllSites();
      const allLeads = await db.select().from(leads);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // User stats
      const totalUsers = users.length;
      const newUsers30d = users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo).length;
      const newUsers7d = users.filter(u => u.createdAt && new Date(u.createdAt) > sevenDaysAgo).length;
      const brokerAccounts = users.filter(u => u.accountType === 'broker').length;
      const individualAccounts = users.filter(u => u.accountType === 'individual').length;
      const totalCreditsHeld = users.reduce((sum, u) => sum + (u.credits || 0), 0);
      
      // Site stats
      const totalSites = sites.length;
      const publishedSites = sites.filter(s => s.status === 'published').length;
      const draftSites = sites.filter(s => s.status === 'draft').length;
      const newSites30d = sites.filter(s => s.createdAt && new Date(s.createdAt) > thirtyDaysAgo).length;
      const newSites7d = sites.filter(s => s.createdAt && new Date(s.createdAt) > sevenDaysAgo).length;
      const totalViews = sites.reduce((sum, s) => sum + ((s.stats as any)?.views || 0), 0);
      const totalUniqueVisitors = sites.reduce((sum, s) => sum + ((s.stats as any)?.uniqueVisitors || 0), 0);
      
      // Lead stats
      const totalLeads = allLeads.length;
      const newLeads30d = allLeads.filter(l => l.createdAt && new Date(l.createdAt) > thirtyDaysAgo).length;
      const newLeads7d = allLeads.filter(l => l.createdAt && new Date(l.createdAt) > sevenDaysAgo).length;
      
      // Recent activity - last 10 users
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10)
        .map(({ password: _, ...u }) => u);
      
      // Recent sites - last 10
      const recentSites = sites
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);
      
      // Top performing sites by views
      const topSitesByViews = sites
        .filter(s => s.status === 'published')
        .sort((a, b) => ((b.stats as any)?.views || 0) - ((a.stats as any)?.views || 0))
        .slice(0, 5);
      
      res.json({
        users: {
          total: totalUsers,
          new30d: newUsers30d,
          new7d: newUsers7d,
          brokerAccounts,
          individualAccounts,
          totalCreditsHeld
        },
        sites: {
          total: totalSites,
          published: publishedSites,
          draft: draftSites,
          new30d: newSites30d,
          new7d: newSites7d,
          totalViews,
          totalUniqueVisitors
        },
        leads: {
          total: totalLeads,
          new30d: newLeads30d,
          new7d: newLeads7d
        },
        brokerages: {
          total: await storage.getAllBrokerages().then(b => b.length)
        },
        recentUsers,
        recentSites,
        topSitesByViews
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

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

  // Admin route to trigger monthly analytics emails
  app.post("/api/admin/send-analytics-emails", isAdmin, async (req: any, res) => {
    try {
      const { sendAnalyticsEmailToUser } = await import('./scheduler');
      
      const { userId, force } = req.body;
      
      if (force) {
        // Force send to current admin user for testing
        const success = await sendAnalyticsEmailToUser(req.user.id);
        if (success) {
          res.json({ success: true, sent: 1, failed: 0, skipped: 0, message: "Test email sent to your address" });
        } else {
          res.status(400).json({ error: "Failed to send test email. Check your email address." });
        }
      } else if (userId) {
        // Send to a specific user
        const success = await sendAnalyticsEmailToUser(userId);
        if (success) {
          res.json({ success: true, message: `Analytics email sent to user ${userId}` });
        } else {
          res.status(400).json({ error: "Failed to send analytics email. User may not have an email address." });
        }
      } else {
        // Send to all eligible users (those who haven't received this month)
        const { sendAllMonthlyAnalyticsEmails } = await import('./scheduler');
        const result = await sendAllMonthlyAnalyticsEmails();
        res.json({ success: true, ...result });
      }
    } catch (error) {
      console.error("Error sending analytics emails:", error);
      res.status(500).json({ error: "Failed to send analytics emails" });
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

  // ==================== BROKERAGE ROUTES ====================
  
  // Get current user's brokerage (if they are an admin)
  app.get("/api/brokerage", isAuthenticated, async (req: any, res) => {
    try {
      const membership = await storage.getBrokerageMembership(req.user.id);
      if (!membership) {
        return res.json({ brokerage: null, membership: null });
      }
      
      const brokerage = await storage.getBrokerage(membership.brokerageId);
      const memberCount = await storage.getBrokerageMemberCount(membership.brokerageId);
      
      res.json({ 
        brokerage, 
        membership,
        memberCount,
        totalSeats: (brokerage?.includedSeats || 15) + (brokerage?.additionalSeats || 0)
      });
    } catch (error) {
      console.error("Error fetching brokerage:", error);
      res.status(500).json({ error: "Failed to fetch brokerage" });
    }
  });

  // Create a new brokerage (only for users who don't already have one)
  app.post("/api/brokerage", isAuthenticated, async (req: any, res) => {
    try {
      // Check if user already has a brokerage
      const existingMembership = await storage.getBrokerageMembership(req.user.id);
      if (existingMembership) {
        return res.status(400).json({ error: "You already belong to a brokerage" });
      }
      
      const { name, logo, website, phone, email, address } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Brokerage name is required" });
      }
      
      // Create the brokerage
      const brokerage = await storage.createBrokerage({
        name,
        ownerUserId: req.user.id,
        logo,
        website,
        phone,
        email,
        address,
        includedSeats: 15,
        additionalSeats: 0,
        status: 'active',
      });
      
      // Add the owner as an admin member
      await storage.addBrokerageMember({
        brokerageId: brokerage.id,
        userId: req.user.id,
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
      });
      
      res.status(201).json(brokerage);
    } catch (error) {
      console.error("Error creating brokerage:", error);
      res.status(500).json({ error: "Failed to create brokerage" });
    }
  });

  // Update brokerage details
  app.patch("/api/brokerage", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { name, logo, website, phone, email, address } = req.body;
      const updated = await storage.updateBrokerage(req.brokerageId, {
        name,
        logo,
        website,
        phone,
        email,
        address,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating brokerage:", error);
      res.status(500).json({ error: "Failed to update brokerage" });
    }
  });

  // Mark templates as explored (onboarding milestone)
  app.post("/api/brokerage/onboarding/templates-explored", isBrokerageMember, async (req: any, res) => {
    try {
      const membership = await storage.getBrokerageMembership(req.user.id);
      if (!membership) {
        return res.status(404).json({ error: "Brokerage membership not found" });
      }
      
      const brokerage = await storage.getBrokerage(membership.brokerageId);
      if (!brokerage) {
        return res.status(404).json({ error: "Brokerage not found" });
      }
      
      // Update the milestone if not already set
      if (!brokerage.hasExploredTemplates) {
        const updates: any = { hasExploredTemplates: true };
        
        // Check if all milestones are now complete
        if (brokerage.hasAddedFirstAgent && brokerage.hasCreatedFirstGroup) {
          updates.onboardingCompletedAt = new Date();
        }
        
        await storage.updateBrokerage(membership.brokerageId, updates);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating templates explored milestone:", error);
      res.status(500).json({ error: "Failed to update onboarding milestone" });
    }
  });

  // ==================== BROKERAGE MEMBER (AGENT) ROUTES ====================
  
  // Get all members of the brokerage
  app.get("/api/brokerage/members", isBrokerageAdmin, async (req: any, res) => {
    try {
      const members = await storage.getBrokerageMembers(req.brokerageId);
      
      // Enrich with user details
      const enrichedMembers = await Promise.all(members.map(async (member) => {
        const user = await storage.getUser(member.userId);
        return {
          ...member,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImageUrl: user.profileImageUrl,
          } : null,
        };
      }));
      
      res.json(enrichedMembers);
    } catch (error) {
      console.error("Error fetching brokerage members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  // Add a new agent to the brokerage
  app.post("/api/brokerage/members", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { name, email, phone, professionalTitle, licenseNumber, website } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }
      
      // Check seat availability
      const brokerage = await storage.getBrokerage(req.brokerageId);
      const memberCount = await storage.getBrokerageMemberCount(req.brokerageId);
      const totalSeats = (brokerage?.includedSeats || 15) + (brokerage?.additionalSeats || 0);
      
      if (memberCount >= totalSeats) {
        return res.status(400).json({ error: "No available seats. Please purchase additional seats." });
      }
      
      // Check if email is already in use by another user
      const existingUsers = await storage.getAllUsers();
      const existingUser = existingUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      let userId: string;
      
      if (existingUser) {
        // Check if this user is already in a brokerage
        const existingMembership = await storage.getBrokerageMembership(existingUser.id);
        if (existingMembership) {
          return res.status(400).json({ error: "This user already belongs to a brokerage" });
        }
        userId = existingUser.id;
      } else {
        // Create a new user account
        const tempPassword = crypto.randomBytes(16).toString('hex');
        const newUser = await storage.createUser({
          username: email.split('@')[0] + '-' + crypto.randomBytes(3).toString('hex'),
          password: tempPassword, // Will need to be reset
          email,
          name,
        });
        userId = newUser.id;
        
        // Update additional profile fields
        await storage.updateUserProfile(newUser.id, {
          phone,
          brokerage: brokerage?.name,
        });
      }
      
      // Add as brokerage member
      const member = await storage.addBrokerageMember({
        brokerageId: req.brokerageId,
        userId,
        role: 'agent',
        status: 'invited',
        invitedBy: req.user.id,
        invitedAt: new Date(),
      });
      
      // Generate invitation token (72 hours expiry)
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await storage.createInvitationToken(member.id, tokenHash, expiresAt);
      
      // Send invitation email
      const inviter = await storage.getUser(req.user.id);
      const baseUrl = process.env.BASE_URL || 'https://agentassets.com';
        
      try {
        await sendAgentInvitationEmail({
          recipientEmail: email,
          recipientName: name,
          brokerageName: brokerage?.name || 'Your Brokerage',
          inviterName: inviter?.name || 'Your administrator',
          setupToken: rawToken,
          baseUrl,
        });
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
      }
      
      // Update onboarding milestone
      if (!brokerage?.hasAddedFirstAgent) {
        const updates: any = { hasAddedFirstAgent: true };
        // Check if all milestones are now complete
        if (brokerage?.hasCreatedFirstGroup && brokerage?.hasExploredTemplates) {
          updates.onboardingCompletedAt = new Date();
        }
        await storage.updateBrokerage(req.brokerageId, updates);
      }
      
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...member,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImageUrl: user.profileImageUrl,
        } : null,
      });
    } catch (error) {
      console.error("Error adding brokerage member:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  // Update a brokerage member
  app.patch("/api/brokerage/members/:memberId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { memberId } = req.params;
      const { role, status } = req.body;
      
      // Get the member to verify they belong to this brokerage
      const members = await storage.getBrokerageMembers(req.brokerageId);
      const member = members.find(m => m.id === memberId);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Can't change the owner's role
      const brokerage = await storage.getBrokerage(req.brokerageId);
      if (member.userId === brokerage?.ownerUserId && role && role !== 'admin') {
        return res.status(400).json({ error: "Cannot change the owner's role" });
      }
      
      const updated = await storage.updateBrokerageMember(memberId, { role, status });
      res.json(updated);
    } catch (error) {
      console.error("Error updating brokerage member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  // Remove a member from the brokerage
  app.delete("/api/brokerage/members/:memberId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { memberId } = req.params;
      
      // Get the member to verify they belong to this brokerage
      const members = await storage.getBrokerageMembers(req.brokerageId);
      const member = members.find(m => m.id === memberId);
      
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      // Can't remove the owner
      const brokerage = await storage.getBrokerage(req.brokerageId);
      if (member.userId === brokerage?.ownerUserId) {
        return res.status(400).json({ error: "Cannot remove the brokerage owner" });
      }
      
      // Set the user's credits to zero - they'll need to buy their own credits now
      await storage.updateUserCredits(member.userId, 0);
      
      await storage.removeBrokerageMember(memberId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing brokerage member:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // ==================== BROKERAGE GROUP ROUTES ====================
  
  // Get all group memberships for all users in the brokerage
  app.get("/api/brokerage/group-memberships", isBrokerageAdmin, async (req: any, res) => {
    try {
      const groups = await storage.getBrokerageGroups(req.brokerageId);
      const memberships: { userId: string; groupId: string; groupName: string }[] = [];
      
      for (const group of groups) {
        const members = await storage.getGroupMembers(group.id);
        for (const member of members) {
          memberships.push({
            userId: member.userId,
            groupId: group.id,
            groupName: group.name
          });
        }
      }
      
      res.json(memberships);
    } catch (error) {
      console.error("Error fetching group memberships:", error);
      res.status(500).json({ error: "Failed to fetch group memberships" });
    }
  });

  // Get all groups in the brokerage
  app.get("/api/brokerage/groups", isBrokerageAdmin, async (req: any, res) => {
    try {
      const groups = await storage.getBrokerageGroups(req.brokerageId);
      
      // Enrich with member counts
      const enrichedGroups = await Promise.all(groups.map(async (group) => {
        const members = await storage.getGroupMembers(group.id);
        return {
          ...group,
          memberCount: members.length,
        };
      }));
      
      res.json(enrichedGroups);
    } catch (error) {
      console.error("Error fetching brokerage groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // Create a new group
  app.post("/api/brokerage/groups", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Group name is required" });
      }
      
      const group = await storage.createBrokerageGroup({
        brokerageId: req.brokerageId,
        name,
        description,
      });
      
      // Update onboarding milestone
      const brokerageForMilestone = await storage.getBrokerage(req.brokerageId);
      if (!brokerageForMilestone?.hasCreatedFirstGroup) {
        const updates: any = { hasCreatedFirstGroup: true };
        // Check if all milestones are now complete
        if (brokerageForMilestone?.hasAddedFirstAgent && brokerageForMilestone?.hasExploredTemplates) {
          updates.onboardingCompletedAt = new Date();
        }
        await storage.updateBrokerage(req.brokerageId, updates);
      }
      
      res.status(201).json({ ...group, memberCount: 0 });
    } catch (error) {
      console.error("Error creating brokerage group:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  // Update a group
  app.patch("/api/brokerage/groups/:groupId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;
      
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      const updated = await storage.updateBrokerageGroup(groupId, { name, description });
      res.json(updated);
    } catch (error) {
      console.error("Error updating brokerage group:", error);
      res.status(500).json({ error: "Failed to update group" });
    }
  });

  // Delete a group
  app.delete("/api/brokerage/groups/:groupId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      await storage.deleteBrokerageGroup(groupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brokerage group:", error);
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  // Get members of a specific group
  app.get("/api/brokerage/groups/:groupId/members", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      const groupMembers = await storage.getGroupMembers(groupId);
      
      // Enrich with user details
      const enrichedMembers = await Promise.all(groupMembers.map(async (gm) => {
        const user = await storage.getUser(gm.userId);
        return {
          ...gm,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
          } : null,
        };
      }));
      
      res.json(enrichedMembers);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  // Add a user to a group
  app.post("/api/brokerage/groups/:groupId/members", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // Verify group belongs to this brokerage
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      // Verify user is a member of this brokerage
      const members = await storage.getBrokerageMembers(req.brokerageId);
      const isMember = members.some(m => m.userId === userId && m.status === 'active');
      if (!isMember) {
        return res.status(400).json({ error: "User is not a member of this brokerage" });
      }
      
      // Check if already in group
      const groupMembers = await storage.getGroupMembers(groupId);
      if (groupMembers.some(gm => gm.userId === userId)) {
        return res.status(400).json({ error: "User is already in this group" });
      }
      
      const groupMember = await storage.addUserToGroup(groupId, userId);
      
      const user = await storage.getUser(userId);
      res.status(201).json({
        ...groupMember,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
        } : null,
      });
    } catch (error) {
      console.error("Error adding user to group:", error);
      res.status(500).json({ error: "Failed to add user to group" });
    }
  });

  // Remove a user from a group
  app.delete("/api/brokerage/groups/:groupId/members/:userId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { groupId, userId } = req.params;
      
      // Verify group belongs to this brokerage
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      await storage.removeUserFromGroup(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing user from group:", error);
      res.status(500).json({ error: "Failed to remove user from group" });
    }
  });

  // ==================== BROKERAGE SITE MANAGEMENT ROUTES ====================
  
  // Get all sites from brokerage members (with search)
  app.get("/api/brokerage/sites", isBrokerageAdmin, async (req: any, res) => {
    try {
      const search = req.query.search as string | undefined;
      const sites = await storage.getBrokerageSites(req.brokerageId, search);
      
      // Enrich with agent info
      const enrichedSites = await Promise.all(sites.map(async (site) => {
        const user = await storage.getUser(site.userId);
        return {
          ...site,
          agent: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
          } : null,
        };
      }));
      
      res.json(enrichedSites);
    } catch (error) {
      console.error("Error fetching brokerage sites:", error);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  // Update a site (brokerage admin can edit any member's site)
  app.patch("/api/brokerage/sites/:siteId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { siteId } = req.params;
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Verify site belongs to a brokerage member
      const members = await storage.getBrokerageMembers(req.brokerageId);
      const isMemberSite = members.some(m => m.userId === site.userId);
      
      if (!isMemberSite) {
        return res.status(403).json({ error: "Site does not belong to this brokerage" });
      }
      
      const updated = await storage.updateSite(siteId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating brokerage site:", error);
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  // Delete a site (brokerage admin can delete any member's site)
  app.delete("/api/brokerage/sites/:siteId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { siteId } = req.params;
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Verify site belongs to a brokerage member
      const members = await storage.getBrokerageMembers(req.brokerageId);
      const isMemberSite = members.some(m => m.userId === site.userId);
      
      if (!isMemberSite) {
        return res.status(403).json({ error: "Site does not belong to this brokerage" });
      }
      
      await storage.deleteSite(siteId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brokerage site:", error);
      res.status(500).json({ error: "Failed to delete site" });
    }
  });

  // ==================== BROKERAGE TEMPLATE ROUTES ====================
  
  // Get templates available to the brokerage (for admin to manage)
  app.get("/api/brokerage/templates", isBrokerageAdmin, async (req: any, res) => {
    try {
      const templates = await storage.getBrokerageTemplates(req.brokerageId);
      
      // Enrich with actual template details
      const enrichedTemplates = await Promise.all(templates.map(async (bt) => {
        let templateDetails = null;
        if (bt.templateType === 'layout') {
          templateDetails = await storage.getLayout(bt.templateId);
        } else if (bt.templateType === 'theme') {
          templateDetails = await storage.getTheme(bt.templateId);
        }
        
        // Get group assignments
        const groups = await storage.getBrokerageGroups(req.brokerageId);
        const assignedGroups: string[] = [];
        for (const group of groups) {
          const groupTemplates = await storage.getGroupTemplates(group.id);
          if (groupTemplates.some(gt => gt.id === bt.id)) {
            assignedGroups.push(group.id);
          }
        }
        
        return {
          ...bt,
          templateDetails,
          assignedGroups,
        };
      }));
      
      res.json(enrichedTemplates);
    } catch (error) {
      console.error("Error fetching brokerage templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Assign a template to a group
  app.post("/api/brokerage/templates/:templateId/groups/:groupId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { templateId, groupId } = req.params;
      
      // Verify template belongs to this brokerage
      const templates = await storage.getBrokerageTemplates(req.brokerageId);
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      // Verify group belongs to this brokerage
      const group = await storage.getBrokerageGroup(groupId);
      if (!group || group.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Group not found" });
      }
      
      const assignment = await storage.assignTemplateToGroup(templateId, groupId);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning template to group:", error);
      res.status(500).json({ error: "Failed to assign template to group" });
    }
  });

  // Remove a template from a group
  app.delete("/api/brokerage/templates/:templateId/groups/:groupId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { templateId, groupId } = req.params;
      
      await storage.removeTemplateFromGroup(templateId, groupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing template from group:", error);
      res.status(500).json({ error: "Failed to remove template from group" });
    }
  });

  // ==================== ADMIN ROUTES FOR BROKERAGE TEMPLATE ASSIGNMENT ====================
  
  // Get all brokerages (AgentAssets admin only)
  app.get("/api/admin/brokerages", isAdmin, async (req, res) => {
    try {
      const allBrokerages: any[] = [];
      // Get all brokerages by checking all users who are brokerage owners
      const users = await storage.getAllUsers();
      for (const user of users) {
        const brokerage = await storage.getBrokerageByOwner(user.id);
        if (brokerage) {
          allBrokerages.push({
            ...brokerage,
            ownerName: user.name,
            ownerEmail: user.email,
          });
        }
      }
      res.json(allBrokerages);
    } catch (error) {
      console.error("Error fetching all brokerages:", error);
      res.status(500).json({ error: "Failed to fetch brokerages" });
    }
  });

  // Assign a template to a brokerage (AgentAssets admin only)
  app.post("/api/admin/brokerages/:brokerageId/templates", isAdmin, async (req: any, res) => {
    try {
      const { brokerageId } = req.params;
      const { templateType, templateId } = req.body;
      
      if (!templateType || !templateId) {
        return res.status(400).json({ error: "Template type and ID are required" });
      }
      
      if (!['layout', 'theme'].includes(templateType)) {
        return res.status(400).json({ error: "Invalid template type" });
      }
      
      // Verify brokerage exists
      const brokerage = await storage.getBrokerage(brokerageId);
      if (!brokerage) {
        return res.status(404).json({ error: "Brokerage not found" });
      }
      
      // Verify template exists
      if (templateType === 'layout') {
        const layout = await storage.getLayout(templateId);
        if (!layout) {
          return res.status(404).json({ error: "Layout not found" });
        }
      } else {
        const theme = await storage.getTheme(templateId);
        if (!theme) {
          return res.status(404).json({ error: "Theme not found" });
        }
      }
      
      const assignment = await storage.assignTemplateToBrokerage(
        brokerageId,
        templateType,
        templateId,
        req.user.id
      );
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning template to brokerage:", error);
      res.status(500).json({ error: "Failed to assign template to brokerage" });
    }
  });

  // Remove a template from a brokerage (AgentAssets admin only)
  app.delete("/api/admin/brokerages/:brokerageId/templates/:templateId", isAdmin, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      
      await storage.removeBrokerageTemplate(templateId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing template from brokerage:", error);
      res.status(500).json({ error: "Failed to remove template from brokerage" });
    }
  });

  // Get templates for a specific brokerage (AgentAssets admin only)
  app.get("/api/admin/brokerages/:brokerageId/templates", isAdmin, async (req: any, res) => {
    try {
      const { brokerageId } = req.params;
      const templates = await storage.getBrokerageTemplates(brokerageId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching brokerage templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get all brokerage templates across all brokerages (AgentAssets admin only)
  app.get("/api/admin/brokerage-templates", isAdmin, async (req: any, res) => {
    try {
      const templates = await storage.getAllBrokerageTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching all brokerage templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get groups for a brokerage (AgentAssets admin only) - for template assignment UI
  app.get("/api/admin/brokerages/:brokerageId/groups", isAdmin, async (req: any, res) => {
    try {
      const { brokerageId } = req.params;
      const groups = await storage.getBrokerageGroups(brokerageId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching brokerage groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // ==================== BROKERAGE TEMPLATE MANAGEMENT (Broker Admin) ====================
  
  // Update a brokerage template (availableToAll, group assignments)
  app.patch("/api/brokerage/templates/:templateId", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const { availableToAll } = req.body;
      
      // Verify the template belongs to this brokerage
      const template = await storage.getBrokerageTemplate(templateId);
      if (!template || template.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const updated = await storage.updateBrokerageTemplate(templateId, { availableToAll });
      res.json(updated);
    } catch (error) {
      console.error("Error updating brokerage template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  // Get group assignments for a template
  app.get("/api/brokerage/templates/:templateId/groups", isBrokerageAdmin, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      
      // Verify the template belongs to this brokerage
      const template = await storage.getBrokerageTemplate(templateId);
      if (!template || template.brokerageId !== req.brokerageId) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const assignments = await storage.getTemplateGroupAssignments(templateId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching template group assignments:", error);
      res.status(500).json({ error: "Failed to fetch group assignments" });
    }
  });

  // ==================== INVITATION / PASSWORD SETUP ====================

  // Verify invitation token (public endpoint)
  app.get("/api/auth/invite/verify", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Token is required" });
      }
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const invitationToken = await storage.getInvitationTokenByHash(tokenHash);
      
      if (!invitationToken) {
        return res.status(404).json({ error: "Invalid or expired invitation link" });
      }
      
      if (invitationToken.usedAt) {
        return res.status(400).json({ error: "This invitation has already been used" });
      }
      
      if (new Date(invitationToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This invitation link has expired" });
      }
      
      // Get the member and user info
      const members = await storage.getBrokerageMembers(''); // We need to look up by member ID
      // Find the member by checking all brokerages (less efficient but works)
      const allUsers = await storage.getAllUsers();
      
      // Get the brokerage member info
      const memberInfo = await db.select().from(brokerageMembers).where(eq(brokerageMembers.id, invitationToken.memberId));
      if (!memberInfo.length) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = memberInfo[0];
      const user = await storage.getUser(member.userId);
      const brokerage = await storage.getBrokerage(member.brokerageId);
      
      res.json({
        valid: true,
        name: user?.name || '',
        email: user?.email || '',
        brokerageName: brokerage?.name || '',
      });
    } catch (error) {
      console.error("Error verifying invitation token:", error);
      res.status(500).json({ error: "Failed to verify invitation" });
    }
  });

  // Accept invitation and set password (public endpoint)
  app.post("/api/auth/invite/accept", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const invitationToken = await storage.getInvitationTokenByHash(tokenHash);
      
      if (!invitationToken) {
        return res.status(404).json({ error: "Invalid or expired invitation link" });
      }
      
      if (invitationToken.usedAt) {
        return res.status(400).json({ error: "This invitation has already been used" });
      }
      
      if (new Date(invitationToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "This invitation link has expired" });
      }
      
      // Get the member
      const memberInfo = await db.select().from(brokerageMembers).where(eq(brokerageMembers.id, invitationToken.memberId));
      if (!memberInfo.length) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      const member = memberInfo[0];
      const user = await storage.getUser(member.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Hash and update the password using the correct method
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Generate username from email if user doesn't have one
      let username = user.username;
      if (!username && user.email) {
        // Create username from email prefix
        const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        // Check if username exists, add random suffix if needed
        let candidateUsername = emailPrefix;
        let existingUser = await storage.getUserByUsername(candidateUsername);
        let attempts = 0;
        while (existingUser && attempts < 10) {
          candidateUsername = `${emailPrefix}${Math.floor(Math.random() * 1000)}`;
          existingUser = await storage.getUserByUsername(candidateUsername);
          attempts++;
        }
        username = candidateUsername;
        await storage.updateUserProfile(user.id, { username });
      }
      
      // Update member status to active
      await storage.updateBrokerageMember(member.id, { 
        status: 'active',
        joinedAt: new Date(),
      });
      
      // Mark token as used
      await storage.markTokenUsed(invitationToken.id);
      
      res.json({ success: true, username });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to set up account" });
    }
  });

  return httpServer;
}
