import { useVendorSalon } from '@/services/api/hooks/useVendorAPI';

/**
 * Mirrors the web app's PaymentProtectionWrapper predicate: Services, Bookings,
 * Profile, and Run Promo are locked until the vendor's registration fee is paid
 * and the salon is active. Dashboard is intentionally NOT gated by this hook —
 * it renders its own inline locked-state card instead (matching web behavior).
 */
export function useVendorPaymentGate() {
  const { data: salon, isLoading } = useVendorSalon();

  const isPaymentPending = !!salon && (!salon.is_active || !salon.registration_fee_paid);

  return {
    salon,
    isLoading,
    isPaymentPending,
  };
}
