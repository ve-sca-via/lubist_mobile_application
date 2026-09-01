import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiGet } from '../client';
import type { AvailableCoupon } from './useBookingAPI';

export type { AvailableCoupon };

// ==========================================
// TYPES (mapped from backend/app/api/salons.py — salons table rows)
// ==========================================

export interface Salon {
  id: string;
  business_name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  created_at?: string | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  // Account kind ('salon' | 'regular_buyer') — NOT the establishment type.
  // Never render this on a card; use `business_type` below.
  salon_type?: string | null;
  // Kind of establishment, sourced from the vendor's join request:
  // 'salon' | 'spa' | 'clinic' | 'unisex_salon' | 'barber_shop' | 'beauty_parlor' | …
  business_type?: string | null;
  has_discount?: boolean | null;
  distance_km?: number | null;
  // Public coupon/discount display data (attached by the backend salon endpoints)
  has_discounted_services?: boolean | null;
  max_discount_percentage?: number | null; // largest service discount %, for "UPTO X% OFF"
  coupons?: AvailableCoupon[] | null;       // this salon's vendor coupons
}

/** Human-readable labels for the backend's `business_type` values. */
export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  salon: 'Salons',
  spa: 'Spa & Wellness',
  clinic: 'Clinics',
  unisex_salon: 'Unisex Salons',
  barber_shop: 'Barber Shops',
  beauty_parlor: 'Beauty Parlors',
  retail_shop: 'Retail Shops',
  wholesale_buyer: 'Wholesale',
};

/**
 * Plural category label for headings and filter chips ("Spa & Wellness"),
 * falling back to a title-cased slug.
 */
export function businessTypeLabel(type?: string | null): string {
  if (!type) return 'Salons';
  return (
    BUSINESS_TYPE_LABELS[type] ??
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Singular label for the type badge on a salon card ("Unisex Salon", "Barber
 * Shop"). Matches the web app's card badge, which prints the raw
 * `business_type` with underscores swapped for spaces — the plural category
 * labels above read wrong there ("SALONS" on a single salon's card).
 *
 * Returns '' for an unknown type so the caller can drop the badge rather than
 * guess a type.
 */
export function businessTypeChipLabel(type?: string | null): string {
  if (!type) return '';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface SalonDetail extends Salon {
  opening_time?: string | null;
  closing_time?: string | null;
  working_days?: string[] | null;
  platform_coupons?: AvailableCoupon[] | null; // platform-wide coupons (detail only)
}

export interface TaxonomyNode {
  id: string;
  name: string;
  icon_url?: string | null;
}

export interface ServiceTaxonomy {
  category: TaxonomyNode | null;
  subcategory: TaxonomyNode | null;
  sub_subcategory: TaxonomyNode | null;
}

export interface SalonService {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  discount_percentage?: number | null;
  discounted_price?: number | null;
  category_id?: string | null;
  taxonomy?: ServiceTaxonomy | null;
}

interface SalonServicesResponse {
  services: SalonService[];
  count: number;
}

export interface SalonReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name: string;
  service_name?: string | null;
  is_verified: boolean;
  vendor_response?: string | null;
}

interface SalonListResponse {
  salons: Salon[];
  count: number;
  offset?: number;
  limit?: number;
}

interface SalonDetailResponse {
  salon: SalonDetail;
  services: SalonService[] | null;
}

interface SalonReviewsResponse {
  success: boolean;
  reviews: SalonReview[];
  count: number;
}

interface PublicSalonsParams {
  city?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface InfinitePublicSalonsParams {
  city?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface SearchSalonsParams {
  q?: string;
  city?: string;
  state?: string;
  limit?: number;
  enabled?: boolean;
}

// ==========================================
// HOOKS
// ==========================================

/** All public (active + verified + paid) salons. */
export function usePublicSalons({ city, limit = 50, offset = 0, enabled = true }: PublicSalonsParams = {}) {
  return useQuery({
    queryKey: ['publicSalons', city ?? null, limit, offset],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (city) params.set('city', city);
      return await apiGet<SalonListResponse>(`/api/v1/salons/public?${params.toString()}`);
    },
  });
}

/**
 * Public salons, paginated for infinite scroll. Pages accumulate in
 * `data.pages`; flatten with `.flatMap(p => p.salons)` to get the full list
 * fetched so far. Stops (`hasNextPage` becomes false) once a page comes back
 * shorter than `pageSize`.
 */
export function useInfinitePublicSalons({ city, pageSize = 10, enabled = true }: InfinitePublicSalonsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['publicSalonsInfinite', city ?? null, pageSize],
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(pageSize), offset: String(pageParam) });
      if (city) params.set('city', city);
      return await apiGet<SalonListResponse>(`/api/v1/salons/public?${params.toString()}`);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.salons.length < pageSize ? undefined : allPages.length * pageSize,
  });
}

/** Single salon detail, including its services. */
export function useSalonDetail(salonId?: string) {
  return useQuery({
    queryKey: ['salonDetail', salonId ?? null],
    enabled: !!salonId,
    queryFn: async () =>
      await apiGet<SalonDetailResponse>(`/api/v1/salons/${salonId}?include_services=true`),
  });
}

/**
 * Salons related to the one being viewed, for the "Related Salons" section at
 * the bottom of the detail screen. Backend ranks same-city first, then backfills
 * (see /salons/{id}/related). Returns the same Salon shape as the listings.
 */
export function useRelatedSalons(salonId?: string, limit = 10) {
  return useQuery({
    queryKey: ['relatedSalons', salonId ?? null, limit],
    enabled: !!salonId,
    queryFn: async () =>
      await apiGet<SalonListResponse>(`/api/v1/salons/${salonId}/related?limit=${limit}`),
  });
}

/** A salon's services with full category/subcategory taxonomy attached. */
export function useSalonServices(salonId?: string) {
  return useQuery({
    queryKey: ['salonServices', salonId ?? null],
    enabled: !!salonId,
    queryFn: async () =>
      await apiGet<SalonServicesResponse>(`/api/v1/salons/${salonId}/services`),
  });
}

/** Publicly visible reviews for a salon. */
export function useSalonReviews(salonId?: string) {
  return useQuery({
    queryKey: ['salonReviews', salonId ?? null],
    enabled: !!salonId,
    queryFn: async () => await apiGet<SalonReviewsResponse>(`/api/v1/salons/${salonId}/reviews`),
  });
}

/** Text/filter search over salons. Only runs when a query/filter is supplied. */
export function useSearchSalons({ q, city, state, limit = 50, enabled = true }: SearchSalonsParams) {
  const hasCriteria = !!(q?.trim() || city || state);
  return useQuery({
    queryKey: ['searchSalons', q ?? null, city ?? null, state ?? null, limit],
    enabled: enabled && hasCriteria,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (q?.trim()) params.set('q', q.trim());
      if (city) params.set('city', city);
      if (state) params.set('state', state);
      return await apiGet<SalonListResponse>(`/api/v1/salons/search/query?${params.toString()}`);
    },
  });
}
