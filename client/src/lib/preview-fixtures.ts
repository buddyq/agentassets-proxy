import type { Site, Theme } from "@shared/schema";

export const previewSite: Site = {
  id: "preview-site",
  userId: "preview-user",
  title: "Modern Estate Living",
  address: "1234 Luxury Lane, Austin, TX 78701",
  price: "$1,895,000",
  bedrooms: 5,
  bathrooms: 4,
  sqft: 4250,
  yearBuilt: "2021",
  lotSize: "0.45 acres",
  stories: null,
  description: "Stunning contemporary home with open floor plan, chef's kitchen with premium appliances, primary suite with spa-like bathroom, and resort-style backyard with pool and outdoor kitchen. Smart home technology throughout.",
  descriptionImage: null,
  imageUrl: null,
  logo: null,
  heroLogo: null,
  photos: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop"
  ],
  heroPhotos: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop"
  ],
  heroSlides: [
    { title: "Modern Estate Living", subtitle: "Luxury Redefined", backgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop" },
    { title: "Resort-Style Living", subtitle: "Your Private Oasis", backgroundImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop" }
  ],
  themeId: "preview-theme",
  layoutId: "layout-minimal",
  features: ["Pool", "Smart Home", "Chef's Kitchen", "Wine Cellar", "Home Theater", "3-Car Garage"],
  documents: [],
  videoUrl: null,
  customDomain: null,
  stats: { views: 0, uniqueVisitors: 0, leads: 0 },
  buyerAgentComp: "2.5%",
  openHouses: [
    { date: "2025-01-15", startTime: "1:00 PM", endTime: "4:00 PM" },
    { date: "2025-01-22", startTime: "11:00 AM", endTime: "2:00 PM" }
  ],
  brochureUrl: null,
  contentGridImage1: null,
  contentGridImage2: null,
  templateId: null,
  customDetails: [],
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
};

export const previewTheme: Theme = {
  id: "preview-theme",
  userId: null,
  name: "Modern Sage",
  colors: {
    primary: "#558B73",
    secondary: "#2C3E50",
    background: "#ffffff",
    text: "#1a1a1a"
  },
  type: "preset",
  logoUrl: null,
  createdAt: new Date()
};

export const previewAgentInfo = {
  name: "Jane Smith",
  email: "jane@realestate.com",
  phone: "(512) 555-0123"
};

export function getSiteForLayout(layoutId: string): Site {
  return {
    ...previewSite,
    layoutId
  };
}
