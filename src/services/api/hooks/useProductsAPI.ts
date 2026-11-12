import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '../client';
import { resolveImageUrl } from '../imageUrl';
import type { Schema, WithFields } from '../types';

// ==========================================
// TYPES (mapped from backend/app/api/products.py — products table rows)
// ==========================================

export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  price: number;
  discount_price?: number | null;
  discount_percentage?: number | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  image_urls?: string[] | null;
  stock_quantity?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  weight?: string | null;
  // B2B pricing (vendors/regular_buyers); is_b2b_price flags when it's applied.
  b2b_discount_price?: number | null;
  b2b_discount_percentage?: number | null;
  is_b2b_price?: boolean;
  created_at?: string | null;
  [k: string]: any;
}

// The contract types product rows as a free-form `object`, so `Product` above is
// hand-written and overlaid onto the generated envelopes.
type ProductListResponse = WithFields<Schema<'ProductListResponse'>, { products: Product[] }>;

type ProductResponse = WithFields<Schema<'ProductResponse'>, { product: Product }>;

// `/products/categories` has no declared response model.
interface ProductCategoriesResponse {
  success: boolean;
  categories: string[];
}

interface ListProductsParams {
  category?: string;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

// ==========================================
// PRICE / IMAGE HELPERS
// ==========================================

/**
 * The price actually charged for a product (discount_price when present, else
 * price). For B2B roles the backend already swaps discount_price for the B2B
 * value, so this stays correct without role logic on the client.
 */
export function effectivePrice(product: Product): number {
  return product.discount_price ?? product.price ?? 0;
}

/** Original price to strike through — only meaningful when a discount applies. */
export function originalPrice(product: Product): number | null {
  return product.discount_price != null && product.discount_price < product.price
    ? product.price
    : null;
}

/** "25% OFF" label, or null when there's no discount. */
export function discountLabel(product: Product): string | null {
  const pct = product.discount_percentage;
  if (pct == null || pct <= 0) return null;
  return `${Math.round(pct)}% OFF`;
}

/** Format a rupee amount the way the catalog mocks did (₹986, ₹1,850). */
export function formatPrice(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** First product image, rewritten for the dev LAN host. Null when none. */
export function productImageUri(product: Product): string | null {
  const first = product.image_urls?.[0];
  return resolveImageUrl(first ?? null);
}

// ==========================================
// HOOKS
// ==========================================

/** List/search products with optional category, featured, and text filters. */
export function useProducts({
  category,
  isFeatured,
  search,
  limit = 50,
  offset = 0,
  enabled = true,
}: ListProductsParams = {}) {
  return useQuery({
    queryKey: ['products', category ?? null, isFeatured ?? null, search ?? null, limit, offset],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (category) params.set('category', category);
      if (isFeatured != null) params.set('is_featured', String(isFeatured));
      if (search?.trim()) params.set('search', search.trim());
      return await apiGet<ProductListResponse>(`/api/v1/products?${params.toString()}`);
    },
  });
}

/** Featured products for the "Trending now" carousel. */
export function useFeaturedProducts(limit = 10) {
  return useProducts({ isFeatured: true, limit });
}

/** Distinct product categories for filter chips / "shop by category". */
export function useProductCategories() {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: async () =>
      await apiGet<ProductCategoriesResponse>('/api/v1/products/categories'),
  });
}

/** Single product by UUID. */
export function useProduct(productId?: string) {
  return useQuery({
    queryKey: ['product', productId ?? null],
    enabled: !!productId,
    queryFn: async () => await apiGet<ProductResponse>(`/api/v1/products/${productId}`),
  });
}

/** Single product by SEO-friendly slug. */
export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ['productSlug', slug ?? null],
    enabled: !!slug,
    queryFn: async () => await apiGet<ProductResponse>(`/api/v1/products/slug/${slug}`),
  });
}

/**
 * Products related to the one being viewed, for the "Related Products" section
 * at the bottom of the detail screen. Backend ranks same-category first, then
 * backfills (see /products/{id}/related). Returns the same Product shape as the
 * catalog, with B2B pricing already applied for B2B roles.
 */
export function useRelatedProducts(productId?: string, limit = 10) {
  return useQuery({
    queryKey: ['relatedProducts', productId ?? null, limit],
    enabled: !!productId,
    queryFn: async () =>
      await apiGet<ProductListResponse>(`/api/v1/products/${productId}/related?limit=${limit}`),
  });
}

// ==========================================
// PRODUCT CART (mapped from backend customers.py /product-cart/*)
// All routes require a bearer token; these screens are only reachable when
// logged in as a customer, so the queries can stay enabled.
// ==========================================

