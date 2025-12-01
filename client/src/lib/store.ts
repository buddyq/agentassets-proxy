import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import modernMinimalUrl from '@assets/generated_images/modern_minimalist_real_estate_website_template_preview.png';
import classicLuxuryUrl from '@assets/generated_images/classic_luxury_estate_website_template_preview.png';
import urbanLoftUrl from '@assets/generated_images/urban_modern_loft_website_template_preview.png';

// Types
export interface Theme {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  logoUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface Site {
  id: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string;
  templateId: string;
  themeId: string;
  status: 'draft' | 'published';
  customDomain?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  credits: number;
}

// Mock Data
export const TEMPLATES: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    description: 'Clean lines and whitespace for modern properties.',
    thumbnailUrl: modernMinimalUrl
  },
  {
    id: 'classic-luxury',
    name: 'Classic Luxury',
    description: 'Elegant serif typography for high-end estates.',
    thumbnailUrl: classicLuxuryUrl
  },
  {
    id: 'urban-loft',
    name: 'Urban Loft',
    description: 'Bold and industrial style for city living.',
    thumbnailUrl: urbanLoftUrl
  }
];

export const PRESET_THEMES: Theme[] = [
  {
    id: 'sage-default',
    name: 'AgentAssets Sage',
    type: 'preset',
    colors: {
      primary: '#558B73',
      secondary: '#2C3E50',
      background: '#F8FAF9',
      text: '#2C3E50'
    }
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
    }
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
    }
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
    }
  }
];

interface AppState {
  user: User;
  sites: Site[];
  themes: Theme[];
  addSite: (site: Omit<Site, 'id' | 'createdAt'>) => void;
  updateSite: (id: string, updates: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  addTheme: (theme: Omit<Theme, 'id'>) => void;
  updateTheme: (id: string, updates: Partial<Theme>) => void;
  addCredits: (amount: number) => void;
  deductCredit: () => boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'user-1',
        name: 'Jane Agent',
        credits: 2
      },
      sites: [],
      themes: [...PRESET_THEMES],
      
      addSite: (site) => set((state) => ({
        sites: [...state.sites, { 
          ...site, 
          id: Math.random().toString(36).substr(2, 9), 
          createdAt: new Date().toISOString() 
        }]
      })),

      updateSite: (id, updates) => set((state) => ({
        sites: state.sites.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),

      deleteSite: (id) => set((state) => ({
        sites: state.sites.filter((s) => s.id !== id)
      })),

      addTheme: (theme) => set((state) => ({
        themes: [...state.themes, { ...theme, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateTheme: (id, updates) => set((state) => ({
        themes: state.themes.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),

      addCredits: (amount) => set((state) => ({
        user: { ...state.user, credits: state.user.credits + amount }
      })),

      deductCredit: () => {
        const { user } = get();
        if (user.credits > 0) {
          set({ user: { ...user, credits: user.credits - 1 } });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'agent-assets-storage',
    }
  )
);
