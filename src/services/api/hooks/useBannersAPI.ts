import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../client';
import { resolveImageUrl } from '../imageUrl';
import type { Schema, WithFields } from '../types';

// ==========================================
// TYPES (mapped from backend/app/api/banners.py — banners table rows)
// ==========================================

export interface Banner {
  id: string;
  title?: string | null;
  image_url: string;
  link_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
  [k: string]: any;
}

// `banners` is `object[]` in the contract, hence the hand-written Banner row.
type BannerListResponse = WithFields<Schema<'BannerListResponse'>, { banners: Banner[] }>;

// ==========================================
// HELPERS
// ==========================================

/** The banner image, rewritten for the dev LAN host. Null when missing. */
export function bannerImageUri(banner: Banner): string | null {
  return resolveImageUrl(banner.image_url ?? null);
}

// ==========================================
// HOOKS
// ==========================================

/**
 * Active home-carousel banners, ordered by sort_order (backend filters to active
 * + in-window). Public endpoint — no auth required, so this can run on the home
 * screen for logged-out users. Banners change rarely, so cache generously.
 */
export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    staleTime: 5 * 60 * 1000, // 5 min — banners change rarely
    queryFn: async () => await apiGet<BannerListResponse>('/api/v1/banners'),
  });
}
