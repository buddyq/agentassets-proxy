import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { getSiteMetaData, injectMetaTags } from "./seoInjector";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");

  // SSR meta tag injection middleware - runs BEFORE static file serving
  // This intercepts crawler requests for HTML pages and injects property-specific meta tags
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only handle requests that would serve index.html (not static assets)
      const ext = path.extname(req.path);
      if (ext && ext !== '.html') {
        return next();
      }

      // Check if this is a social media crawler/bot
      const userAgent = req.headers['user-agent'] || '';
      const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|googlebot|bingbot/i.test(userAgent);
      
      if (!isCrawler) {
        return next();
      }

      // X-Forwarded-Host is set by the Cloudflare Worker when proxying custom domain traffic
      const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || req.hostname || '';
      const requestPath = req.originalUrl || req.path || '';
      
      // Try to get site-specific meta data
      const siteMeta = await getSiteMetaData(host, requestPath);
      
      if (siteMeta) {
        // Read HTML and inject meta tags
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = injectMetaTags(html, siteMeta);
        return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      }
      
      // No site-specific meta found, continue to static serving
      next();
    } catch (error) {
      console.error('Error in SSR meta tag middleware:', error);
      next();
    }
  });

  // Serve static files
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.use("*", (req, res) => {
    res.sendFile(indexPath);
  });
}
