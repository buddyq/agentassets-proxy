import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, Site, Theme, Layout, Lead, Coupon } from '@shared/schema';

const API_BASE = '/api';

// Normalize object storage upload URL to the accessible path format
export function normalizeObjectUrl(rawUrl: string): string {
  if (!rawUrl.startsWith('https://storage.googleapis.com/')) {
    return rawUrl;
  }
  
  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname;
    
    // Extract the path after .private/ and before query params
    // Pattern: /bucket-name/.private/uploads/uuid
    const privateIndex = pathname.indexOf('.private/');
    if (privateIndex !== -1) {
      const relativePath = pathname.slice(privateIndex + '.private/'.length);
      return `/objects/${relativePath}`;
    }
    
    return pathname;
  } catch {
    return rawUrl;
  }
}

// Update credits for current user
export function useUpdateCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credits: number) => {
      const res = await fetch(`${API_BASE}/user/credits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      });
      if (!res.ok) throw new Error('Failed to update credits');
      return res.json() as Promise<User>;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/user'], updatedUser);
    }
  });
}

// Update logo for current user
export function useUpdateUserLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logo: string | null) => {
      const res = await fetch(`${API_BASE}/user/logo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo })
      });
      if (!res.ok) throw new Error('Failed to update logo');
      return res.json() as Promise<User>;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/user'], updatedUser);
    }
  });
}

// Update full user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<User>) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json() as Promise<User>;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/user'], updatedUser);
    }
  });
}

// Change user password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to change password');
      }
      return res.json();
    }
  });
}

// Get partner discount for current user
export function usePartnerDiscount() {
  return useQuery({
    queryKey: ['partner-discount'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/partner-discount`);
      if (!res.ok) throw new Error('Failed to fetch partner discount');
      return res.json() as Promise<{ discount: number | null }>;
    }
  });
}

// Stripe checkout
export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (packageId: 'starter' | 'growth' | 'agency') => {
      const res = await fetch(`${API_BASE}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      return res.json() as Promise<{ url: string }>;
    }
  });
}

// Sites API (uses authenticated user)
export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites`);
      if (!res.ok) throw new Error('Failed to fetch sites');
      return res.json() as Promise<Site[]>;
    }
  });
}

export function useSite(siteId: string) {
  return useQuery({
    queryKey: ['site', siteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}`);
      if (!res.ok) throw new Error('Failed to fetch site');
      return res.json() as Promise<Site>;
    },
    enabled: !!siteId
  });
}

