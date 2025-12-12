import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with username/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password"),
  email: text("email"),
  name: text("name"),
  profileImageUrl: text("profile_image_url"),
  logo: text("logo"),
  credits: integer("credits").notNull().default(0),
  trialCredits: integer("trial_credits").notNull().default(1),
  trialEndsAt: timestamp("trial_ends_at").default(sql`now() + interval '7 days'`),
  phone: text("phone"),
  brokerage: text("brokerage"),
  teamName: text("team_name"),
  address: text("address"),
  isAdmin: boolean("is_admin").notNull().default(false),
  socialMedia: jsonb("social_media").$type<{
    instagram?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    x?: string;
  }>().default({}),
  lastAnalyticsEmailAt: timestamp("last_analytics_email_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Layouts table - defines page structure, sections, typography
export const layouts = pgTable("layouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  type: text("type").notNull().default('preset'),
  enabled: boolean("enabled").notNull().default(true),
  structure: jsonb("structure").notNull().$type<{
    heroStyle: 'fullscreen' | 'split' | 'minimal' | 'slider';
    galleryStyle: 'grid' | 'masonry' | 'carousel' | 'lightbox';
    detailsStyle: 'sidebar' | 'stacked' | 'cards' | 'minimal';
    typography: {
      headingFont: string;
      bodyFont: string;
      headingWeight: string;
      scale: 'compact' | 'normal' | 'spacious';
    };
    sections: string[];
  }>(),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLayoutSchema = createInsertSchema(layouts).omit({ id: true, createdAt: true }).extend({
  thumbnailUrl: z.string().nullable().optional(),
});
export type InsertLayout = z.infer<typeof insertLayoutSchema>;
export type Layout = typeof layouts.$inferSelect;

// Themes table - defines color palette only
export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  colors: jsonb("colors").notNull().$type<{
    primary: string;
    secondary: string;
    background: string;
    text: string;
  }>(),
  logoUrl: text("logo_url"),
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertThemeSchema = createInsertSchema(themes).omit({ id: true, createdAt: true });
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;

// Custom detail field type
export type CustomDetail = {
  label: string;
  value: string;
};

// Hero slide type for Modern layout
export type HeroSlide = {
  title: string;
  subtitle: string;
  backgroundImage?: string;
};

// Document type for site documents
export type SiteDocument = {
  name: string;
  url: string;
};

// Open house event type for Magazine layout
export type OpenHouseEvent = {
  label?: string; // e.g., "Broker Open"
  date: string;
  startTime: string;
  endTime: string;
};


// Sites table
export const sites = pgTable("sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  brokerageId: text("brokerage_id"), // If created under a brokerage account
  subdomain: text("subdomain").unique(),
  title: text("title"),
  address: text("address").notNull(),
  price: text("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  sqft: integer("sqft"),
  lotSize: text("lot_size"),
  yearBuilt: text("year_built"),
  stories: text("stories"),
  description: text("description"),
  descriptionImage: text("description_image"),
  imageUrl: text("image_url"),
  logo: text("logo"),
  photos: text("photos").array(),
  heroPhotos: text("hero_photos").array(),
  heroSlides: jsonb("hero_slides").$type<HeroSlide[]>().default([]),
  heroLogo: text("hero_logo"),
  videoUrl: text("video_url"),
  documents: jsonb("documents").$type<SiteDocument[]>().default([]),
  // Magazine layout specific fields
  buyerAgentComp: text("buyer_agent_comp"), // e.g., "3% Buyers Agent Compensation"
  openHouses: jsonb("open_houses").$type<OpenHouseEvent[]>().default([]),
  brochureUrl: text("brochure_url"),
  contentGridImage1: text("content_grid_image_1"), // Image for grid position 2 (top right)
  contentGridImage2: text("content_grid_image_2"), // Image for grid position 3 (bottom left)
  features: text("features").array().default([]), // Feature tags like "Pool", "Ocean Views", etc.
  layoutId: text("layout_id"),
  templateId: text("template_id"),
  themeId: text("theme_id").notNull(),
  customDomain: text("custom_domain"),
  customDetails: jsonb("custom_details").$type<CustomDetail[]>().default([]),
  status: text("status").notNull().default('draft'),
  isTrial: boolean("is_trial").notNull().default(false),
  unpublishedAt: timestamp("unpublished_at"),
  stats: jsonb("stats").notNull().$type<{
    views: number;
    uniqueVisitors: number;
    leads: number;
  }>().default({ views: 0, uniqueVisitors: 0, leads: 0 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull().default(sql`now() + interval '3 months'`),
});

const customDetailSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.string().min(1).max(100),
});

const heroSlideSchema = z.object({
  title: z.string().max(100),
  subtitle: z.string().max(200),
  backgroundImage: z.string().optional(),
});

const documentSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().min(1),
});

