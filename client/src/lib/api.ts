import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, Site, Theme, Layout } from '@shared/schema';

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

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
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

// Themes API
export function useThemes(options?: { preset?: boolean; userId?: string }) {
  return useQuery({
    queryKey: options?.preset ? ['themes', 'preset'] : options?.userId ? ['themes', 'user', options.userId] : ['themes'],
    queryFn: async () => {
      let url = `${API_BASE}/themes`;
      const params = new URLSearchParams();
      if (options?.preset) params.append('preset', 'true');
      if (options?.userId) params.append('userId', options.userId);
      if (params.toString()) url += `?${params}`;
      
      const res = await fetch(url);
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
export async function getUploadUrl(): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/objects/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  const data = await res.json();
  return { url: data.uploadURL };
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
export function useLayouts(options?: { preset?: boolean; userId?: string }) {
  return useQuery({
    queryKey: options?.preset ? ['layouts', 'preset'] : options?.userId ? ['layouts', 'user', options.userId] : ['layouts'],
    queryFn: async () => {
      let url = `${API_BASE}/layouts`;
      const params = new URLSearchParams();
      if (options?.preset) params.append('preset', 'true');
      if (options?.userId) params.append('userId', options.userId);
      if (params.toString()) url += `?${params}`;
      
      const res = await fetch(url);
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
