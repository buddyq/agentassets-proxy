import modernMinimalUrl from '@assets/generated_images/modern_minimalist_real_estate_website_template_preview.png';
import classicLuxuryUrl from '@assets/generated_images/classic_luxury_estate_website_template_preview.png';
import urbanLoftUrl from '@assets/generated_images/urban_modern_loft_website_template_preview.png';

// Types - re-export from shared schema
export type { Theme, Site, User } from '@shared/schema';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

// Demo user ID (from seeded database)
export const DEMO_USER_ID = 'f862016a-922e-4658-ad8a-94335dd42795';

// Templates (these remain client-side as they're UI-only)
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
