import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../client';
import type { ApiResponse, Schema, WithFields } from '../types';

// ==========================================
// TYPES - derived from the generated backend contract (see services/api/types.ts).
// Hand-written overlays only where the contract declares a free-form `object`.
// ==========================================

export type CartItem = WithFields<
  Schema<'CartItem'>,
  {
    // `object` in the contract: the joined services/salons rows.
    service_details: { name?: string; duration_minutes?: number; price?: number; [k: string]: any };
    salon_details: Record<string, any>;
  }
>;

export type CartResponse = WithFields<Schema<'CartResponse'>, { items: CartItem[] }>;

export type RazorpayOrder = WithFields<
  Schema<'RazorpayOrderResponse'>,
  { breakdown?: Record<string, any> | null }
>;

export type AvailableSlotsResponse = Schema<'AvailableSlotsResponse'>;

export type CheckoutPayload = Schema<'CartCheckoutCreate'>;

export type CouponBreakdown = Schema<'CouponDiscountBreakdown'>;

export type CouponValidationResult = Schema<'CouponValidationResult'>;

/** A customer-discoverable coupon ("available offers"). */
export type AvailableCoupon = Schema<'AvailableCouponResponse'>;

/** `configs` is a free-form key/value map in the contract. */
export interface PublicConfigs {
  convenience_fee_percentage?: number;
  cancellation_window_hours?: number;
  max_booking_advance_days?: number;
  registration_fee_amount?: number;
  [k: string]: any;
}

/**
 * A booking row. Checkout returns `BookingResponse`; `my-bookings` returns rows
 * the contract only types as `object[]`, flattened by the backend's booking
 * transform (salon_name / salon_city / salon_logo_url), hence the overlay.
 */
export type Booking = WithFields<
  Schema<'BookingResponse'>,
  {
    services?: any[];
    salon_name?: string | null;
    salon_city?: string | null;
    salon_logo_url?: string | null;
  }
> & { [k: string]: any };

export type MyBookingsResponse = WithFields<Schema<'CustomerBookingsResponse'>, { data: Booking[] }>;