/** A processed product-cart line item (backend already computes price/total). */
export type ProductCartItem = Schema<'ProductCartItem'>;

export type ProductCartResponse = Schema<'ProductCartResponse'>;

const PRODUCT_CART_KEY = ['productCart'];

/** Full product cart with computed line totals and grand total. */
export function useProductCart() {
  return useQuery({
    queryKey: PRODUCT_CART_KEY,
    queryFn: async () => await apiGet<ProductCartResponse>('/api/v1/customers/product-cart'),
  });
}

/** Add a product to the cart (or increment its quantity). */
export function useAddToProductCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Schema<'ProductCartItemAdd'>) =>
      await apiPost<Schema<'ProductCartOperationResponse'>>('/api/v1/customers/product-cart', {
        quantity: 1,
        ...data,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Set a cart line's quantity (backend removes the line when quantity <= 0). */
export function useUpdateProductCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      await apiPut<Schema<'ProductCartOperationResponse'>>(`/api/v1/customers/product-cart/${itemId}`, {
        quantity,
      } satisfies Schema<'ProductCartItemUpdate'>),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Remove a single line from the cart. */
export function useRemoveProductCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) =>
      await apiDelete(`/api/v1/customers/product-cart/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** Empty the entire product cart. */
export function useClearProductCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => await apiDelete('/api/v1/customers/product-cart/clear/all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

// ==========================================
// PRODUCT ORDERS (mapped from backend product_orders.py /product-orders/*)
// Create builds a Razorpay order from the cart; verify marks it paid. When the
// backend runs without real Razorpay keys it returns dev_mode=true with a fake
// order id — the client then calls dev-verify instead of opening the pay sheet.
// ==========================================

/** Delivery details sent to the backend as `shipping_address` (free-form JSON). */
export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  pincode: string;
}

/**
 * `CreateOrderRequest`. The backend prices the order server-side; the only
 * discount input it accepts is `coupon_code` (it ignores any client amount).
 */
export type CreateProductOrderPayload = WithFields<
  Schema<'CreateOrderRequest'>,
  { shipping_address: ShippingAddress }
>;

export interface ProductOrderCreateResponse {
  order: { id: string; order_number: string; total_amount: number; [k: string]: any };
  razorpay_order_id: string;
  amount: number; // rupees
  amount_paise: number; // smallest unit — what the Razorpay checkout expects
  currency: string;
  key_id: string;
  dev_mode: boolean;
}

/** Create a product order + Razorpay order from the current cart contents. */
export function useCreateProductOrder() {
  return useMutation({
    mutationFn: async (payload: CreateProductOrderPayload) =>
      // `discount_total: 0` used to be sent here; the contract has no such field
      // (the server computes discounts), so it was silently dropped. Removed.
      await apiPost<ProductOrderCreateResponse>('/api/v1/product-orders/create', payload),
  });
}

/** Verify a Razorpay payment and mark the order paid, then refresh the cart. */
export function useVerifyProductOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Schema<'VerifyPaymentRequest'>) =>
      await apiPost('/api/v1/product-orders/verify', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

/** DEV ONLY: mark an order paid without real Razorpay (backend simulation mode). */
export function useDevVerifyProductOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      await apiPost(`/api/v1/product-orders/dev-verify/${orderId}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_CART_KEY }),
  });
}

// ==========================================
// PRODUCT FAVORITES (mapped from backend customers.py /favorites/products)
// Powers the "Saved" tab's products segment. All routes require a bearer
// token, so the query is gated by `enabled` on screens reachable while logged
// out (Saved tab, product detail for guests).
// ==========================================

/** Backend returns full product rows under `favorites`, mirroring salon favorites. */
export type ProductFavoritesResponse = WithFields<Schema<'FavoritesResponse'>, { favorites: Product[] }>;

export const PRODUCT_FAVORITES_KEY = ['productFavorites'];

/** The customer's saved products (active products only). */
export function useFavoriteProducts(enabled = true) {
  return useQuery({
    queryKey: PRODUCT_FAVORITES_KEY,
    enabled,
    queryFn: async () =>
      await apiGet<ProductFavoritesResponse>('/api/v1/customers/favorites/products'),
  });
}

/** Add a product to the saved list. */
export function useAddFavoriteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) =>
      await apiPost<Schema<'FavoriteOperationResponse'>>('/api/v1/customers/favorites/products', {
        product_id: productId,
      } satisfies Schema<'ProductFavoriteCreate'>),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_FAVORITES_KEY }),
  });
}

/** Remove a product from the saved list. */
export function useRemoveFavoriteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) =>
      await apiDelete(`/api/v1/customers/favorites/products/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCT_FAVORITES_KEY }),
  });
}