export function useSiteByHost(host: string) {
  return useQuery({
    queryKey: ['site-by-host', host],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/by-host/${encodeURIComponent(host)}`);
      if (!res.ok) throw new Error('Failed to fetch site');
      return res.json() as Promise<Site>;
    },
    enabled: !!host
  });
}

export function useSiteBySlug(slug: string) {
  return useQuery({
    queryKey: ['site-by-slug', slug],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/by-slug/${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('Failed to fetch site');
      return res.json() as Promise<Site>;
    },
    enabled: !!slug
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'expiresAt'>) => {
      const res = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      });
      if (!res.ok) throw new Error('Failed to create site');
      return res.json() as Promise<Site>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Site> }) => {
      const res = await fetch(`${API_BASE}/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update site');
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

// Check if a slug is available
export function useCheckSlugAvailability() {
  return useMutation({
    mutationFn: async ({ slug, siteId }: { slug: string; siteId?: string }) => {
      const url = siteId 
        ? `${API_BASE}/sites/check-slug/${encodeURIComponent(slug)}?siteId=${siteId}`
        : `${API_BASE}/sites/check-slug/${encodeURIComponent(slug)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to check slug');
      return res.json() as Promise<{ available: boolean; reason: string | null }>;
    }
  });
}

// Update site slug
export function useUpdateSiteSlug() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slug }: { id: string; slug: string }) => {
      const res = await fetch(`${API_BASE}/sites/${id}/slug`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update slug');
      }
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/sites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete site');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    }
  });
}

export function useUnpublishSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/sites/${id}/unpublish`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unpublish site');
      }
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

export function useRepublishSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/sites/${id}/republish`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to republish site');
      }
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

// Themes API
export function useThemes(options?: { preset?: boolean; userId?: string; forUser?: boolean }) {
  return useQuery({
    queryKey: options?.forUser ? ['themes', 'forUser'] : options?.preset ? ['themes', 'preset'] : options?.userId ? ['themes', 'user', options.userId] : ['themes'],
    queryFn: async () => {
      let url = `${API_BASE}/themes`;
      const params = new URLSearchParams();
      if (options?.forUser) params.append('forUser', 'true');
      if (options?.preset) params.append('preset', 'true');
      if (options?.userId) params.append('userId', options.userId);
      if (params.toString()) url += `?${params}`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch themes');
      return res.json() as Promise<Theme[]>;
    }
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (theme: Omit<Theme, 'id' | 'createdAt' | 'userId'>) => {
      const res = await fetch(`${API_BASE}/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme)
      });
      if (!res.ok) throw new Error('Failed to create theme');
      return res.json() as Promise<Theme>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Theme> }) => {
      const res = await fetch(`${API_BASE}/themes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update theme');
      return res.json() as Promise<Theme>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/themes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete theme');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

// Photo upload API
export async function getUploadUrl(): Promise<{ method: "PUT"; url: string }> {
  const res = await fetch(`${API_BASE}/objects/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  const data = await res.json();
  return { method: "PUT", url: data.uploadURL };
}

export function useAddPhotoToSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, photoUrl }: { siteId: string; photoUrl: string }) => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl })
      });
      if (!res.ok) throw new Error('Failed to add photo');
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

export function useRemovePhotoFromSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, photoUrl }: { siteId: string; photoUrl: string }) => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl })
      });
      if (!res.ok) throw new Error('Failed to remove photo');
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

export function useReorderPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, photos }: { siteId: string; photos: string[] }) => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/photos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos })
      });
      if (!res.ok) throw new Error('Failed to reorder photos');
      return res.json() as Promise<Site>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.setQueryData(['site', data.id], data);
    }
  });
}

// Layouts API
export function useLayouts(options?: { preset?: boolean; userId?: string; enabledOnly?: boolean; forUser?: boolean }) {
  return useQuery({
    queryKey: options?.forUser 
      ? ['layouts', 'forUser'] 
      : options?.preset 
        ? ['layouts', 'preset', options.enabledOnly ? 'enabled' : 'all'] 
        : options?.userId 
          ? ['layouts', 'user', options.userId] 
          : ['layouts'],
    queryFn: async () => {
      let url = `${API_BASE}/layouts`;
      const params = new URLSearchParams();
      if (options?.forUser) params.append('forUser', 'true');
      if (options?.preset) params.append('preset', 'true');
      if (options?.userId) params.append('userId', options.userId);
      if (options?.enabledOnly) params.append('enabledOnly', 'true');
      if (params.toString()) url += `?${params}`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch layouts');
      return res.json() as Promise<Layout[]>;
    }
  });
}

export function useLayout(layoutId: string) {
  return useQuery({
    queryKey: ['layout', layoutId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/layouts/${layoutId}`);
      if (!res.ok) throw new Error('Failed to fetch layout');
      return res.json() as Promise<Layout>;
    },
    enabled: !!layoutId
  });
}

export function useCreateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (layout: Omit<Layout, 'id' | 'createdAt' | 'userId'>) => {
      const res = await fetch(`${API_BASE}/layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout)
      });
      if (!res.ok) throw new Error('Failed to create layout');
      return res.json() as Promise<Layout>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
    }
  });
}

export function useUpdateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Layout> }) => {
      const res = await fetch(`${API_BASE}/layouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update layout');
      return res.json() as Promise<Layout>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
    }
  });
}

export function useDeleteLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/layouts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete layout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts'] });
    }
  });
}

// Leads API
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/leads`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json() as Promise<Lead[]>;
    }
  });
}

