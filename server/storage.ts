import { 
  users, 
  sites, 
  themes,
  layouts,
  leads,
  coupons,
  couponRedemptions,
  sitePasswords,
  partnerMemberships,
  siteDailyStats,
  siteTrafficSources,
  brokerages,
  brokerageMembers,
  brokerageGroups,
  brokerageGroupMembers,
  brokerageTemplates,
  brokerageGroupTemplates,
  invitationTokens,
  type User, 
  type InsertUser,
  type Site,
  type InsertSite,
  type Theme,
  type InsertTheme,
  type Layout,
  type InsertLayout,
  type Lead,
  type InsertLead,
  type Coupon,
  type InsertCoupon,
  type CouponRedemption,
  type SitePassword,
  type InsertSitePassword,
  type PartnerMembership,
  type InsertPartnerMembership,
  type SiteDailyStat,
  type SiteTrafficSource,
  type TrafficSourceType,
  type Brokerage,
  type InsertBrokerage,
  type BrokerageMember,
  type InsertBrokerageMember,
  type BrokerageGroup,
  type InsertBrokerageGroup,
  type BrokerageGroupMember,
  type BrokerageTemplate,
  type BrokerageGroupTemplate,
  type InvitationToken
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, isNotNull, lt, or, isNull, gte, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import crypto from "crypto";

const PostgresSessionStore = connectPg(session);

// Generate a URL-friendly subdomain from the address
function generateSubdomain(address: string): string {
  // Extract the street address (first line, before any city/state)
  const streetAddress = address.split(',')[0].trim();
  
  // Convert to lowercase, replace spaces with hyphens, remove non-alphanumeric chars
  let slug = streetAddress
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Limit length to 30 characters
  if (slug.length > 30) {
    slug = slug.substring(0, 30).replace(/-$/, '');
  }
  
  // Add a short random suffix to ensure uniqueness
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${slug}-${suffix}`;
}

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: string, credits: number): Promise<User>;
  updateUserTrialCredits(id: string, trialCredits: number): Promise<User>;
  updateUserLogo(id: string, logo: string | null): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;
  
  // Site methods
  getSite(id: string): Promise<Site | undefined>;
  getSiteBySubdomain(subdomain: string): Promise<Site | undefined>;
  getSiteByHost(host: string): Promise<Site | undefined>;
  getSitesByUser(userId: string): Promise<Site[]>;
  getAllSites(): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  createTrialSite(site: InsertSite, trialEndsAt: Date): Promise<Site>;
  updateSite(id: string, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: string): Promise<void>;
  updateSiteStats(id: string, stats: { views: number; uniqueVisitors: number; leads: number }): Promise<void>;
  unpublishSite(id: string): Promise<Site>;
  republishSite(id: string): Promise<Site>;
  
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
  getEnabledPresetLayouts(): Promise<Layout[]>;
  createLayout(layout: InsertLayout): Promise<Layout>;
  updateLayout(id: string, layout: Partial<InsertLayout>): Promise<Layout>;
  deleteLayout(id: string): Promise<void>;
  
  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsBySite(siteId: string): Promise<Lead[]>;
  getLeadsByUser(userId: string): Promise<Lead[]>;
  
  // Coupon methods
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;
  redeemCoupon(couponId: string, userId: string): Promise<CouponRedemption>;
  hasUserRedeemedCoupon(couponId: string, userId: string): Promise<boolean>;
  incrementCouponUsage(id: string): Promise<void>;
  
  // User management methods (admin)
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Site password methods
  getSitePasswords(siteId: string): Promise<SitePassword[]>;
  createSitePassword(password: InsertSitePassword): Promise<SitePassword>;
  deleteSitePassword(id: string): Promise<void>;
  verifySitePassword(siteId: string, password: string): Promise<SitePassword | null>;
  incrementPasswordUsage(id: string): Promise<void>;
  
  // Partner membership methods
  getPartnerMembership(partnerKey: string, email: string): Promise<PartnerMembership | undefined>;
  upsertPartnerMembership(membership: InsertPartnerMembership): Promise<PartnerMembership>;
  deactivatePartnerMembership(partnerKey: string, email: string): Promise<void>;
  getActivePartnerDiscount(email: string): Promise<number | null>;
  
  // Analytics email methods
  getUsersForAnalyticsEmail(): Promise<User[]>;
  markAnalyticsEmailSent(userId: string): Promise<void>;
  
  // Daily stats methods
  recordDailyStats(siteId: string, isNewVisitor: boolean): Promise<void>;
  getDailyStats(siteId: string, days: number): Promise<SiteDailyStat[]>;
  
  // Traffic source methods
  recordTrafficSource(siteId: string, source: TrafficSourceType, referrer?: string): Promise<void>;
  getTrafficSources(siteId: string): Promise<SiteTrafficSource[]>;
  
  // Brokerage methods
  createBrokerage(brokerage: InsertBrokerage): Promise<Brokerage>;
  getBrokerage(id: string): Promise<Brokerage | undefined>;
  getBrokerageByOwner(ownerUserId: string): Promise<Brokerage | undefined>;
  updateBrokerage(id: string, updates: Partial<Brokerage>): Promise<Brokerage>;
  
  // Brokerage member methods
  addBrokerageMember(member: InsertBrokerageMember): Promise<BrokerageMember>;
  getBrokerageMembers(brokerageId: string): Promise<BrokerageMember[]>;
  getBrokerageMembership(userId: string): Promise<BrokerageMember | undefined>;
  updateBrokerageMember(id: string, updates: Partial<BrokerageMember>): Promise<BrokerageMember>;
  removeBrokerageMember(id: string): Promise<void>;
  getBrokerageMemberCount(brokerageId: string): Promise<number>;
  
  // Brokerage group methods
  createBrokerageGroup(group: InsertBrokerageGroup): Promise<BrokerageGroup>;
  getBrokerageGroups(brokerageId: string): Promise<BrokerageGroup[]>;
  getBrokerageGroup(id: string): Promise<BrokerageGroup | undefined>;
  updateBrokerageGroup(id: string, updates: Partial<BrokerageGroup>): Promise<BrokerageGroup>;
  deleteBrokerageGroup(id: string): Promise<void>;
  
  // Brokerage group member methods
  addUserToGroup(groupId: string, userId: string): Promise<BrokerageGroupMember>;
  removeUserFromGroup(groupId: string, userId: string): Promise<void>;
  getGroupMembers(groupId: string): Promise<BrokerageGroupMember[]>;
  getUserGroups(userId: string): Promise<BrokerageGroup[]>;
  
  // Brokerage template methods
  assignTemplateToBrokerage(brokerageId: string, templateType: string, templateId: string, assignedBy?: string): Promise<BrokerageTemplate>;
  getBrokerageTemplates(brokerageId: string): Promise<BrokerageTemplate[]>;
  getBrokerageTemplate(id: string): Promise<BrokerageTemplate | undefined>;
  updateBrokerageTemplate(id: string, updates: Partial<BrokerageTemplate>): Promise<BrokerageTemplate>;
  removeBrokerageTemplate(id: string): Promise<void>;
  getAllBrokerages(): Promise<Brokerage[]>;
  getAllBrokerageTemplates(): Promise<BrokerageTemplate[]>;
  
  // Brokerage group template methods
  assignTemplateToGroup(brokerageTemplateId: string, groupId: string): Promise<BrokerageGroupTemplate>;
  removeTemplateFromGroup(brokerageTemplateId: string, groupId: string): Promise<void>;
  getGroupTemplates(groupId: string): Promise<BrokerageTemplate[]>;
  getTemplateGroupAssignments(brokerageTemplateId: string): Promise<BrokerageGroupTemplate[]>;
  getTemplatesForUser(userId: string): Promise<{ layouts: Layout[]; themes: Theme[] }>;
  
  // Brokerage site management
  getBrokerageSites(brokerageId: string, search?: string): Promise<Site[]>;
  
  // Invitation token methods
  createInvitationToken(memberId: string, tokenHash: string, expiresAt: Date): Promise<InvitationToken>;
  getInvitationTokenByHash(tokenHash: string): Promise<InvitationToken | undefined>;
  markTokenUsed(tokenId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async updateUserTrialCredits(id: string, trialCredits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ trialCredits, updatedAt: new Date() })
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

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const { id: _id, password: _password, credits: _credits, createdAt: _createdAt, ...updateData } = profile;
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    await db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Site methods
  async getSite(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site || undefined;
  }

  async getSiteBySubdomain(subdomain: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.subdomain, subdomain));
    return site || undefined;
  }

  async isSlugAvailable(slug: string, excludeSiteId?: string): Promise<boolean> {
    const existingSite = await this.getSiteBySubdomain(slug);
    if (!existingSite) return true;
    if (excludeSiteId && existingSite.id === excludeSiteId) return true;
    return false;
  }

  async updateSiteSlug(siteId: string, slug: string): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ subdomain: slug, updatedAt: new Date() })
      .where(eq(sites.id, siteId))
      .returning();
    return site;
  }

  async getSiteByHost(host: string): Promise<Site | undefined> {
    // Normalize host: lowercase and strip port
    const normalizedHost = host.toLowerCase().replace(/:\d+$/, '');
    
    // Helper to compare domains (handles www/non-www matching)
    const domainsMatch = (storedDomain: string, requestHost: string): boolean => {
      const stored = storedDomain.toLowerCase();
      const request = requestHost.toLowerCase();
      
      // Exact match
      if (stored === request) return true;
      
      // www/non-www matching: www.example.com should match example.com and vice versa
      const storedWithoutWww = stored.replace(/^www\./, '');
      const requestWithoutWww = request.replace(/^www\./, '');
      return storedWithoutWww === requestWithoutWww;
    };
    
    // First check for custom domain match (handles www/non-www)
    const allSites = await db.select().from(sites);
    const siteByDomain = allSites.find(s => 
      s.customDomain && domainsMatch(s.customDomain, normalizedHost)
    );
    if (siteByDomain) return siteByDomain;
    
    // Then check for subdomain match (host format: subdomain.agentassets.com)
    const subdomainMatch = normalizedHost.match(/^([^.]+)\.agentassets\.com$/);
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1];
      const [siteBySubdomain] = await db.select().from(sites).where(eq(sites.subdomain, subdomain));
      return siteBySubdomain || undefined;
    }
    
    return undefined;
  }

  async getSitesByUser(userId: string): Promise<Site[]> {
    return await db.select().from(sites).where(eq(sites.userId, userId));
  }

  async getAllSites(): Promise<Site[]> {
    return await db.select().from(sites);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    // Retry subdomain generation on collision (max 5 attempts)
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const subdomain = generateSubdomain(insertSite.address);
        const [site] = await db
          .insert(sites)
          .values({
            ...insertSite,
            subdomain,
            stats: insertSite.stats || { views: 0, uniqueVisitors: 0, leads: 0 }
          })
          .returning();
        return site;
      } catch (error: any) {
        // Check for unique constraint violation on subdomain
        if (error?.code === '23505' && error?.constraint?.includes('subdomain') && attempt < 4) {
          continue; // Retry with new subdomain
        }
        throw error;
      }
    }
    throw new Error('Failed to generate unique subdomain after multiple attempts');
  }

  async createTrialSite(insertSite: InsertSite, trialEndsAt: Date): Promise<Site> {
    // Retry subdomain generation on collision (max 5 attempts)
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const subdomain = generateSubdomain(insertSite.address);
        const [site] = await db
          .insert(sites)
          .values({
            ...insertSite,
            subdomain,
            isTrial: true,
            expiresAt: trialEndsAt,
            stats: insertSite.stats || { views: 0, uniqueVisitors: 0, leads: 0 }
          })
          .returning();
        return site;
      } catch (error: any) {
        // Check for unique constraint violation on subdomain
        if (error?.code === '23505' && error?.constraint?.includes('subdomain') && attempt < 4) {
          continue; // Retry with new subdomain
        }
        throw error;
      }
    }
    throw new Error('Failed to generate unique subdomain after multiple attempts');
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

  async unpublishSite(id: string): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ 
        status: 'unpublished', 
        unpublishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async republishSite(id: string): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ 
        status: 'published', 
        unpublishedAt: null,
        updatedAt: new Date() 
      })
      .where(eq(sites.id, id))
      .returning();
    return site;
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

  async getEnabledPresetLayouts(): Promise<Layout[]> {
    return await db.select().from(layouts).where(
      and(eq(layouts.type, 'preset'), eq(layouts.enabled, true))
    );
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

  // Coupon methods
  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    return coupon || undefined;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values({
        ...insertCoupon,
        code: insertCoupon.code.toUpperCase()
      })
      .returning();
    return coupon;
  }

  async updateCoupon(id: string, couponUpdate: Partial<InsertCoupon>): Promise<Coupon> {
    const updateData = { ...couponUpdate };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    const [coupon] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async redeemCoupon(couponId: string, userId: string): Promise<CouponRedemption> {
    const [redemption] = await db
      .insert(couponRedemptions)
      .values({ couponId, userId })
      .returning();
    return redemption;
  }

  async hasUserRedeemedCoupon(couponId: string, userId: string): Promise<boolean> {
    const redemptions = await db.select().from(couponRedemptions)
      .where(eq(couponRedemptions.couponId, couponId));
    return redemptions.some(r => r.userId === userId);
  }

  async incrementCouponUsage(id: string): Promise<void> {
    const coupon = await this.getCoupon(id);
    if (coupon) {
      await db
        .update(coupons)
        .set({ usedCount: coupon.usedCount + 1 })
        .where(eq(coupons.id, id));
    }
  }

  // User management methods (admin)
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: string): Promise<void> {
    // First delete all related data (sites, leads, themes, coupon redemptions, site passwords)
    const userSites = await this.getSitesByUser(id);
    for (const site of userSites) {
      await db.delete(leads).where(eq(leads.siteId, site.id));
      await db.delete(sitePasswords).where(eq(sitePasswords.siteId, site.id));
      await db.delete(sites).where(eq(sites.id, site.id));
    }
    await db.delete(themes).where(eq(themes.userId, id));
    await db.delete(couponRedemptions).where(eq(couponRedemptions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Site password methods
  async getSitePasswords(siteId: string): Promise<SitePassword[]> {
    return await db.select().from(sitePasswords).where(eq(sitePasswords.siteId, siteId));
  }

  async createSitePassword(password: InsertSitePassword): Promise<SitePassword> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password.passwordHash, saltRounds);
    const [newPassword] = await db
      .insert(sitePasswords)
      .values({
        ...password,
        passwordHash
      })
      .returning();
    return newPassword;
  }

  async deleteSitePassword(id: string): Promise<void> {
    await db.delete(sitePasswords).where(eq(sitePasswords.id, id));
  }

  async verifySitePassword(siteId: string, password: string): Promise<SitePassword | null> {
    const passwords = await this.getSitePasswords(siteId);
    for (const pw of passwords) {
      const match = await bcrypt.compare(password, pw.passwordHash);
      if (match) {
        return pw;
      }
    }
    return null;
  }

  async incrementPasswordUsage(id: string): Promise<void> {
    const [pw] = await db.select().from(sitePasswords).where(eq(sitePasswords.id, id));
    if (pw) {
      await db
        .update(sitePasswords)
        .set({ 
          usageCount: pw.usageCount + 1, 
          lastUsedAt: new Date() 
        })
        .where(eq(sitePasswords.id, id));
    }
  }

  // Partner membership methods
  async getPartnerMembership(partnerKey: string, email: string): Promise<PartnerMembership | undefined> {
    const [membership] = await db
      .select()
      .from(partnerMemberships)
      .where(and(
        eq(partnerMemberships.partnerKey, partnerKey),
        eq(partnerMemberships.email, email.toLowerCase())
      ));
    return membership;
  }

  async upsertPartnerMembership(membership: InsertPartnerMembership): Promise<PartnerMembership> {
    const email = membership.email.toLowerCase();
    const existing = await this.getPartnerMembership(membership.partnerKey, email);
    
    if (existing) {
      const [updated] = await db
        .update(partnerMemberships)
        .set({
          isActive: membership.isActive,
          discountPercent: membership.discountPercent,
          expiresAt: membership.expiresAt,
          memberId: membership.memberId,
          syncedAt: new Date(),
        })
        .where(eq(partnerMemberships.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(partnerMemberships)
        .values({
          ...membership,
          email,
        })
        .returning();
      return created;
    }
  }

  async deactivatePartnerMembership(partnerKey: string, email: string): Promise<void> {
    await db
      .update(partnerMemberships)
      .set({ isActive: false, syncedAt: new Date() })
      .where(and(
        eq(partnerMemberships.partnerKey, partnerKey),
        eq(partnerMemberships.email, email.toLowerCase())
      ));
  }

  async getActivePartnerDiscount(email: string): Promise<number | null> {
    if (!email) return null;
    
    const [membership] = await db
      .select()
      .from(partnerMemberships)
      .where(and(
        eq(partnerMemberships.email, email.toLowerCase()),
        eq(partnerMemberships.isActive, true)
      ));
    
    if (!membership) return null;
    
    // Check if membership is expired
    if (membership.expiresAt && new Date(membership.expiresAt) < new Date()) {
      return null;
    }
    
    return membership.discountPercent;
  }

  // Analytics email methods
  async getUsersForAnalyticsEmail(): Promise<User[]> {
    // Get the first day of the current month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get users who have email and haven't received an analytics email this month
    const result = await db
      .select()
      .from(users)
      .where(and(
        isNotNull(users.email),
        or(
          isNull(users.lastAnalyticsEmailAt),
          lt(users.lastAnalyticsEmailAt, firstOfMonth)
        )
      ));
    
    return result;
  }

  async markAnalyticsEmailSent(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastAnalyticsEmailAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Daily stats methods
  async recordDailyStats(siteId: string, isNewVisitor: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Atomic upsert using ON CONFLICT
    await db
      .insert(siteDailyStats)
      .values({
        siteId,
        date: today,
        views: 1,
        uniqueVisitors: isNewVisitor ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [siteDailyStats.siteId, siteDailyStats.date],
        set: {
          views: sql`${siteDailyStats.views} + 1`,
          uniqueVisitors: isNewVisitor 
            ? sql`${siteDailyStats.uniqueVisitors} + 1` 
            : siteDailyStats.uniqueVisitors,
        },
      });
  }

  async getDailyStats(siteId: string, days: number): Promise<SiteDailyStat[]> {
    // Calculate the start date (days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];
    
    const result = await db
      .select()
      .from(siteDailyStats)
      .where(and(
        eq(siteDailyStats.siteId, siteId),
        gte(siteDailyStats.date, startDateStr)
      ))
      .orderBy(siteDailyStats.date);
    
    return result;
  }

  // Traffic source methods
  async recordTrafficSource(siteId: string, source: TrafficSourceType, referrer?: string): Promise<void> {
    // Atomic upsert - increment count if source exists, otherwise insert new record
    await db
      .insert(siteTrafficSources)
      .values({
        siteId,
        source,
        referrer: referrer || null,
        count: 1,
      })
      .onConflictDoUpdate({
        target: [siteTrafficSources.siteId, siteTrafficSources.source],
        set: {
          count: sql`${siteTrafficSources.count} + 1`,
        },
      });
  }

  async getTrafficSources(siteId: string): Promise<SiteTrafficSource[]> {
    return db
      .select()
      .from(siteTrafficSources)
      .where(eq(siteTrafficSources.siteId, siteId))
      .orderBy(desc(siteTrafficSources.count));
  }

  // ==================== BROKERAGE METHODS ====================
  
  async createBrokerage(brokerage: InsertBrokerage): Promise<Brokerage> {
    const [created] = await db.insert(brokerages).values(brokerage).returning();
    return created;
  }

  async getBrokerage(id: string): Promise<Brokerage | undefined> {
    const [brokerage] = await db.select().from(brokerages).where(eq(brokerages.id, id));
    return brokerage || undefined;
  }

  async getBrokerageByOwner(ownerUserId: string): Promise<Brokerage | undefined> {
    const [brokerage] = await db.select().from(brokerages).where(eq(brokerages.ownerUserId, ownerUserId));
    return brokerage || undefined;
  }

  async updateBrokerage(id: string, updates: Partial<Brokerage>): Promise<Brokerage> {
    const [updated] = await db
      .update(brokerages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brokerages.id, id))
      .returning();
    return updated;
  }

  // Brokerage member methods
  async addBrokerageMember(member: InsertBrokerageMember): Promise<BrokerageMember> {
    const [created] = await db.insert(brokerageMembers).values(member).returning();
    return created;
  }

  async getBrokerageMembers(brokerageId: string): Promise<BrokerageMember[]> {
    return db
      .select()
      .from(brokerageMembers)
      .where(eq(brokerageMembers.brokerageId, brokerageId));
  }

  async getBrokerageMembership(userId: string): Promise<BrokerageMember | undefined> {
    const [membership] = await db
      .select()
      .from(brokerageMembers)
      .where(eq(brokerageMembers.userId, userId));
    return membership || undefined;
  }

  async updateBrokerageMember(id: string, updates: Partial<BrokerageMember>): Promise<BrokerageMember> {
    const [updated] = await db
      .update(brokerageMembers)
      .set(updates)
      .where(eq(brokerageMembers.id, id))
      .returning();
    return updated;
  }

  async removeBrokerageMember(id: string): Promise<void> {
    await db.delete(brokerageMembers).where(eq(brokerageMembers.id, id));
  }

  async getBrokerageMemberCount(brokerageId: string): Promise<number> {
    const members = await db
      .select()
      .from(brokerageMembers)
      .where(and(
        eq(brokerageMembers.brokerageId, brokerageId),
        eq(brokerageMembers.status, 'active')
      ));
    return members.length;
  }

  // Brokerage group methods
  async createBrokerageGroup(group: InsertBrokerageGroup): Promise<BrokerageGroup> {
    const [created] = await db.insert(brokerageGroups).values(group).returning();
    return created;
  }

  async getBrokerageGroups(brokerageId: string): Promise<BrokerageGroup[]> {
    return db
      .select()
      .from(brokerageGroups)
      .where(eq(brokerageGroups.brokerageId, brokerageId));
  }

  async getBrokerageGroup(id: string): Promise<BrokerageGroup | undefined> {
    const [group] = await db.select().from(brokerageGroups).where(eq(brokerageGroups.id, id));
    return group || undefined;
  }

  async updateBrokerageGroup(id: string, updates: Partial<BrokerageGroup>): Promise<BrokerageGroup> {
    const [updated] = await db
      .update(brokerageGroups)
      .set(updates)
      .where(eq(brokerageGroups.id, id))
      .returning();
    return updated;
  }

  async deleteBrokerageGroup(id: string): Promise<void> {
    // First remove all group members and template assignments
    await db.delete(brokerageGroupMembers).where(eq(brokerageGroupMembers.groupId, id));
    await db.delete(brokerageGroupTemplates).where(eq(brokerageGroupTemplates.groupId, id));
    await db.delete(brokerageGroups).where(eq(brokerageGroups.id, id));
  }

  // Brokerage group member methods
  async addUserToGroup(groupId: string, userId: string): Promise<BrokerageGroupMember> {
    const [created] = await db
      .insert(brokerageGroupMembers)
      .values({ groupId, userId })
      .returning();
    return created;
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    await db
      .delete(brokerageGroupMembers)
      .where(and(
        eq(brokerageGroupMembers.groupId, groupId),
        eq(brokerageGroupMembers.userId, userId)
      ));
  }

  async getGroupMembers(groupId: string): Promise<BrokerageGroupMember[]> {
    return db
      .select()
      .from(brokerageGroupMembers)
      .where(eq(brokerageGroupMembers.groupId, groupId));
  }

  async getUserGroups(userId: string): Promise<BrokerageGroup[]> {
    const memberships = await db
      .select()
      .from(brokerageGroupMembers)
      .where(eq(brokerageGroupMembers.userId, userId));
    
    if (memberships.length === 0) return [];
    
    const groupIds = memberships.map(m => m.groupId);
    const groups = await db
      .select()
      .from(brokerageGroups)
      .where(sql`${brokerageGroups.id} IN (${sql.join(groupIds.map(id => sql`${id}`), sql`, `)})`);
    
    return groups;
  }

  // Brokerage template methods
  async assignTemplateToBrokerage(
    brokerageId: string, 
    templateType: string, 
    templateId: string, 
    assignedBy?: string
  ): Promise<BrokerageTemplate> {
    const [created] = await db
      .insert(brokerageTemplates)
      .values({ brokerageId, templateType, templateId, assignedBy })
      .returning();
    return created;
  }

  async getBrokerageTemplates(brokerageId: string): Promise<BrokerageTemplate[]> {
    return db
      .select()
      .from(brokerageTemplates)
      .where(eq(brokerageTemplates.brokerageId, brokerageId));
  }

  async getBrokerageTemplate(id: string): Promise<BrokerageTemplate | undefined> {
    const [template] = await db
      .select()
      .from(brokerageTemplates)
      .where(eq(brokerageTemplates.id, id));
    return template || undefined;
  }

  async updateBrokerageTemplate(id: string, updates: Partial<BrokerageTemplate>): Promise<BrokerageTemplate> {
    const { id: _id, createdAt: _createdAt, ...updateData } = updates;
    const [updated] = await db
      .update(brokerageTemplates)
      .set(updateData)
      .where(eq(brokerageTemplates.id, id))
      .returning();
    return updated;
  }

  async getAllBrokerages(): Promise<Brokerage[]> {
    return db.select().from(brokerages);
  }

  async getAllBrokerageTemplates(): Promise<BrokerageTemplate[]> {
    return db.select().from(brokerageTemplates);
  }

  async removeBrokerageTemplate(id: string): Promise<void> {
    // Remove group assignments first
    await db.delete(brokerageGroupTemplates).where(eq(brokerageGroupTemplates.brokerageTemplateId, id));
    await db.delete(brokerageTemplates).where(eq(brokerageTemplates.id, id));
  }

  // Brokerage group template methods
  async assignTemplateToGroup(brokerageTemplateId: string, groupId: string): Promise<BrokerageGroupTemplate> {
    const [created] = await db
      .insert(brokerageGroupTemplates)
      .values({ brokerageTemplateId, groupId })
      .returning();
    return created;
  }

  async removeTemplateFromGroup(brokerageTemplateId: string, groupId: string): Promise<void> {
    await db
      .delete(brokerageGroupTemplates)
      .where(and(
        eq(brokerageGroupTemplates.brokerageTemplateId, brokerageTemplateId),
        eq(brokerageGroupTemplates.groupId, groupId)
      ));
  }

  async getGroupTemplates(groupId: string): Promise<BrokerageTemplate[]> {
    const assignments = await db
      .select()
      .from(brokerageGroupTemplates)
      .where(eq(brokerageGroupTemplates.groupId, groupId));
    
    if (assignments.length === 0) return [];
    
    const templateIds = assignments.map(a => a.brokerageTemplateId);
    const templates = await db
      .select()
      .from(brokerageTemplates)
      .where(sql`${brokerageTemplates.id} IN (${sql.join(templateIds.map(id => sql`${id}`), sql`, `)})`);
    
    return templates;
  }

  async getTemplateGroupAssignments(brokerageTemplateId: string): Promise<BrokerageGroupTemplate[]> {
    return db
      .select()
      .from(brokerageGroupTemplates)
      .where(eq(brokerageGroupTemplates.brokerageTemplateId, brokerageTemplateId));
  }

  async getTemplatesForUser(userId: string): Promise<{ layouts: Layout[]; themes: Theme[] }> {
    // Get all brokerage-assigned template IDs to exclude from public results
    const allBrokerageTemplates = await db.select().from(brokerageTemplates);
    const brokerageLayoutIds = allBrokerageTemplates
      .filter(t => t.templateType === 'layout')
      .map(t => t.templateId);
    const brokerageThemeIds = allBrokerageTemplates
      .filter(t => t.templateType === 'theme')
      .map(t => t.templateId);
    
    // Get all public templates (excluding brokerage-assigned ones)
    let publicLayouts = await db
      .select()
      .from(layouts)
      .where(and(eq(layouts.type, 'preset'), eq(layouts.enabled, true)));
    
    // Filter out brokerage-assigned layouts from public results
    publicLayouts = publicLayouts.filter(l => !brokerageLayoutIds.includes(l.id));
    
    let publicThemes = await db
      .select()
      .from(themes)
      .where(eq(themes.type, 'preset'));
    
    // Filter out brokerage-assigned themes from public results
    publicThemes = publicThemes.filter(t => !brokerageThemeIds.includes(t.id));
    
    // Check if user is in a brokerage
    const membership = await this.getBrokerageMembership(userId);
    if (!membership) {
      return { layouts: publicLayouts, themes: publicThemes };
    }
    
    // Get all templates for this brokerage
    const userBrokerageTemplates = await this.getBrokerageTemplates(membership.brokerageId);
    
    // Get user's groups
    const userGroups = await this.getUserGroups(userId);
    const userGroupIds = userGroups.map(g => g.id);
    
    // For each brokerage template, check if it has group assignments
    // If NO group assignments → available to all agents
    // If HAS group assignments → only available if user is in one of those groups
    const accessibleTemplateIds: string[] = [];
    
    for (const template of userBrokerageTemplates) {
      const groupAssignments = await this.getTemplateGroupAssignments(template.id);
      
      if (groupAssignments.length === 0) {
        // No group assignments = available to all agents in brokerage
        accessibleTemplateIds.push(template.templateId);
      } else {
        // Has group assignments = check if user is in any of those groups
        const isInAssignedGroup = groupAssignments.some(ga => userGroupIds.includes(ga.groupId));
        if (isInAssignedGroup) {
          accessibleTemplateIds.push(template.templateId);
        }
      }
    }
    
    if (accessibleTemplateIds.length === 0) {
      return { layouts: publicLayouts, themes: publicThemes };
    }
    
    // Get the actual layout/theme records for assigned templates
    const assignedLayouts = await db
      .select()
      .from(layouts)
      .where(sql`${layouts.id} IN (${sql.join(accessibleTemplateIds.map(id => sql`${id}`), sql`, `)})`);
    
    const assignedThemes = await db
      .select()
      .from(themes)
      .where(sql`${themes.id} IN (${sql.join(accessibleTemplateIds.map(id => sql`${id}`), sql`, `)})`);
    
    // Combine public and assigned templates (deduplicated)
    const allLayouts = [...publicLayouts];
    for (const layout of assignedLayouts) {
      if (!allLayouts.find(l => l.id === layout.id)) {
        allLayouts.push(layout);
      }
    }
    
    const allThemes = [...publicThemes];
    for (const theme of assignedThemes) {
      if (!allThemes.find(t => t.id === theme.id)) {
        allThemes.push(theme);
      }
    }
    
    return { layouts: allLayouts, themes: allThemes };
  }

  // Brokerage site management
  async getBrokerageSites(brokerageId: string, search?: string): Promise<Site[]> {
    // Get all members of the brokerage
    const members = await this.getBrokerageMembers(brokerageId);
    const memberIds = members.map(m => m.userId);
    
    if (memberIds.length === 0) return [];
    
    // Get all sites from brokerage members
    let allSites = await db
      .select()
      .from(sites)
      .where(sql`${sites.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`, `)})`);
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      allSites = allSites.filter(site => 
        site.address?.toLowerCase().includes(searchLower) ||
        site.subdomain?.toLowerCase().includes(searchLower) ||
        site.customDomain?.toLowerCase().includes(searchLower) ||
        site.title?.toLowerCase().includes(searchLower)
      );
    }
    
    return allSites;
  }
  
  // Invitation token methods
  async createInvitationToken(memberId: string, tokenHash: string, expiresAt: Date): Promise<InvitationToken> {
    const [token] = await db.insert(invitationTokens).values({
      memberId,
      tokenHash,
      expiresAt,
    }).returning();
    return token;
  }
  
  async getInvitationTokenByHash(tokenHash: string): Promise<InvitationToken | undefined> {
    const [token] = await db.select().from(invitationTokens).where(eq(invitationTokens.tokenHash, tokenHash));
    return token || undefined;
  }
  
  async markTokenUsed(tokenId: string): Promise<void> {
    await db.update(invitationTokens).set({ usedAt: new Date() }).where(eq(invitationTokens.id, tokenId));
  }
  
  async deleteExpiredTokens(): Promise<void> {
    await db.delete(invitationTokens).where(lt(invitationTokens.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
