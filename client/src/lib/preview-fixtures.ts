interface HeroSlide {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

interface OpenHouseEvent {
  date: string;
  startTime: string;
  endTime: string;
}

interface PreviewSite {
  id: string;
  userId: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  yearBuilt: string | null;
  lotSize: string | null;
  stories: string | null;
  description: string | null;
  descriptionImage: string | null;
  imageUrl: string | null;
  logo: string | null;
  heroLogo: string | null;
  photos: string[] | null;
  heroPhotos: string[] | null;
  heroSlides: HeroSlide[];
  themeId: string;
  layoutId: string;
  features: string[];
  documents: unknown[];
  videoUrl: string | null;
  customDomain: string | null;
  stats: { views: number; uniqueVisitors: number; leads: number };
  buyerAgentComp: string | null;
  openHouses: OpenHouseEvent[];
  brochureUrl: string | null;
  contentGridImage1: string | null;
  contentGridImage2: string | null;
  templateId: string | null;
  customDetails: unknown[];
  status: string;
}

interface PreviewTheme {
  id: string;
  userId: string | null;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  type: string;
  logoUrl: string | null;
}

export const previewSite: PreviewSite = {
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
  status: "active"
};

export const previewTheme: PreviewTheme = {
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
  logoUrl: null
};

export const previewAgentInfo = {
  name: "Jane Smith",
  email: "jane@realestate.com",
  phone: "(512) 555-0123"
};

const layoutImages: Record<string, { hero: string; photos: string[] }> = {
  'layout-minimal': {
    hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop'
    ]
  },
  'layout-modern': {
    hero: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&h=1080&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop'
    ]
  },
  'layout-shoalwood': {
    hero: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&h=1080&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop'
    ]
  },
  'layout-magazine': {
    hero: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&h=1080&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop'
    ]
  },
  'layout-classic': {
    hero: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop'
    ]
  }
};

export function getSiteForLayout(layoutId: string): PreviewSite {
  const images = layoutImages[layoutId] || layoutImages['layout-minimal'];
  return {
    ...previewSite,
    layoutId,
    heroPhotos: [images.hero],
    photos: images.photos,
    heroSlides: [
      { title: "Modern Estate Living", subtitle: "Luxury Redefined", backgroundImage: images.hero }
    ]
  };
}

export type { PreviewSite, PreviewTheme };