const openHouseSchema = z.object({
  label: z.string().max(50).optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const insertSiteSchema = createInsertSchema(sites).omit({ id: true, createdAt: true, updatedAt: true, expiresAt: true }).extend({
  templateId: z.string().nullable().optional(),
  customDetails: z.array(customDetailSchema).optional().default([]),
  heroSlides: z.array(heroSlideSchema).max(3).optional().default([]),
  heroLogo: z.string().nullable().optional(),
  documents: z.array(documentSchema).optional().default([]),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  sqft: z.number().nullable().optional(),
  // Magazine layout fields
  buyerAgentComp: z.string().nullable().optional(),
  openHouses: z.array(openHouseSchema).optional().default([]),
  brochureUrl: z.string().nullable().optional(),
  features: z.array(z.string()).optional().default([]),
});
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;

// Leads/Inquiries table for contact form submissions
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: text("site_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default('new'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Site passwords table for password-protected sites
export const sitePasswords = pgTable("site_passwords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: text("site_id").notNull(),
  passwordHash: text("password_hash").notNull(),
  label: text("label"), // Optional label like "For Broker", "For Buyer #1"
  usageCount: integer("usage_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSitePasswordSchema = createInsertSchema(sitePasswords).omit({ id: true, createdAt: true, usageCount: true, lastUsedAt: true });
export type InsertSitePassword = z.infer<typeof insertSitePasswordSchema>;
export type SitePassword = typeof sitePasswords.$inferSelect;

// Coupons/Promotions table
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull(), // 'free_credits', 'percentage_off', 'fixed_amount_off', 'first_site_free'
  value: integer("value").notNull(), // credits to give, percentage, or fixed amount in cents
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  minPurchase: integer("min_purchase"), // minimum credits purchase to apply (for discounts)
  isActive: text("is_active").notNull().default('true'),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true, usedCount: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// Coupon redemptions tracking
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: text("coupon_id").notNull(),
  userId: text("user_id").notNull(),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
});

export type CouponRedemption = typeof couponRedemptions.$inferSelect;

// Partner memberships table - tracks users from partner sites (e.g., ATXPocket)
export const partnerMemberships = pgTable("partner_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerKey: text("partner_key").notNull(), // e.g., "atxpocket"
  email: text("email").notNull(),
  memberId: text("member_id"), // ID from the partner system
  isActive: boolean("is_active").notNull().default(true),
  discountPercent: integer("discount_percent").notNull().default(20),
  expiresAt: timestamp("expires_at"), // When the membership expires (null = no expiry)
  syncedAt: timestamp("synced_at").notNull().defaultNow(), // Last sync from partner
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_partner_email").on(table.partnerKey, table.email),
]);

export const insertPartnerMembershipSchema = createInsertSchema(partnerMemberships).omit({ 
  id: true, 
  createdAt: true,
  syncedAt: true,
});
export type InsertPartnerMembership = z.infer<typeof insertPartnerMembershipSchema>;
export type PartnerMembership = typeof partnerMemberships.$inferSelect;

// Daily analytics stats table - tracks views and visitors per day per site
export const siteDailyStats = pgTable("site_daily_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: text("site_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format for easy grouping
  views: integer("views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
}, (table) => [
  index("IDX_daily_stats_site_date").on(table.siteId, table.date),
]);

export type SiteDailyStat = typeof siteDailyStats.$inferSelect;

// Traffic source type - where visitors come from
export type TrafficSourceType = 'direct' | 'social' | 'search' | 'referral';

// Traffic sources table - tracks where visitors come from per site
export const siteTrafficSources = pgTable("site_traffic_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteId: text("site_id").notNull(),
  source: text("source").notNull(), // 'direct', 'social', 'search', 'referral'
  referrer: text("referrer"), // Full referrer domain when available
  count: integer("count").notNull().default(1),
}, (table) => [
  index("IDX_traffic_site_source").on(table.siteId, table.source),
]);

export type SiteTrafficSource = typeof siteTrafficSources.$inferSelect;

// ==================== BROKERAGE SYSTEM ====================

// Brokerages table - main brokerage entity
export const brokerages = pgTable("brokerages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id").notNull(), // The admin user who owns this brokerage
  logo: text("logo"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  // Trial period
  trialEndsAt: timestamp("trial_ends_at").default(sql`now() + interval '7 days'`),
  plannedAgentCount: text("planned_agent_count"), // Survey field: expected agent count by end of year
  // Stripe billing
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Seat management: base plan includes 15, can purchase more
  includedSeats: integer("included_seats").notNull().default(15),
  additionalSeats: integer("additional_seats").notNull().default(0),
  // Status
  status: text("status").notNull().default('trial'), // 'trial', 'active', 'suspended', 'cancelled'
  // Onboarding milestones
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  hasAddedFirstAgent: boolean("has_added_first_agent").notNull().default(false),
  hasCreatedFirstGroup: boolean("has_created_first_group").notNull().default(false),
  hasExploredTemplates: boolean("has_explored_templates").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBrokerageSchema = createInsertSchema(brokerages).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});
