import { 
  users, 
  sites, 
  themes,
  layouts,
  leads,
  type User, 
  type InsertUser,
  type Site,
  type InsertSite,
  type Theme,
  type InsertTheme,
  type Layout,
  type InsertLayout,
  type Lead,
  type InsertLead
} from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: string, credits: number): Promise<User>;
  updateUserLogo(id: string, logo: string | null): Promise<User>;
  
  // Site methods
  getSite(id: string): Promise<Site | undefined>;
  getSitesByUser(userId: string): Promise<Site[]>;
  getAllSites(): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: string): Promise<void>;
  updateSiteStats(id: string, stats: { views: number; uniqueVisitors: number; leads: number }): Promise<void>;
  
  // Theme methods
  getTheme(id: string): Promise<Theme | undefined>;
  getThemesByUser(userId: string): Promise<Theme[]>;
  getAllThemes(): Promise<Theme[]>;
  getPresetThemes(): Promise<Theme[]>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: string, theme: Partial<InsertTheme>): Promise<Theme>;
  deleteTheme(id: string): Promise<void>;
  
  // Layout methods
  getLayout(id: string): Promise<Layout | undefined>;
  getLayoutsByUser(userId: string): Promise<Layout[]>;
  getAllLayouts(): Promise<Layout[]>;
  getPresetLayouts(): Promise<Layout[]>;
  createLayout(layout: InsertLayout): Promise<Layout>;
  updateLayout(id: string, layout: Partial<InsertLayout>): Promise<Layout>;
  deleteLayout(id: string): Promise<void>;
  
  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsBySite(siteId: string): Promise<Lead[]>;
  getLeadsByUser(userId: string): Promise<Lead[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: "sessions"
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserCredits(id: string, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLogo(id: string, logo: string | null): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ logo, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Site methods
  async getSite(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site || undefined;
  }

  async getSitesByUser(userId: string): Promise<Site[]> {
    return await db.select().from(sites).where(eq(sites.userId, userId));
  }

  async getAllSites(): Promise<Site[]> {
    return await db.select().from(sites);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const [site] = await db
      .insert(sites)
      .values({
        ...insertSite,
        stats: insertSite.stats || { views: 0, uniqueVisitors: 0, leads: 0 }
      })
      .returning();
    return site;
  }

  async updateSite(id: string, siteUpdate: Partial<InsertSite>): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ ...siteUpdate, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async deleteSite(id: string): Promise<void> {
    await db.delete(sites).where(eq(sites.id, id));
  }

  async updateSiteStats(id: string, stats: { views: number; uniqueVisitors: number; leads: number }): Promise<void> {
    await db
      .update(sites)
      .set({ stats })
      .where(eq(sites.id, id));
  }

  // Theme methods
  async getTheme(id: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || undefined;
  }

  async getThemesByUser(userId: string): Promise<Theme[]> {
    return await db.select().from(themes).where(eq(themes.userId, userId));
  }

  async getAllThemes(): Promise<Theme[]> {
    return await db.select().from(themes);
  }

  async getPresetThemes(): Promise<Theme[]> {
    return await db.select().from(themes).where(eq(themes.type, 'preset'));
  }

  async createTheme(insertTheme: InsertTheme): Promise<Theme> {
    const [theme] = await db
      .insert(themes)
      .values(insertTheme)
      .returning();
    return theme;
  }

  async updateTheme(id: string, themeUpdate: Partial<InsertTheme>): Promise<Theme> {
    const [theme] = await db
      .update(themes)
      .set(themeUpdate)
      .where(eq(themes.id, id))
      .returning();
    return theme;
  }

  async deleteTheme(id: string): Promise<void> {
    await db.delete(themes).where(eq(themes.id, id));
  }

  // Layout methods
  async getLayout(id: string): Promise<Layout | undefined> {
    const [layout] = await db.select().from(layouts).where(eq(layouts.id, id));
    return layout || undefined;
  }

  async getLayoutsByUser(userId: string): Promise<Layout[]> {
    return await db.select().from(layouts).where(eq(layouts.userId, userId));
  }

  async getAllLayouts(): Promise<Layout[]> {
    return await db.select().from(layouts);
  }

  async getPresetLayouts(): Promise<Layout[]> {
    return await db.select().from(layouts).where(eq(layouts.type, 'preset'));
  }

  async createLayout(insertLayout: InsertLayout): Promise<Layout> {
    const [layout] = await db
      .insert(layouts)
      .values(insertLayout as any)
      .returning();
    return layout;
  }

  async updateLayout(id: string, layoutUpdate: Partial<InsertLayout>): Promise<Layout> {
    const [layout] = await db
      .update(layouts)
      .set(layoutUpdate as any)
      .where(eq(layouts.id, id))
      .returning();
    return layout;
  }

  async deleteLayout(id: string): Promise<void> {
    await db.delete(layouts).where(eq(layouts.id, id));
  }

  // Lead methods
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getLeadsBySite(siteId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.siteId, siteId));
  }

  async getLeadsByUser(userId: string): Promise<Lead[]> {
    const userSites = await db.select().from(sites).where(eq(sites.userId, userId));
    const siteIds = userSites.map(s => s.id);
    if (siteIds.length === 0) return [];
    
    const allLeads: Lead[] = [];
    for (const siteId of siteIds) {
      const siteLeads = await db.select().from(leads).where(eq(leads.siteId, siteId));
      allLeads.push(...siteLeads);
    }
    return allLeads;
  }
}

export const storage = new DatabaseStorage();
