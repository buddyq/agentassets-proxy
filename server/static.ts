import express, { type Express } from "express";
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

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // with SSR meta tag injection for property sites (for social media crawlers)
  app.use("*", async (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    try {
      // Check if this is a social media crawler/bot
      const userAgent = req.headers['user-agent'] || '';
      const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|googlebot|bingbot/i.test(userAgent);
      
      // Only inject meta tags for crawlers to avoid performance overhead for regular users
      if (isCrawler) {
        const host = req.headers.host || req.hostname || '';
        const requestPath = req.originalUrl || req.path || '';
        
        console.log('[SEO] Crawler detected:', userAgent.substring(0, 50));
        console.log('[SEO] Host:', host, '| Path:', requestPath);
        
        // Try to get site-specific meta data
        const siteMeta = await getSiteMetaData(host, requestPath);
        console.log('[SEO] Site meta found:', siteMeta ? 'yes' : 'no');
        
        if (siteMeta) {
          // Read HTML and inject meta tags
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = injectMetaTags(html, siteMeta);
          return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
        }
      }
      
      // No site-specific meta or not a crawler, serve default
      res.sendFile(indexPath);
    } catch (error) {
      console.error('Error serving with SSR meta tags:', error);
      res.sendFile(indexPath);
    }
  });
}
