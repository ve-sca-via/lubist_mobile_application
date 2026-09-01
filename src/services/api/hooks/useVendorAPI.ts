import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';

// ==========================================
// TYPES (mapped from backend app/schemas/{response,request}/vendor.py,
// app/schemas/response/booking.py)
// ==========================================

export interface VendorSalon {
  id: string;
  vendor_id?: string | null;
  salon_type: string;
  is_active: boolean;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  registration_fee_paid: boolean;
  registration_fee_amount?: number | null;
  accepting_bookings: boolean;
  business_name: string;
  business_type?: string | null;
  description?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  outlet?: string | null;
  is_gst?: boolean | null;
  gst_number?: string | null;
  pan_number?: string | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  agreement_document_url?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  working_days?: string[] | null;
  // Day-wise hours, e.g. { monday: "9:00 AM - 6:00 PM", tuesday: "Closed", ... }
  business_hours?: Record<string, string> | null;
  facilities?: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
  [k: string]: any;
}

export interface VendorSalonUpdate {
  business_name?: string;
  description?: string | null;
  phone?: string;
  email?: string | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  outlet?: string | null;
  is_gst?: boolean | null;
  gst_number?: string | null;
  pan_number?: string | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  agreement_document_url?: string | null;
  business_hours?: Record<string, string> | null;
  opening_time?: string | null;
  closing_time?: string | null;
  working_days?: string[] | null;
  accepting_bookings?: boolean;
  facilities?: Record<string, boolean> | null;
  [k: string]: any;
}

// 3-level taxonomy tree: category -> subcategories[] (level 2) -> subcategories[] (level 3)
export interface ServiceCategoryNode {
  id: string;
  name: string;
  description?: string | null;
  icon_url?: string | null;
  display_order: number;
  is_active: boolean;
  subcategories: ServiceSubcategoryNode[];
}

export interface ServiceSubcategoryNode {
  id: string;
  name: string;
  parent_category_id: string;
  parent_subcategory_id?: string | null;
  display_order: number;
  is_active: boolean;
  // Present (possibly empty) on level-2 nodes; absent on level-3 leaves.
  subcategories?: ServiceSubcategoryNode[];
}

export interface VendorService {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  discount_percentage?: number | null;
  discounted_price?: number | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  gender_category: 'male' | 'female' | 'both';
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined by GET /services (select "*, service_categories(*), service_subcategories(*)")
  service_categories?: { id: string; name: string; [k: string]: any } | null;
  service_subcategories?: { id: string; name: string; [k: string]: any } | null;
}

export interface VendorServiceCreate {
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  discount_percentage?: number | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  sub_subcategory_id?: string | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  sub_subcategory_name?: string | null;
  gender_category?: 'male' | 'female' | 'both';
  image_url?: string | null;
  is_active?: boolean;
}

export type VendorServiceUpdate = Partial<VendorServiceCreate>;

export interface VendorBooking {
  id: string;
  booking_number: string;
  customer_id: string;
  salon_id: string;
  booking_date: string;
  time_slots: string[];
  services: Array<{ name?: string; duration_minutes?: number; quantity?: number; unit_price?: number; [k: string]: any }>;
  notes?: string | null;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  service_price: number;
  convenience_fee: number;
  total_amount: number;
  subtotal_service_price?: number | null;
  discount_amount: number;
  convenience_fee_discount: number;
  coupon_id?: string | null;
  coupon_code?: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  payment_status?: string | null;
  // Enriched by VendorService.get_salon_bookings
  service_names?: string[];
  service_names_str?: string;
  [k: string]: any;
}

export interface VendorBookingsParams {
  status_filter?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface VendorAnalytics {
  total_bookings: number;
  total_revenue: number;
  active_services: number;
  average_rating: number;
  pending_bookings: number;
  total_product_orders: number;
  pending_product_orders: number;
  total_product_spending: number;
}

export interface VendorPromotion {
  id: string;
  salon_id: string;
  title: string;
  discount_type: 'percentage' | 'flat_amount';
  discount_value: number;
  min_booking_amount?: number | null;
  max_discount_limit?: number | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'inactive';
  services_updated: number;
  created_at: string;
  updated_at: string;
}

export interface VendorPromotionApply {
  title: string;
  discount_type: 'percentage' | 'flat_amount';
  discount_value: number;
  min_booking_amount?: number | null;
  max_discount_limit?: number | null;
  start_date: string;
  end_date?: string | null;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ==========================================
// SALON
// ==========================================

export function useVendorSalon() {
  return useQuery({
    queryKey: ['vendorSalon'],
    queryFn: async () => await apiGet<VendorSalon>('/api/v1/vendors/salon'),
  });
}

export function useUpdateVendorSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: VendorSalonUpdate) =>
      await apiPut<VendorSalon>('/api/v1/vendors/salon', update),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorSalon'] }),
  });
}

// ==========================================
// SERVICE CATEGORIES
// ==========================================

export function useServiceCategories() {
  return useQuery({
    queryKey: ['vendorServiceCategories'],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: ServiceCategoryNode[] }>(
        '/api/v1/vendors/service-categories',
      );
      return res.data ?? [];
    },
  });
}

// ==========================================
// SERVICES
// ==========================================

export function useVendorServices() {
  return useQuery({
    queryKey: ['vendorServices'],
    queryFn: async () => await apiGet<VendorService[]>('/api/v1/vendors/services'),
  });
}

export function useCreateVendorService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: VendorServiceCreate) =>
      await apiPost<VendorService>('/api/v1/vendors/services', service),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorServices'] }),
  });
}

export function useUpdateVendorService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, update }: { serviceId: string; update: VendorServiceUpdate }) =>
      await apiPut<VendorService>(`/api/v1/vendors/services/${serviceId}`, update),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorServices'] }),
  });
}

export function useDeleteVendorService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: string) =>
      await apiDelete<SuccessResponse>(`/api/v1/vendors/services/${serviceId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorServices'] }),
  });
}

// ==========================================
// BOOKINGS
// ==========================================

export function useVendorBookings(params: VendorBookingsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status_filter) qs.set('status_filter', params.status_filter);
  if (params.date_from) qs.set('date_from', params.date_from);
  if (params.date_to) qs.set('date_to', params.date_to);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  const query = qs.toString();

  return useQuery({
    queryKey: ['vendorBookings', params],
    queryFn: async () =>
      await apiGet<VendorBooking[]>(`/api/v1/vendors/bookings${query ? `?${query}` : ''}`),
  });
}

export function useUpdateVendorBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) =>
      await apiPut<SuccessResponse<VendorBooking>>(
        `/api/v1/vendors/bookings/${bookingId}/status`,
        { status },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendorBookings'] }),
  });
}

// ==========================================
// ANALYTICS
// ==========================================

export function useVendorAnalytics() {
  return useQuery({
    queryKey: ['vendorAnalytics'],
    queryFn: async () => await apiGet<VendorAnalytics>('/api/v1/vendors/analytics'),
  });
}

// ==========================================
// SALON-WIDE PROMOTIONS
// ==========================================

export function useActiveVendorPromotion() {
  return useQuery({
    queryKey: ['vendorPromotion'],
    queryFn: async () =>
      await apiGet<VendorPromotion | null>('/api/v1/vendors/promotions/active'),
  });
}

export function useApplyVendorPromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (promo: VendorPromotionApply) =>
      await apiPost<VendorPromotion>('/api/v1/vendors/promotions/apply', promo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendorPromotion'] });
      // Applying a promo mutates per-service pricing server-side.
      qc.invalidateQueries({ queryKey: ['vendorServices'] });
    },
  });
}