export function useSiteLeads(siteId: string) {
  return useQuery({
    queryKey: ['leads', siteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/leads`);
      if (!res.ok) throw new Error('Failed to fetch site leads');
      return res.json() as Promise<Lead[]>;
    },
    enabled: !!siteId
  });
}

// ========= Admin API Hooks =========

// Admin Stats Types
export interface AdminStats {
  users: {
    total: number;
    new30d: number;
    new7d: number;
    brokerAccounts: number;
    individualAccounts: number;
    totalCreditsHeld: number;
  };
  sites: {
    total: number;
    published: number;
    draft: number;
    new30d: number;
    new7d: number;
    totalViews: number;
    totalUniqueVisitors: number;
  };
  leads: {
    total: number;
    new30d: number;
    new7d: number;
  };
  brokerages: {
    total: number;
  };
  recentUsers: Omit<User, 'password'>[];
  recentSites: Site[];
  topSitesByViews: Site[];
}

// Admin Stats
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json() as Promise<AdminStats>;
    }
  });
}

// Admin Sample Sites
export interface AdminSampleSite {
  layout: {
    id: string;
    name: string;
    sampleSiteSlug: string | null;
  };
  site: {
    id: string;
    title: string | null;
    address: string;
    photos: string[] | null;
    heroPhotos: string[] | null;
  } | null;
}

export function useAdminSampleSites() {
  return useQuery({
    queryKey: ['admin', 'sample-sites'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/sample-sites`);
      if (!res.ok) throw new Error('Failed to fetch sample sites');
      return res.json() as Promise<AdminSampleSite[]>;
    }
  });
}

// Admin Coupons
export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/coupons`);
      if (!res.ok) throw new Error('Failed to fetch coupons');
      return res.json() as Promise<Coupon[]>;
    }
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create coupon');
      }
      return res.json() as Promise<Coupon>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    }
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Coupon> }) => {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update coupon');
      }
      return res.json() as Promise<Coupon>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    }
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete coupon');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    }
  });
}

// Admin Users
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json() as Promise<Omit<User, 'password'>[]>;
    }
  });
}

export function useAdminUpdateUserCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, credits }: { id: string; credits: number }) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}/credits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      });
      if (!res.ok) throw new Error('Failed to update user credits');
      return res.json() as Promise<Omit<User, 'password'>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
}

export type AdminUserProfileUpdate = {
  name?: string;
  email?: string;
  phone?: string | null;
  brokerage?: string | null;
  teamName?: string | null;
  address?: string | null;
  credits?: number;
  isAdmin?: boolean;
};

export function useAdminUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AdminUserProfileUpdate }) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user profile');
      }
      return res.json() as Promise<Omit<User, 'password'>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
}

// User coupon redemption
export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`${API_BASE}/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to redeem coupon');
      }
      return res.json() as Promise<{ success: boolean; message: string; credits: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });
}

// Site password types
export type SitePasswordInfo = {
  id: string;
  label: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
};

// Site password management
export function useSitePasswords(siteId: string) {
  return useQuery({
    queryKey: ['site-passwords', siteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/passwords`);
      if (!res.ok) throw new Error('Failed to fetch passwords');
      return res.json() as Promise<SitePasswordInfo[]>;
    },
    enabled: !!siteId
  });
}

export function useCreateSitePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, password, label }: { siteId: string; password: string; label?: string }) => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/passwords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, label })
      });
      if (!res.ok) throw new Error('Failed to create password');
      return res.json() as Promise<SitePasswordInfo>;
    },
    onSuccess: (_, { siteId }) => {
      queryClient.invalidateQueries({ queryKey: ['site-passwords', siteId] });
    }
  });
}

export function useDeleteSitePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, passwordId }: { siteId: string; passwordId: string }) => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/passwords/${passwordId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete password');
    },
    onSuccess: (_, { siteId }) => {
      queryClient.invalidateQueries({ queryKey: ['site-passwords', siteId] });
    }
  });
}

// Check if site is password protected (public endpoint)
export function useSiteProtectionStatus(siteId: string) {
  return useQuery({
    queryKey: ['site-protection', siteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/protected`);
      if (!res.ok) throw new Error('Failed to check protection status');
      return res.json() as Promise<{ isProtected: boolean }>;
    },
    enabled: !!siteId
  });
}