export type InsertBrokerage = z.infer<typeof insertBrokerageSchema>;
export type Brokerage = typeof brokerages.$inferSelect;

// Brokerage members - links users to brokerages with roles
export const brokerageMembers = pgTable("brokerage_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brokerageId: text("brokerage_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default('agent'), // 'admin', 'agent'
  status: text("status").notNull().default('active'), // 'active', 'invited', 'deactivated'
  invitedBy: text("invited_by"),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at"),
  lastAccessAt: timestamp("last_access_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_brokerage_members_brokerage").on(table.brokerageId),
  index("IDX_brokerage_members_user").on(table.userId),
]);

export const insertBrokerageMemberSchema = createInsertSchema(brokerageMembers).omit({ 
  id: true, 
  createdAt: true,
});
export type InsertBrokerageMember = z.infer<typeof insertBrokerageMemberSchema>;
export type BrokerageMember = typeof brokerageMembers.$inferSelect;

// Brokerage groups - groups within a brokerage (e.g., "The Quaid Group")
export const brokerageGroups = pgTable("brokerage_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brokerageId: text("brokerage_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_brokerage_groups_brokerage").on(table.brokerageId),
]);

export const insertBrokerageGroupSchema = createInsertSchema(brokerageGroups).omit({ 
  id: true, 
  createdAt: true,
});
export type InsertBrokerageGroup = z.infer<typeof insertBrokerageGroupSchema>;
export type BrokerageGroup = typeof brokerageGroups.$inferSelect;

// Brokerage group members - links agents to groups
export const brokerageGroupMembers = pgTable("brokerage_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_group_members_group").on(table.groupId),
  index("IDX_group_members_user").on(table.userId),
]);

export type BrokerageGroupMember = typeof brokerageGroupMembers.$inferSelect;

// Brokerage templates - custom layouts/themes assigned to a brokerage by AgentAssets admin
export const brokerageTemplates = pgTable("brokerage_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brokerageId: text("brokerage_id").notNull(),
  templateType: text("template_type").notNull(), // 'layout' or 'theme'
  templateId: text("template_id").notNull(), // References layouts.id or themes.id
  assignedBy: text("assigned_by"), // AgentAssets admin who assigned it
  availableToAll: boolean("available_to_all").notNull().default(false), // When true, all agents in brokerage can use this
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_brokerage_templates_brokerage").on(table.brokerageId),
]);

export type BrokerageTemplate = typeof brokerageTemplates.$inferSelect;

// Brokerage group templates - links templates to specific groups within a brokerage
export const brokerageGroupTemplates = pgTable("brokerage_group_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brokerageTemplateId: text("brokerage_template_id").notNull(),
  groupId: text("group_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_group_templates_template").on(table.brokerageTemplateId),
  index("IDX_group_templates_group").on(table.groupId),
]);

export type BrokerageGroupTemplate = typeof brokerageGroupTemplates.$inferSelect;

// Invitation tokens - for agent password setup
export const invitationTokens = pgTable("invitation_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: text("member_id").notNull(), // References brokerageMembers.id
  tokenHash: text("token_hash").notNull(), // Hashed token for security
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_invitation_tokens_member").on(table.memberId),
]);

export type InvitationToken = typeof invitationTokens.$inferSelect;