// ==========================================
// CART
// ==========================================

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => await apiGet<CartResponse>('/api/v1/customers/cart'),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    // `unit_price` is optional and used only to keep the optimistic cart total
    // accurate until the server response settles; the backend ignores it.
    mutationFn: async (data: Schema<'CartItemCreate'> & { unit_price?: number }) =>
      await apiPost<Schema<'CartOperationResponse'>>('/api/v1/customers/cart', { quantity: 1, ...data }),
    // Optimistically add the service so the "ADD" button flips to "ADDED"
    // instantly, without waiting for the POST + cart refetch round-trip.
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const previous = qc.getQueryData<CartResponse>(['cart']);
      qc.setQueryData<CartResponse>(['cart'], (old) => {
        const base: CartResponse =
          old ?? { success: true, items: [], total_amount: 0, item_count: 0 };
        // Guard against duplicate optimistic lines for the same service.
        if (base.items.some((i) => i.service_id === data.service_id)) return base;
        const quantity = data.quantity ?? 1;
        const unitPrice = data.unit_price ?? 0;
        const optimisticItem: CartItem = {
          id: `optimistic-${data.service_id}`,
          service_id: data.service_id,
          salon_id: data.salon_id ?? base.salon_id ?? '',
          quantity,
          unit_price: unitPrice,
          line_total: unitPrice * quantity,
          service_details: {},
          salon_details: {},
          metadata: {},
          created_at: new Date().toISOString(),
        };
        return {
          ...base,
          items: [...base.items, optimisticItem],
          item_count: base.item_count + quantity,
          total_amount: base.total_amount + unitPrice * quantity,
          salon_id: base.salon_id ?? data.salon_id ?? null,
        };
      });
      return { previous };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous) qc.setQueryData(['cart'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      await apiPut(`/api/v1/customers/cart/${itemId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => await apiDelete(`/api/v1/customers/cart/${itemId}`),
    // Optimistically drop the line so the button flips back to "ADD" instantly.
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const previous = qc.getQueryData<CartResponse>(['cart']);
      qc.setQueryData<CartResponse>(['cart'], (old) => {
        if (!old) return old;
        const removed = old.items.find((i) => i.id === itemId);
        if (!removed) return old;
        return {
          ...old,
          items: old.items.filter((i) => i.id !== itemId),
          item_count: Math.max(0, old.item_count - removed.quantity),
          total_amount: Math.max(0, old.total_amount - removed.line_total),
        };
      });
      return { previous };
    },
    onError: (_err, _itemId, ctx) => {
      if (ctx?.previous) qc.setQueryData(['cart'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => await apiDelete('/api/v1/customers/cart/clear/all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ==========================================
// SLOTS / PAYMENT / CHECKOUT
// ==========================================

export function useAvailableSlots(salonId?: string, date?: string, serviceIds?: string[]) {
  return useQuery({
    queryKey: ['availableSlots', salonId ?? null, date ?? null, serviceIds?.join(',') ?? ''],
    enabled: !!salonId && !!date,
    queryFn: async () => {
      const params = new URLSearchParams({ date: String(date) });
      if (serviceIds?.length) params.set('service_ids', serviceIds.join(','));
      return await apiGet<AvailableSlotsResponse>(
        `/api/v1/salons/${salonId}/available-slots?${params.toString()}`,
      );
    },
  });
}

/**
 * Coupons the customer can discover ("available offers"). Always includes
 * platform coupons; pass a salonId to also include that salon's vendor coupons.
 */
export function useAvailableCoupons(salonId?: string) {
  return useQuery({
    queryKey: ['availableCoupons', salonId ?? null],
    queryFn: async () => {
      const qs = salonId ? `?salon_id=${encodeURIComponent(salonId)}` : '';
      return await apiGet<ApiResponse<'/api/v1/customers/available-coupons', 'get'>>(
        `/api/v1/customers/available-coupons${qs}`,
      );
    },
  });
}

/**
 * Public system configs (convenience fee %, booking limits, etc.). Non-sensitive
 * values safe to expose to the client. Cached for 5 minutes like the web app.
 */
export function usePublicConfigs() {
  return useQuery({
    queryKey: ['publicConfigs'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; configs: PublicConfigs }>(
        '/api/v1/salons/config/public',
      );
      return res.configs ?? {};
    },
  });
}

/** Validates / previews a coupon against the current cart ("Apply coupon"). */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (code: string) =>
      await apiPost<CouponValidationResult>('/api/v1/customers/cart/validate-coupon', {
        code,
      } satisfies Schema<'CouponValidateRequest'>),
  });
}

/** What `/payments/cart/create-order` accepts. All of it optional. */
export type CartOrderInput = {
  couponCode?: string;
  /**
   * The appointment the customer has already picked. Sent so the backend can pin
   * it to the payment intent, which is what lets its `payment.captured` webhook
   * finish the booking when this app never reports the success callback — the app
   * backgrounded, the network dropped, the WebView killed. Not priced or
   * validated here: `/customers/cart/checkout` still sends the authoritative
   * date and slots when it runs.
   */
  bookingDate?: string;
  timeSlots?: string[];
};

/** Creates the Razorpay order for the current cart (convenience fee). */
export function useCreateCartOrder() {
  return useMutation({
    mutationFn: async (input: CartOrderInput = {}) => {
      const body: Schema<'CartOrderCreate'> = {};
      if (input.couponCode) body.coupon_code = input.couponCode;
      if (input.bookingDate) body.booking_date = input.bookingDate;
      if (input.timeSlots?.length) body.time_slots = input.timeSlots;
      return await apiPost<RazorpayOrder>('/api/v1/payments/cart/create-order', body);
    },
  });
}

/** Verifies payment + creates the booking from the cart, then clears the cart. */
export function useCheckoutCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckoutPayload) =>
      await apiPost<Booking>('/api/v1/customers/cart/checkout', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

// ==========================================
// BOOKINGS
// ==========================================

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => await apiGet<MyBookingsResponse>('/api/v1/customers/bookings/my-bookings'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) =>
      await apiPut(`/api/v1/customers/bookings/${bookingId}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}