// Verify site password (public endpoint)
export async function verifySitePassword(siteId: string, password: string): Promise<{ success: boolean; accessToken?: string }> {
  const res = await fetch(`${API_BASE}/sites/${siteId}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
    return { success: false };
  }
  return res.json();
}

// Daily stats for analytics charts
export type DailyStat = {
  id: string;
  siteId: string;
  date: string;
  views: number;
  uniqueVisitors: number;
};

export function useDailyStats(siteId: string, days: number = 7) {
  return useQuery({
    queryKey: ['daily-stats', siteId, days],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/daily-stats?days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch daily stats');
      return res.json() as Promise<DailyStat[]>;
    },
    enabled: !!siteId
  });
}

// Traffic sources for analytics
export type TrafficSource = {
  id: string;
  siteId: string;
  source: 'direct' | 'social' | 'search' | 'referral';
  referrer: string | null;
  count: number;
};

export function useTrafficSources(siteId: string) {
  return useQuery({
    queryKey: ['traffic-sources', siteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sites/${siteId}/traffic-sources`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch traffic sources');
      return res.json() as Promise<TrafficSource[]>;
    },
    enabled: !!siteId
  });
}

// ==================== BROKERAGE API ====================

export type Brokerage = {
  id: string;
  name: string;
  ownerUserId: string;
  logo: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  includedSeats: number;
  additionalSeats: number;
  stripeSubscriptionId: string | null;
  status: string;
  trialEndsAt: string | null;
  plannedAgentCount: string | null;
  onboardingCompletedAt: string | null;
  hasAddedFirstAgent: boolean;
  hasCreatedFirstGroup: boolean;
  hasExploredTemplates: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BrokerageMember = {
  id: string;
  brokerageId: string;
  userId: string;
  role: 'admin' | 'agent';
  status: 'active' | 'invited' | 'inactive' | 'pending' | 'deactivated';
  invitedBy: string | null;
  invitedAt: Date | null;
  joinedAt: Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    profileImageUrl: string | null;
  } | null;
};

export type BrokerageGroup = {
  id: string;
  brokerageId: string;
  name: string;
  description: string | null;
  teamLeadUserId: string | null;
  logo: string | null;
  defaultThemeId: string | null;
  createdAt: Date;
  memberCount?: number;
  teamLead?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export type BrokerageTemplate = {
  id: string;
  brokerageId: string;
  templateType: 'layout' | 'theme';
  templateId: string;
  assignedBy: string | null;
  availableToAll: boolean;
  createdAt: Date;
  assignedGroups?: string[];
};

export type BrokerageSite = Site & {
  agent?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export type BrokerageData = {
  brokerage: Brokerage | null;
  membership: BrokerageMember | null;
  memberCount: number;
  totalSeats: number;
};

export function useBrokerage() {
  return useQuery({
    queryKey: ['brokerage'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch brokerage');
      return res.json() as Promise<BrokerageData>;
    }
  });
}

export function useCreateBrokerage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; logo?: string; website?: string; phone?: string; email?: string; address?: string }) => {
      const res = await fetch(`${API_BASE}/brokerage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create brokerage');
      }
      return res.json() as Promise<Brokerage>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

export function useUpdateBrokerage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Brokerage>) => {
      const res = await fetch(`${API_BASE}/brokerage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update brokerage');
      return res.json() as Promise<Brokerage>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

export type StripeCoupon = {
  id: string;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  name: string | null;
};

export function useValidateStripeCoupon() {
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const res = await fetch(`${API_BASE}/stripe/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Invalid coupon code');
      }
      return res.json() as Promise<{ valid: boolean; coupon: StripeCoupon }>;
    }
  });
}

export function useBrokerageCheckout() {
  return useMutation({
    mutationFn: async (couponCode?: string) => {
      const res = await fetch(`${API_BASE}/stripe/brokerage-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }
      return res.json() as Promise<{ url: string }>;
    }
  });
}

