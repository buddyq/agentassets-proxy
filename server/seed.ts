import { db } from "./db";
import { users, themes } from "@shared/schema";
import { eq } from "drizzle-orm";

const PRESET_THEMES = [
  {
    id: 'sage-default',
    name: 'AgentAssets Sage',
    type: 'preset',
    colors: {
      primary: '#558B73',
      secondary: '#2C3E50',
      background: '#F8FAF9',
      text: '#2C3E50'
    },
    logoUrl: null,
    userId: null,
  },
  {
    id: 'ocean-blue',
    name: 'Coastal Blue',
    type: 'preset',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0f172a',
      background: '#f0f9ff',
      text: '#0f172a'
    },
    logoUrl: null,
    userId: null,
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    type: 'preset',
    colors: {
      primary: '#d4af37',
      secondary: '#1a1a1a',
      background: '#fafafa',
      text: '#1a1a1a'
    },
    logoUrl: null,
    userId: null,
  },
  {
    id: 'modern-black',
    name: 'Stark Modern',
    type: 'preset',
    colors: {
      primary: '#18181b',
      secondary: '#71717a',
      background: '#ffffff',
      text: '#18181b'
    },
    logoUrl: null,
    userId: null,
  }
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const demoEmail = "demo@agentassets.com";
  const [existingUser] = await db.select().from(users).where(eq(users.email, demoEmail));
  
  let userId: string;
  
  if (!existingUser) {
    const [newUser] = await db.insert(users).values({
      name: "Demo Agent",
      email: demoEmail,
      credits: 3
    }).returning();
    userId = newUser.id;
    console.log("✅ Created demo user:", newUser.email);
  } else {
    userId = existingUser.id;
    console.log("✅ Demo user already exists:", existingUser.email);
  }

  // Seed preset themes
  for (const theme of PRESET_THEMES) {
    const [existing] = await db.select().from(themes).where(eq(themes.id, theme.id));
    
    if (!existing) {
      await db.insert(themes).values(theme);
      console.log("✅ Created preset theme:", theme.name);
    } else {
      console.log("✅ Preset theme already exists:", theme.name);
    }
  }

  console.log("🎉 Seeding complete!");
  console.log(`Demo user ID: ${userId}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
