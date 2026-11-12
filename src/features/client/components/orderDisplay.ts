import type { ProductOrder } from '@/services/api/hooks/useProductsAPI';

/** Badge colours per product-order status (same tones as the web's ORDER_STATUS_TONE). */
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FEF3C7', fg: '#92400E' },
  paid: { bg: '#DCFCE7', fg: '#166534' },
  shipped: { bg: '#DBEAFE', fg: '#1E40AF' },
  delivered: { bg: '#DCFCE7', fg: '#166534' },
  cancelled: { bg: '#FEE2E2', fg: '#991B1B' },
};
const NEUTRAL = { bg: '#F0E0D1', fg: '#534433' };

export function orderStatusStyle(status?: string | null) {
  return STATUS_STYLE[(status ?? '').toLowerCase()] ?? NEUTRAL;
}

export function orderStatusLabel(status?: string | null) {
  return (status ?? 'unknown').toUpperCase();
}

/** "Mar 4, 2026" from an ISO timestamp, in the device's local time zone. */
export function formatOrderDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Shipping address lines for display. Reads both the current shape
 * (`street`/`postal_code`, shared with the web and admin) and the keys older
 * app builds wrote (`address_line`/`pincode`).
 */
export function shippingAddressLines(address: ProductOrder['shipping_address']): string[] {
  if (!address) return [];
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const street = str(address.street) || str(address.address_line);
  const postal = str(address.postal_code) || str(address.pincode);
  const cityLine = [str(address.city), [str(address.state), postal].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [str(address.full_name), street, cityLine, str(address.country)].filter(Boolean);
}
