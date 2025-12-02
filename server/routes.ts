import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertSiteSchema, insertThemeSchema } from "@shared/schema";
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
      res.json(site);
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

  app.delete("/api/themes/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteTheme(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete theme" });
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

  return httpServer;
}
