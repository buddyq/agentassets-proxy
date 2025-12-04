import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
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
  phone: text("phone"),
  brokerage: text("brokerage"),
  teamName: text("team_name"),
  address: text("address"),
  socialMedia: jsonb("social_media").$type<{
    instagram?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    x?: string;
  }>().default({}),
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
