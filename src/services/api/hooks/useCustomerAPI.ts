import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';
import type { Schema, WithFields } from '../types';

// ==========================================
// FAVORITES (mapped from backend customers.py)
// ==========================================

// The backend returns full salon rows for favorites, so `id` is the salon id.
export interface FavoriteItem {
  id?: string;
  salon_id?: string;
  business_name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  // Account kind ('salon' | 'regular_buyer'), not the establishment type.
  salon_type?: string | null;
  // Kind of establishment ('spa' | 'barber_shop' | …), joined from the vendor
  // join request by the favorites endpoint.
  business_type?: string | null;
  salon?: { id?: string; [k: string]: any } | null;
  [k: string]: any;
}

// `favorites` is `object[]` in the contract, hence the hand-written FavoriteItem.
export type FavoritesResponse = WithFields<Schema<'FavoritesResponse'>, { favorites: FavoriteItem[] }>;

/** Normalize the salon id off a favorite row (full salon row, joined row, or id). */
export const favoriteSalonId = (f: FavoriteItem) => f.salon_id ?? f.salon?.id ?? f.id ?? null;

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: ['favorites'],
    enabled,
    queryFn: async () => await apiGet<FavoritesResponse>('/api/v1/customers/favorites'),
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: string) =>
      await apiPost<Schema<'FavoriteOperationResponse'>>('/api/v1/customers/favorites', {
        salon_id: salonId,
      } satisfies Schema<'FavoriteCreate'>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: string) =>
      await apiDelete<Schema<'FavoriteOperationResponse'>>(`/api/v1/customers/favorites/${salonId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

// ==========================================
// REVIEWS (mapped from backend customers.py)
// ==========================================

// A review row as flattened by customer_service.get_customer_reviews / create / update.
export interface CustomerReview {
  id: string;
  rating: number;
  comment: string;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string;
  is_verified?: boolean;
  salon_name?: string;
  [k: string]: any;
}

// `reviews` / `review` are `object` in the contract, hence the hand-written CustomerReview.
export type CustomerReviewsResponse = WithFields<
  Schema<'CustomerReviewsResponse'>,
  { reviews: CustomerReview[] }
>;

export type ReviewOperationResponse = WithFields<
  Schema<'ReviewOperationResponse'>,
  { review?: CustomerReview | null }
>;

/**
 * Payload for creating a review. The contract marks booking_id optional, but the
 * backend only accepts a review against a completed booking, so the app requires it.
 */
export type CreateReviewInput = WithFields<Schema<'ReviewCreate'>, { booking_id: string }>;

export function useMyReviews(enabled = true) {
  return useQuery({
    queryKey: ['myReviews'],
    enabled,
    queryFn: async () =>
      await apiGet<CustomerReviewsResponse>('/api/v1/customers/reviews/my-reviews'),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReviewInput) =>
      await apiPost<ReviewOperationResponse>('/api/v1/customers/reviews', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myReviews'] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating?: number;
      comment?: string;
    }) =>
      await apiPut<ReviewOperationResponse>(`/api/v1/customers/reviews/${reviewId}`, {
        rating,
        comment,
      } satisfies Schema<'ReviewUpdate'>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myReviews'] }),
  });
}
