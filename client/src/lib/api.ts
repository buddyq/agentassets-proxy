import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, Site, Theme } from '@shared/schema';

const API_BASE = '/api';

// User API
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json() as Promise<User>;
    }
  });
}

export function useUpdateCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const res = await fetch(`${API_BASE}/user/${userId}/credits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      });
      if (!res.ok) throw new Error('Failed to update credits');
      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', data.id], data);
    }
  });
}

// Sites API
export function useSites(userId?: string) {
  return useQuery({
    queryKey: userId ? ['sites', userId] : ['sites'],
    queryFn: async () => {
      const url = userId ? `${API_BASE}/sites?userId=${userId}` : `${API_BASE}/sites`;
      const res = await fetch(url);
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
    }
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    mutationFn: async (theme: Omit<Theme, 'id' | 'createdAt'>) => {
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
