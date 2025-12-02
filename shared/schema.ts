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
  credits: integer("credits").notNull().default(3),
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

// Themes table
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

// Sites table
export const sites = pgTable("sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  title: text("title"),
  address: text("address").notNull(),
  price: text("price").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  sqft: integer("sqft").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  photos: text("photos").array(),
  videoUrl: text("video_url"),
  templateId: text("template_id").notNull(),
  themeId: text("theme_id").notNull(),
  customDomain: text("custom_domain"),
  status: text("status").notNull().default('draft'),
  stats: jsonb("stats").notNull().$type<{
    views: number;
    uniqueVisitors: number;
    leads: number;
  }>().default({ views: 0, uniqueVisitors: 0, leads: 0 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSchema = createInsertSchema(sites).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;
