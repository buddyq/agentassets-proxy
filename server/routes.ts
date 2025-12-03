import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertSiteSchema, insertThemeSchema, insertLayoutSchema, insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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
      const validated = insertSiteSchema.parse({ ...req.body, userId });
      const site = await storage.createSite(validated);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
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
      if (theme.userId !== req.user.id) {
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
      if (theme.userId !== req.user.id) {
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
      const { preset, userId } = req.query;
      
      if (preset === 'true') {
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
      const updatedSite = await storage.updateSite(req.params.id, { photos });
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

  return httpServer;
}
