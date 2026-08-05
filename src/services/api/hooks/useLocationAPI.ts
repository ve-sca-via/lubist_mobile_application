import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../client';

// ==========================================
// TYPES (mapped from backend/app/api/location.py)
// ==========================================

export interface NearbySalon {
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
  logo_url?: string | null;
  cover_images?: string[] | null;
  distance_km?: number | null;
  // Kind of establishment ('spa' | 'barber_shop' | …). The PostGIS function
  // doesn't return it; the backend attaches it from the vendor join request.
  business_type?: string | null;
}

export interface NearbySalonsResponse {
  salons: NearbySalon[];
  count: number;
  query: { latitude: number; longitude: number; radius_km: number };
}

/**
 * Raw shape from the backend: the `address` field is itself an object
 * ({ address, latitude, longitude, components }) because the endpoint wraps
 * the geocoding service result. We normalize it in the hook below.
 */
interface RawReverseGeocodeResponse {
  address:
    | string
    | {
        address?: string;
        latitude?: number;
        longitude?: number;
        components?: Record<string, any>;
      };
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResult {
  address: string;
  components?: Record<string, any>;
  latitude: number;
  longitude: number;
}

interface NearbyParams {
  lat?: number | null;
  lon?: number | null;
  radius?: number;
  limit?: number;
  enabled?: boolean;
}

// ==========================================
// HOOKS
// ==========================================

/** Salons near a coordinate. Public endpoint; only runs once we have coords. */
export function useNearbySalons({ lat, lon, radius = 10, limit = 20, enabled = true }: NearbyParams) {
  return useQuery({
    queryKey: ['nearbySalons', lat, lon, radius, limit],
    enabled: enabled && lat != null && lon != null,
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        radius: String(radius),
        limit: String(limit),
      });
      return await apiGet<NearbySalonsResponse>(`/api/v1/location/salons/nearby?${params.toString()}`);
    },
  });
}

/** Convert device coordinates into a human-readable address. */
export function useReverseGeocode(lat?: number | null, lon?: number | null, enabled = true) {
  return useQuery({
    queryKey: ['reverseGeocode', lat, lon],
    enabled: enabled && lat != null && lon != null,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      return await apiGet<RawReverseGeocodeResponse>(`/api/v1/location/reverse-geocode?${params.toString()}`);
    },
    // Flatten the nested `address` object into a plain string + components.
    select: (raw): ReverseGeocodeResult => {
      const a = raw.address;
      if (typeof a === 'string') {
        return { address: a, latitude: raw.latitude, longitude: raw.longitude };
      }
      return {
        address: a?.address ?? '',
        components: a?.components,
        latitude: raw.latitude,
        longitude: raw.longitude,
      };
    },
  });
}
