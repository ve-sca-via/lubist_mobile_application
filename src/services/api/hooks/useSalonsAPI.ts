import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiGet } from '../client';
import type { Schema, WithFields } from '../types';
import type { AvailableCoupon } from './useBookingAPI';

export type { AvailableCoupon };

// ==========================================
// TYPES (mapped from backend/app/api/salons.py — salons table rows)
// ==========================================

/**
 * A salon as listed by /salons/public, /salons/search/query, /salons/{id}/related
 * and /location/salons/nearby (`SalonListResponse` in the contract).
 * `salon_type` is the account kind ('salon' | 'regular_buyer') - never render it;
 * use `business_type` (the kind of establishment) instead.
 */
export type Salon = WithFields<
  Schema<'SalonListResponse'>,
  {
    /**
     * CONTRACT DRIFT: not in SalonListResponse, so the backend strips it and it
     * is always undefined on list rows. Kept only so the "New Arrivals" sort in
     * ClientDiscoverScreen compiles; that sort is a no-op until the backend adds
     * `created_at` to SalonListResponse. See docs/API_CONTRACT.md.
     */
    created_at?: string | null;
  }
>;

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

/** Single-salon detail (`PublicSalonResponse`): the list fields plus contact info and platform coupons. */
export type SalonDetail = Schema<'PublicSalonResponse'>;

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

// The contract types `services` as `object[]` (raw rows), so the element type
// above is hand-written and overlaid here.
type SalonServicesResponse = WithFields<Schema<'SalonServicesResponse'>, { services: SalonService[] }>;

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

type SalonListResponse = Schema<'PublicSalonsResponse'>;
type SearchSalonsResponse = Schema<'SearchSalonsResponse'>;

type SalonDetailResponse = WithFields<
  Schema<'SalonDetailResponse'>,
  { services?: SalonService[] | null }
>;

type SalonReviewsResponse = WithFields<Schema<'PublicSalonReviewsResponse'>, { reviews: SalonReview[] }>;

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
      return await apiGet<SearchSalonsResponse>(`/api/v1/salons/search/query?${params.toString()}`);
    },
  });
}