export function usePurchaseSeats() {
  return useMutation({
    mutationFn: async (seats: number) => {
      const res = await fetch(`${API_BASE}/stripe/purchase-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to purchase seats');
      }
      return res.json() as Promise<{ url: string }>;
    }
  });
}

export function useConfirmSeatsPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`${API_BASE}/stripe/seats-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to confirm seat purchase');
      }
      return res.json() as Promise<{ success: boolean; addedSeats: number; totalSeats: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

export function useBrokerageMembers() {
  return useQuery({
    queryKey: ['brokerage-members'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage/members`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch brokerage members');
      return res.json() as Promise<BrokerageMember[]>;
    }
  });
}

export function useAddBrokerageMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }
      return res.json() as Promise<BrokerageMember>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-members'] });
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

export function useUpdateBrokerageMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: { role?: string; status?: string } }) => {
      const res = await fetch(`${API_BASE}/brokerage/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update member');
      return res.json() as Promise<BrokerageMember>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-members'] });
    }
  });
}

export function useRemoveBrokerageMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`${API_BASE}/brokerage/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-members'] });
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

export function useBrokerageGroups() {
  return useQuery({
    queryKey: ['brokerage-groups'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage/groups`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch brokerage groups');
      return res.json() as Promise<BrokerageGroup[]>;
    }
  });
}

export function useCreateBrokerageGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create group');
      return res.json() as Promise<BrokerageGroup>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
    }
  });
}

export function useUpdateBrokerageGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, updates }: { groupId: string; updates: { name?: string; description?: string; teamLeadUserId?: string | null; logo?: string | null; defaultThemeId?: string | null } }) => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update group');
      return res.json() as Promise<BrokerageGroup>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
    }
  });
}

export function useAddGroupMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, userIds }: { groupId: string; userIds: string[] }) => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add members');
      }
      return res.json();
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
      queryClient.invalidateQueries({ queryKey: ['all-group-memberships'] });
    }
  });
}

export function useDeleteBrokerageGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
    }
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}/members`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch group members');
      return res.json();
    },
    enabled: !!groupId
  });
}

export function useAllGroupMemberships() {
  return useQuery({
    queryKey: ['all-group-memberships'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage/group-memberships`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<{ userId: string; groupId: string; groupName: string }[]>;
    }
  });
}

export function useAddUserToGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add user to group');
      }
      return res.json();
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
    }
  });
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to remove user from group');
      return res.json();
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['brokerage-groups'] });
    }
  });
}

export function useBrokerageSites(search?: string) {
  return useQuery({
    queryKey: ['brokerage-sites', search],
    queryFn: async () => {
      const url = search 
        ? `${API_BASE}/brokerage/sites?search=${encodeURIComponent(search)}`
        : `${API_BASE}/brokerage/sites`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch brokerage sites');
      return res.json() as Promise<BrokerageSite[]>;
    }
  });
}

export function useDeleteBrokerageSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      const res = await fetch(`${API_BASE}/brokerage/sites/${siteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete site');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-sites'] });
    }
  });
}

// Brokerage registration (free trial)
export function useBrokerageRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { 
      brokerageName: string; 
      contactName: string;
      contactEmail: string;
      contactPhone?: string;
      plannedAgentCount: string;
    }) => {
      const res = await fetch(`${API_BASE}/brokerage/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to register brokerage');
      }
      return res.json() as Promise<{ success: boolean; brokerageId: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

// Confirm brokerage subscription success
export function useConfirmBrokerageSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`${API_BASE}/stripe/brokerage-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to confirm subscription');
      }
      return res.json() as Promise<{ success: boolean; brokerageId: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage'] });
    }
  });
}

// ==================== BROKERAGE TEMPLATE MANAGEMENT ====================

// Get templates assigned to the brokerage
export function useBrokerageTemplates() {
  return useQuery({
    queryKey: ['brokerage-templates'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/brokerage/templates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<BrokerageTemplate[]>;
    }
  });
}

// Update a brokerage template (availableToAll)
export function useUpdateBrokerageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, availableToAll }: { templateId: string; availableToAll: boolean }) => {
      const res = await fetch(`${API_BASE}/brokerage/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableToAll }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update template');
      }
      return res.json() as Promise<BrokerageTemplate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerage-templates'] });
    }
  });
}

