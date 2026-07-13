import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import {
  useCart,
  useCreateCartOrder,
  useCheckoutCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useValidateCoupon,
  useAvailableCoupons,
  usePublicConfigs,
  type RazorpayOrder,
  type CouponValidationResult,
} from '@/services/api/hooks/useBookingAPI';
import { RazorpayCheckout, type RazorpaySuccess } from '@/features/client/components/RazorpayCheckout';

const colors = {
  bg: '#FFFAF5',
  header: 'rgba(245, 233, 218, 0.95)',
  backBtn: '#FFF1E6',
  heading: '#221A11',
  card: '#FFF6EC',
  gold: '#F89E07',
  text: '#534433',
  datePill: '#FCEBDC',
  divider: 'rgba(217, 195, 173, 0.3)',
  white: '#FFFFFF',
  ctaBorder: 'rgba(217, 195, 173, 0.45)',
  payDivider: 'rgba(255, 255, 255, 0.6)',
  disabled: '#C7C7C7',
  muted: '#8E98A8',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'Checkout'>;

const priceText = (v?: number | null) => (v == null ? '—' : `₹${Math.round(v)}`);

function formatDate(ymd: string) {
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CheckoutScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { salonId, salonName, bookingDate, timeSlots } = route.params;
  const { user } = useAuth();

  const cart = useCart();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateCartOrder();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckoutCart();
  const { mutate: updateCartItem, isPending: isUpdatingItem } = useUpdateCartItem();
  const { mutate: removeCartItem, isPending: isRemovingItem } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearingCart } = useClearCart();
  const { mutate: validateCoupon, isPending: isValidatingCoupon } = useValidateCoupon();
  const { data: availableCoupons } = useAvailableCoupons(salonId ?? cart.data?.salon_id ?? undefined);
  const { data: configs } = usePublicConfigs();

  const [order, setOrder] = useState<RazorpayOrder | null>(null);
  const [payVisible, setPayVisible] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  const items = cart.data?.items ?? [];
  const serviceTotal = cart.data?.total_amount ?? 0;
  const displaySalon = salonName ?? cart.data?.salon_name ?? 'Salon';
  const cartBusy = isUpdatingItem || isRemovingItem || isClearingCart;
  const busy = isCreatingOrder || isCheckingOut;

  // Original (pre-sale) service total — the base the convenience fee is charged on.
  const originalServicesTotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.service_details?.price) || Number(item.unit_price) || 0) * (item.quantity || 1),
    0,
  );
  // Automatic salon-sale discount (original - post-sale cart total).
  const saleDiscount = Math.max(0, originalServicesTotal - serviceTotal);

  // Convenience fee (paid online now) from config; matches the web checkout.
  const convenienceFeePercentage = configs?.convenience_fee_percentage;
  const convenienceFee = convenienceFeePercentage
    ? Math.round((originalServicesTotal * convenienceFeePercentage) / 100 * 100) / 100
    : 0;

  // Breakdown is the source of truth when a coupon is applied.
  const breakdown = appliedCoupon?.valid ? appliedCoupon.breakdown : null;
  const couponServiceDiscount = breakdown?.discount_amount ?? 0;
  const couponFeeDiscount = breakdown?.convenience_fee_discount ?? 0;
  const couponSavings = couponServiceDiscount + couponFeeDiscount;
  const serviceDue = breakdown?.service_total_due ?? serviceTotal;

  const feeBase = breakdown?.convenience_fee_base ?? convenienceFee;
  const feeDue = breakdown?.convenience_fee_due ?? convenienceFee;   // Pay now (online)
  const grandTotal = breakdown?.total_amount ?? serviceTotal + convenienceFee;

  // Clear the applied coupon whenever cart contents change — discount depends on the cart.
  const cartItemCount = cart.data?.item_count;
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  }, [cartItemCount, serviceTotal]);

  const applyCoupon = (codeArg?: string) => {
    const code = (codeArg ?? couponInput).trim().toUpperCase();
    if (!code) return;
    validateCoupon(code, {
      onSuccess: (result) => {
        if (result.valid) {
          setAppliedCoupon(result);
          setCouponInput(code);
          setCouponMessage(null);
        } else {
          setAppliedCoupon(null);
          const isInfo = /better discount/i.test(result.reason ?? '');
          setCouponMessage({ type: isInfo ? 'info' : 'error', text: result.reason ?? 'This coupon code is not valid.' });
        }
      },
      onError: (err: any) =>
        setCouponMessage({ type: 'error', text: err?.message || 'Could not validate coupon. Please try again.' }),
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage(null);
  };

  const changeQty = (itemId: string, current: number, delta: number) => {
    const next = current + delta;
    if (next < 1) {
      removeCartItem(itemId, {
        onError: (err: any) => Alert.alert('Error', err.message || 'Could not update cart.'),
      });
      return;
    }
    updateCartItem(
      { itemId, quantity: next },
      { onError: (err: any) => Alert.alert('Error', err.message || 'Could not update cart.') },
    );
  };

  const confirmClear = () => {
    Alert.alert('Clear cart', 'Remove all services from your cart?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () =>
          clearCart(undefined, {
            onSuccess: () => navigation.goBack(),
            onError: (err: any) => Alert.alert('Error', err.message || 'Could not clear cart.'),
          }),
      },
    ]);
  };

  const startPayment = () => {
    createOrder(appliedCoupon?.coupon_code ?? undefined, {
      onSuccess: (created) => {
        setOrder(created);
        setPayVisible(true);
      },
      onError: (err: any) => Alert.alert('Payment error', err.message || 'Could not start payment.'),
    });
  };

  const handlePaymentSuccess = (result: RazorpaySuccess) => {
    setPayVisible(false);
    checkout(
      {
        booking_date: bookingDate,
        time_slots: timeSlots,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
        payment_method: 'razorpay',
        ...(appliedCoupon?.coupon_code ? { coupon_code: appliedCoupon.coupon_code } : {}),
      },
      {
        onSuccess: (booking) => {
          navigation.navigate('BookingConfirmed', {
            bookingNumber: booking?.booking_number,
            salonName: displaySalon,
            bookingDate,
            timeSlots,
          });
        },
        onError: (err: any) =>
          Alert.alert(
            'Booking failed',
            err.message || 'Payment went through but the booking could not be confirmed. Please contact support.',
          ),
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.heading} name="arrow-back" size={16} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons color={colors.gold} name="storefront-outline" size={26} />
          </View>
          <Text style={styles.salonName}>{displaySalon}</Text>
          <Text style={styles.salonService}>
            {items.length} {items.length === 1 ? 'service' : 'services'}
          </Text>
          <View style={styles.datePill}>
            <Ionicons color={colors.gold} name="calendar-outline" size={13} />
            <Text style={styles.datePillText}>
              {formatDate(bookingDate)} • {timeSlots.join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>YOUR SERVICES</Text>
            {items.length > 0 ? (
              <Pressable disabled={cartBusy} hitSlop={8} onPress={confirmClear}>
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.priceCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text numberOfLines={1} style={styles.priceLabel}>
                    {item.service_details?.name ?? 'Service'}
                  </Text>
                  <Text style={styles.priceValue}>{priceText(item.line_total)}</Text>
                </View>
                <View style={styles.serviceControls}>
                  <View style={styles.stepper}>
                    <Pressable
                      disabled={cartBusy}
                      hitSlop={4}
                      onPress={() => changeQty(item.id, item.quantity, -1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons color={colors.heading} name="remove" size={14} />
                    </Pressable>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <Pressable
                      disabled={cartBusy}
                      hitSlop={4}
                      onPress={() => changeQty(item.id, item.quantity, 1)}
                      style={styles.stepperBtn}
                    >
                      <Ionicons color={colors.heading} name="add" size={14} />
                    </Pressable>
                  </View>
                  <Pressable
                    disabled={cartBusy}
                    hitSlop={6}
                    onPress={() => removeCartItem(item.id)}
                    style={styles.removeBtn}
                  >
                    <Ionicons color={colors.muted} name="trash-outline" size={16} />
                  </Pressable>
                </View>
              </View>
            ))}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service total</Text>
              <Text style={styles.priceValue}>{priceText(originalServicesTotal)}</Text>
            </View>
            {saleDiscount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Salon sale</Text>
                <Text style={styles.discountValue}>-{priceText(saleDiscount)}</Text>
              </View>
            ) : null}
            {couponServiceDiscount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Coupon discount</Text>
                <Text style={styles.discountValue}>-{priceText(couponServiceDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Convenience fee</Text>
              <Text style={styles.priceValue}>{priceText(feeBase)}</Text>
            </View>
            {couponFeeDiscount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Fee discount</Text>
                <Text style={styles.discountValue}>-{priceText(couponFeeDiscount)}</Text>
              </View>
            ) : null}
            {couponSavings > 0 ? (
              <View style={styles.couponSaveBadge}>
                <Text style={styles.couponSaveText}>You save {priceText(couponSavings)}</Text>
              </View>
            ) : null}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.subtotalLabel}>Total</Text>
              <Text style={styles.subtotalValue}>{priceText(grandTotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Pay now</Text>
              <Text style={styles.totalValue}>{priceText(feeDue)}</Text>
            </View>
            <Text style={styles.payAtSalonNote}>Pay {priceText(serviceDue)} at the salon after your appointment</Text>
          </View>
        </View>

        {/* Coupon */}
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>COUPON</Text>
          <View style={styles.priceCard}>
            {appliedCoupon?.valid ? (
              <View style={styles.couponAppliedRow}>
                <View style={styles.couponChip}>
                  <Ionicons color="#166534" name="pricetag" size={13} />
                  <Text style={styles.couponChipText}>{appliedCoupon.coupon_code}</Text>
                </View>
                <Pressable hitSlop={8} onPress={removeCoupon}>
                  <Text style={styles.couponRemove}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.couponInputRow}>
                <TextInput
                  autoCapitalize="characters"
                  editable={!isValidatingCoupon}
                  onChangeText={(t) => setCouponInput(t.toUpperCase())}
                  placeholder="Have a coupon?"
                  placeholderTextColor={colors.muted}
                  style={styles.couponInput}
                  value={couponInput}
                />
                <Pressable
                  disabled={!couponInput.trim() || isValidatingCoupon}
                  onPress={() => applyCoupon()}
                  style={[styles.couponApplyBtn, (!couponInput.trim() || isValidatingCoupon) && styles.couponApplyBtnDisabled]}
                >
                  {isValidatingCoupon ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.couponApplyText}>Apply</Text>
                  )}
                </Pressable>
              </View>
            )}
            {couponMessage ? (
              <Text style={[styles.couponMsg, couponMessage.type === 'info' ? styles.couponMsgInfo : styles.couponMsgError]}>
                {couponMessage.text}
              </Text>
            ) : null}

            {!appliedCoupon?.valid && (availableCoupons?.length ?? 0) > 0 ? (
              <View style={styles.availableList}>
                <Text style={styles.availableHeading}>AVAILABLE OFFERS</Text>
                {availableCoupons!.map((coupon) => (
                  <Pressable
                    key={coupon.id}
                    disabled={isValidatingCoupon}
                    onPress={() => applyCoupon(coupon.code)}
                    style={styles.availableCard}
                  >
                    <View style={styles.availableInfo}>
                      <View style={styles.availableTitleRow}>
                        <Ionicons color={colors.gold} name="pricetag" size={13} />
                        <Text style={styles.availableSummary}>{coupon.summary}</Text>
                      </View>
                      {coupon.subtitle ? (
                        <Text style={styles.availableSubtitle}>{coupon.subtitle}</Text>
                      ) : null}
                      <View style={styles.availableCodeChip}>
                        <Text style={styles.availableCode}>{coupon.code}</Text>
                      </View>
                    </View>
                    <Text style={styles.availableApply}>Apply</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons color={colors.gold} name="information-circle-outline" size={18} />
          <Text style={styles.noteText}>
            The convenience fee confirms your booking and is paid online now. The service amount is
            paid directly at the salon after your appointment.
          </Text>
        </View>

        <View style={styles.payMethodCard}>
          <Ionicons color={colors.heading} name="shield-checkmark-outline" size={18} />
          <Text style={styles.payMethodText}>Secure payment via Razorpay — UPI, cards & wallets</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable
          disabled={busy || items.length === 0}
          onPress={startPayment}
          style={[styles.payButton, (busy || items.length === 0) && styles.payButtonDisabled]}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.payText}>PROCEED TO PAYMENT</Text>
              <Ionicons color={colors.white} name="arrow-forward" size={18} />
            </>
          )}
        </Pressable>
      </View>

      <RazorpayCheckout
        visible={payVisible}
        order={order}
        description={`Booking at ${displaySalon}`}
        prefill={{
          name: user?.full_name,
          email: user?.email,
          contact: (user?.phone ?? '').replace(/^\+/, ''),
        }}
        onSuccess={handlePaymentSuccess}
        onDismiss={() => setPayVisible(false)}
        onError={(msg) => {
          setPayVisible(false);
          Alert.alert('Payment failed', msg);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  headerWrap: {
    alignItems: 'center',
    backgroundColor: colors.header,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    width: 40,
  },
  headerTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 22, letterSpacing: -0.44 },
  scrollContent: { gap: 23, paddingBottom: 130, paddingHorizontal: 17, paddingTop: 16 },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.gold,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.datePill,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  salonName: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 20, letterSpacing: -0.2 },
  salonService: { color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 14 },
  datePill: {
    alignItems: 'center',
    backgroundColor: colors.datePill,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  datePillText: { color: colors.heading, fontFamily: 'Inter_500Medium', fontSize: 13 },
  block: { gap: 16 },
  sectionHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionTitle: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 14, letterSpacing: 1.4 },
  clearText: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  priceCard: { backgroundColor: colors.card, borderRadius: 8, gap: 12, padding: 16 },
  priceRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { color: colors.text, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, paddingRight: 12 },
  priceValue: { color: colors.heading, fontFamily: 'Inter_400Regular', fontSize: 15 },
  discountValue: { color: '#15803D', fontFamily: 'Inter_500Medium', fontSize: 15 },
  serviceRow: { gap: 8 },
  couponInputRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  couponInput: {
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  couponApplyBtn: {
    alignItems: 'center',
    backgroundColor: colors.heading,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  couponApplyBtnDisabled: { opacity: 0.5 },
  couponApplyText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  couponAppliedRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  couponChip: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  couponChipText: { color: '#166534', fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: 0.5 },
  couponRemove: { color: colors.muted, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  couponMsg: { fontFamily: 'Inter_500Medium', fontSize: 13, marginTop: 10 },
  couponMsgError: { color: '#DC2626' },
  couponMsgInfo: { color: colors.text },
  couponSaveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  couponSaveText: { color: '#166534', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  availableList: { gap: 8, marginTop: 4 },
  availableHeading: { color: colors.muted, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  availableCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gold,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  availableInfo: { flex: 1, gap: 4, paddingRight: 12 },
  availableTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  availableSummary: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  availableSubtitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 12 },
  availableCodeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.datePill,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availableCode: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  availableApply: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  serviceInfo: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  serviceControls: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
  },
  stepperBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  stepperValue: { color: colors.heading, fontFamily: 'Inter_500Medium', fontSize: 14, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 4 },
  priceDivider: { backgroundColor: colors.divider, height: 1 },
  subtotalLabel: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  subtotalValue: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  totalLabel: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 18, letterSpacing: -0.2 },
  totalValue: { color: colors.gold, fontFamily: 'Montserrat_600SemiBold', fontSize: 18, letterSpacing: -0.2 },
  payAtSalonNote: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: -4 },
  noteCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  noteText: { color: colors.text, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  payMethodCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.divider,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  payMethodText: { color: colors.text, flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13 },
  ctaShell: {
    backgroundColor: colors.bg,
    borderTopColor: colors.ctaBorder,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  payButtonDisabled: { backgroundColor: colors.disabled },
  payText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14, letterSpacing: 0.35 },
});