// Get group assignments for a template
export function useTemplateGroupAssignments(templateId: string) {
  return useQuery({
    queryKey: ['template-groups', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      const res = await fetch(`${API_BASE}/brokerage/templates/${templateId}/groups`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<{ id: string; brokerageTemplateId: string; groupId: string }[]>;
    },
    enabled: !!templateId
  });
}

// Assign template to a group
export function useAssignTemplateToGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, groupId }: { templateId: string; groupId: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/templates/${templateId}/groups/${groupId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to assign template to group');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-groups'] });
      queryClient.invalidateQueries({ queryKey: ['brokerage-templates'] });
    }
  });
}

// Remove template from a group
export function useRemoveTemplateFromGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, groupId }: { templateId: string; groupId: string }) => {
      const res = await fetch(`${API_BASE}/brokerage/templates/${templateId}/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove template from group');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-groups'] });
      queryClient.invalidateQueries({ queryKey: ['brokerage-templates'] });
    }
  });
}

// ==================== ADMIN BROKERAGE MANAGEMENT ====================

export type BrokerageWithOwner = Brokerage & { ownerName?: string; ownerEmail?: string };

// Get all brokerages (admin only)
export function useAdminBrokerages() {
  return useQuery({
    queryKey: ['admin-brokerages'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/brokerages`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<BrokerageWithOwner[]>;
    }
  });
}

// Get templates for a specific brokerage (admin only)
export function useAdminBrokerageTemplates(brokerageId: string) {
  return useQuery({
    queryKey: ['admin-brokerage-templates', brokerageId],
    queryFn: async () => {
      if (!brokerageId) return [];
      const res = await fetch(`${API_BASE}/admin/brokerages/${brokerageId}/templates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<BrokerageTemplate[]>;
    },
    enabled: !!brokerageId
  });
}

// Get all brokerage templates across all brokerages (admin only)
export function useAdminAllBrokerageTemplates() {
  return useQuery({
    queryKey: ['admin-all-brokerage-templates'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/brokerage-templates`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<BrokerageTemplate[]>;
    }
  });
}

// Get groups for a specific brokerage (admin only)
export function useAdminBrokerageGroups(brokerageId: string) {
  return useQuery({
    queryKey: ['admin-brokerage-groups', brokerageId],
    queryFn: async () => {
      if (!brokerageId) return [];
      const res = await fetch(`${API_BASE}/admin/brokerages/${brokerageId}/groups`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<BrokerageGroup[]>;
    },
    enabled: !!brokerageId
  });
}

// Assign a template to a brokerage (admin only)
export function useAdminAssignTemplateToBrokerage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ brokerageId, templateType, templateId }: { brokerageId: string; templateType: 'layout' | 'theme'; templateId: string }) => {
      const res = await fetch(`${API_BASE}/admin/brokerages/${brokerageId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType, templateId }),
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to assign template');
      }
      return res.json() as Promise<BrokerageTemplate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokerage-templates'] });
    }
  });
}

// Remove a template from a brokerage (admin only)
export function useAdminRemoveTemplateFromBrokerage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ brokerageId, templateId }: { brokerageId: string; templateId: string }) => {
      const res = await fetch(`${API_BASE}/admin/brokerages/${brokerageId}/templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove template');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brokerage-templates'] });
    }
  });
}
