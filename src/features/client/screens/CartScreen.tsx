import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { resolveImageUrl } from '@/services/api/imageUrl';
import {
  formatPrice,
  useAvailableProductCoupons,
  useClearProductCart,
  useCreateProductOrder,
  useDevVerifyProductOrder,
  useProductCart,
  useRemoveProductCartItem,
  useUpdateProductCartItem,
  useValidateProductCoupon,
  useVerifyProductOrder,
  type ProductCouponValidationResult,
  type ProductOrderCreateResponse,
  type ShippingAddress,
  type VerifyProductOrderResponse,
} from '@/services/api/hooks/useProductsAPI';
import { usePincodeLookup } from '@/services/api/hooks/useLocationAPI';
import type { RazorpayOrder } from '@/services/api/hooks/useBookingAPI';
import { RazorpayCheckout, type RazorpaySuccess } from '@/features/client/components/RazorpayCheckout';

const productFallback = require('@/assets/product/shampoo-hero.png');

const colors = {
  bg: '#FFF8F4',
  white: '#FFFFFF',
  headerBg: 'rgba(245, 233, 218, 0.95)',
  backBtn: '#FFF1E6',
  heading: '#221A11',
  muted: '#534433',
  iconMuted: '#867461',
  border: '#D9C3AD',
  lightBorder: '#F0E0D1',
  gold: '#F89E07',
  green: '#2E7D32',
  inputBg: '#FFF8F4',
  priceCard: 'rgba(255, 255, 255, 0.7)',
  error: '#DC2626',
  disabled: '#C7C7C7',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

const SIX_DIGITS = /^\d{6}$/;

/** Space-joined, trimmed, non-empty parts — for prefilling the street line from the profile. */
function joinParts(...parts: unknown[]) {
  return parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
    .join(', ');
}

export function CartScreen() {
  const navigation = useNavigation<Navigation>();
  const { user, isAuthenticated } = useAuth();
  const signedIn = isAuthenticated && !user?.guest;

  const cartQuery = useProductCart();
  const updateItem = useUpdateProductCartItem();
  const removeItem = useRemoveProductCartItem();
  const createOrder = useCreateProductOrder();
  const verifyOrder = useVerifyProductOrder();
  const devVerifyOrder = useDevVerifyProductOrder();
  const clearCart = useClearProductCart();
  const validateCoupon = useValidateProductCoupon();
  const availableCoupons = useAvailableProductCoupons(signedIn);

  const items = cartQuery.data?.items ?? [];
  // Items deactivated by admin since they were added can't be charged for
  // (same rule as the web checkout): they stay visible so they can be removed,
  // but are left out of the order, the coupon preview and the totals.
  const purchasable = items.filter((i) => i.is_active !== false);
  const subtotal = purchasable.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const purchasableUnits = purchasable.reduce((sum, i) => sum + (i.quantity || 0), 0);

  // Delivery details, prefilled from the signed-in profile where available
  // (the web does the same). Sent in the shipping-address shape the web
  // writes and the admin panel reads — see `ShippingAddress`.
  const [fullName, setFullName] = useState<string>(user?.full_name ?? '');
  const [phone, setPhone] = useState<string>(user?.phone ?? '');
  const [street, setStreet] = useState<string>(joinParts(user?.address_line1, user?.address_line2));
  const [city, setCity] = useState<string>(user?.city ?? '');
  const [stateName, setStateName] = useState<string>(user?.state ?? '');
  const [pincode, setPincode] = useState<string>(user?.pincode ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  // PIN -> city/state autofill. Only overwrites a field that is empty or still
  // holds the previous autofill, never something the customer typed.
  const pincodeLookup = usePincodeLookup(pincode);
  const lastAutofill = useRef<{ city: string; state: string }>({ city: '', state: '' });
  useEffect(() => {
    const result = pincodeLookup.data;
    if (!result?.valid) return;
    // Capture the previous autofill before overwriting the ref: the state
    // updaters run later, after the ref already holds the new value.
    if (result.city) {
      const next = result.city;
      const prev = lastAutofill.current.city;
      setCity((cur) => (!cur.trim() || cur === prev ? next : cur));
      lastAutofill.current.city = next;
    }
    if (result.state) {
      const next = result.state;
      const prev = lastAutofill.current.state;
      setStateName((cur) => (!cur.trim() || cur === prev ? next : cur));
      lastAutofill.current.state = next;
    }
  }, [pincodeLookup.data]);
  // `valid: false` is India Post saying "no such PIN". `null` (lookup down) never blocks.
  const pincodeUnknown =
    SIX_DIGITS.test(pincode.trim()) && pincodeLookup.data?.pincode === pincode.trim() && pincodeLookup.data.valid === false;

  // Coupon: preview with validate-coupon, then send only the code on create.
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ProductCouponValidationResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const discount = appliedCoupon?.breakdown?.discount_amount ?? 0;
  const payable = appliedCoupon?.breakdown?.total_amount ?? subtotal;

  // The discount was computed for these exact lines — drop it when they change.
  const cartSignature = purchasable.map((i) => `${i.product_id}:${i.quantity}`).join('|');
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  }, [cartSignature]);

  // Razorpay pay-sheet + the order awaiting verification.
  const [payOrder, setPayOrder] = useState<RazorpayOrder | null>(null);
  const [payVisible, setPayVisible] = useState(false);
  // Non-null between "charged" and "order confirmed": blocks leaving the screen.
  const [paidAttempt, setPaidAttempt] = useState<RazorpaySuccess | null>(null);
  const confirming = paidAttempt != null;

  useEffect(() => {
    if (!confirming) return;
    return navigation.addListener('beforeRemove', (event) => event.preventDefault());
  }, [confirming, navigation]);

  const busy = createOrder.isPending || verifyOrder.isPending || devVerifyOrder.isPending || confirming;

  // Backend clamps to available stock and removes the line at qty 0.
  const changeQty = (itemId: string, current: number, delta: number) =>
    updateItem.mutate(
      { itemId, quantity: Math.max(1, current + delta) },
      { onError: (err: any) => Alert.alert('Could not update bag', err?.message || 'Please try again.') },
    );

  const removeLine = (itemId: string) =>
    removeItem.mutate(itemId, {
      onError: (err: any) => Alert.alert('Could not remove item', err?.message || 'Please try again.'),
    });

  const applyCoupon = (codeArg?: string) => {
    const code = (codeArg ?? couponInput).trim().toUpperCase();
    if (!code || purchasable.length === 0) return;
    validateCoupon.mutate(
      { code, items: purchasable.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setAppliedCoupon(result);
            setCouponInput(result.coupon_code ?? code);
            setCouponMessage(null);
          } else {
            setAppliedCoupon(null);
            setCouponMessage(result.reason || 'This coupon code is not valid.');
          }
        },
        onError: (err: any) => {
          setAppliedCoupon(null);
          setCouponMessage(err?.message || 'Failed to validate coupon. Please try again.');
        },
      },
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage(null);
  };

  const finishOrder = (result: VerifyProductOrderResponse) => {
    setPaidAttempt(null);
    // The backend doesn't clear the product cart on payment; do it here. A
    // failure must not hide the confirmation — the order already succeeded.
    clearCart.mutate();
    removeCoupon();
    Alert.alert(
      'Order placed',
      result.order_number
        ? `Your order ${result.order_number} has been placed successfully.`
        : 'Your order has been placed successfully.',
      [
        {
          text: 'View order',
          onPress: () =>
            navigation.replace('OrderDetail', { orderId: result.order_id, orderNumber: result.order_number }),
        },
        { text: 'Done', onPress: () => navigation.navigate('Tabs') },
      ],
    );
  };

  /** Turn a successful payment into a confirmed order. Retryable as-is. */
  const confirmPayment = (result: RazorpaySuccess) => {
    setPaidAttempt(result);
    verifyOrder.mutate(
      {
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      },
      {
        onSuccess: finishOrder,
        onError: (err: any) =>
          Alert.alert(
            'Almost there',
            `${err?.message || "We took your payment but couldn't confirm the order."}\n\nTap Retry — you won't be charged again.`,
            [
              { text: 'Retry', onPress: () => confirmPayment(result) },
              {
                text: 'Later',
                style: 'cancel',
                // Release the screen. The payment webhook still marks the order
                // paid server-side; it shows up under Profile > My Orders.
                onPress: () => setPaidAttempt(null),
              },
            ],
          ),
      },
    );
  };

  const handlePaymentSuccess = (result: RazorpaySuccess) => {
    setPayVisible(false);
    confirmPayment(result);
  };

  const openPayment = (res: ProductOrderCreateResponse) => {
    if (res.dev_mode) {
      // Simulation mode: no real Razorpay order, mark it paid directly.
      devVerifyOrder.mutate(res.order.id, {
        onSuccess: finishOrder,
        onError: (err: any) => Alert.alert('Order failed', err?.message || 'Could not complete the order.'),
      });
      return;
    }
    setPayOrder({
      order_id: res.razorpay_order_id,
      amount: res.amount,
      amount_paise: res.amount_paise,
      currency: res.currency,
      key_id: res.key_id,
    });
    setPayVisible(true);
  };

  const proceed = () => {
    if (purchasable.length === 0) return;
    const address: ShippingAddress = {
      full_name: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      state: stateName.trim(),
      postal_code: pincode.trim(),
      country: 'India',
      phone: phone.trim(),
    };
    if (!address.full_name || !address.street || !address.city || !address.state || !address.postal_code || !address.phone) {
      setFormError('Please fill in all delivery details.');
      return;
    }
    if (!SIX_DIGITS.test(address.postal_code)) {
      setFormError('Enter a valid 6-digit PIN code.');
      return;
    }
    if (pincodeUnknown) {
      setFormError("We couldn't find this PIN code. Please check it.");
      return;
    }
    setFormError(null);

    createOrder.mutate(
      {
        shipping_address: address,
        items: purchasable.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        ...(appliedCoupon?.coupon_code ? { coupon_code: appliedCoupon.coupon_code } : {}),
      },
      {
        onSuccess: (res) => {
          // Re-checked at create time: the coupon can expire or run out between
          // preview and order. The order still goes through, at full price.
          if (res.coupon_reason) {
            setAppliedCoupon(null);
            Alert.alert(
              'Coupon not applied',
              `${res.coupon_reason}\n\nYou'll be charged ${formatPrice(res.amount)}.`,
              [{ text: 'Continue', onPress: () => openPayment(res) }, { text: 'Cancel', style: 'cancel' }],
            );
            return;
          }
          openPayment(res);
        },
        onError: (err: any) => Alert.alert('Checkout failed', err?.message || 'Could not start checkout.'),
      },
    );
  };

  const offers = availableCoupons.data ?? [];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          disabled={confirming}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, confirming && styles.backButtonDisabled]}
        >
          <Ionicons color={colors.heading} name="arrow-back" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>YOUR BAG ({purchasableUnits})</Text>

        {cartQuery.isLoading ? (
          <ActivityIndicator color={colors.gold} size="large" style={styles.loader} />
        ) : cartQuery.isError ? (
          <View style={styles.stateBlock}>
            <Text style={styles.emptyText}>Couldn’t load your cart. Please try again.</Text>
            <Pressable onPress={() => cartQuery.refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateBlock}>
            <Text style={styles.emptyText}>Your bag is empty.</Text>
            <Pressable onPress={() => navigation.navigate('ProductCatalog', {})} style={styles.retryBtn}>
              <Text style={styles.retryText}>Browse Products</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => {
              const uri = resolveImageUrl(item.image_url ?? item.image_urls?.[0] ?? null);
              const unavailable = item.is_active === false;
              return (
                <View key={item.id} style={[styles.itemCard, unavailable && styles.itemCardUnavailable]}>
                  <View style={styles.itemThumb}>
                    <Image
                      resizeMode="contain"
                      source={uri ? { uri } : productFallback}
                      style={styles.itemImage}
                    />
                  </View>

                  <View style={styles.itemBody}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemName}>{item.name ?? 'Product'}</Text>
                      <Pressable
                        disabled={removeItem.isPending || confirming}
                        hitSlop={6}
                        onPress={() => removeLine(item.id)}
                      >
                        <Ionicons color={colors.iconMuted} name="close" size={18} />
                      </Pressable>
                    </View>

                    {unavailable ? (
                      <Text style={styles.unavailableText}>No longer available — remove it to continue.</Text>
                    ) : (
                      <View style={styles.itemBottomRow}>
                        <View style={styles.itemPriceWrap}>
                          <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
                          <Text style={styles.itemSize}>{formatPrice(item.price)} each</Text>
                        </View>

                        <View style={styles.stepper}>
                          <Pressable
                            disabled={updateItem.isPending || item.quantity <= 1 || confirming}
                            onPress={() => changeQty(item.id, item.quantity, -1)}
                            style={styles.stepperButton}
                          >
                            <Ionicons color={colors.heading} name="remove" size={14} />
                          </Pressable>
                          <Text style={styles.stepperValue}>{item.quantity}</Text>
                          <Pressable
                            disabled={updateItem.isPending || confirming}
                            onPress={() => changeQty(item.id, item.quantity, 1)}
                            style={styles.stepperButton}
                          >
                            <Ionicons color={colors.heading} name="add" size={14} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.deliveryCard}>
          <Text style={styles.sectionLabelDark}>DELIVERY DETAILS</Text>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor={colors.iconMuted}
                style={styles.input}
                value={fullName}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="Contact number"
                placeholderTextColor={colors.iconMuted}
                style={styles.input}
                value={phone}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              multiline
              onChangeText={setStreet}
              placeholder="House / flat, street, area"
              placeholderTextColor={colors.iconMuted}
              style={[styles.input, styles.inputMultiline]}
              value={street}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>PIN code</Text>
              <TextInput
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(v) => setPincode(v.replace(/[^\d]/g, ''))}
                placeholder="6-digit PIN"
                placeholderTextColor={colors.iconMuted}
                style={[styles.input, pincodeUnknown && styles.inputError]}
                value={pincode}
              />
              {pincodeLookup.isFetching ? (
                <Text style={styles.fieldHint}>Looking up PIN…</Text>
              ) : pincodeUnknown ? (
                <Text style={styles.fieldHintError}>PIN code not found</Text>
              ) : null}
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={colors.iconMuted}
                style={styles.input}
                value={city}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>State</Text>
            <TextInput
              onChangeText={setStateName}
              placeholder="State"
              placeholderTextColor={colors.iconMuted}
              style={styles.input}
              value={stateName}
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        </View>

        {signedIn && purchasable.length > 0 ? (
          <View style={styles.deliveryCard}>
            <Text style={styles.sectionLabelDark}>COUPON</Text>
            {appliedCoupon?.valid ? (
              <View style={styles.couponAppliedRow}>
                <View style={styles.couponChip}>
                  <Ionicons color="#166534" name="checkmark" size={13} />
                  <Text style={styles.couponChipText}>{appliedCoupon.coupon_code}</Text>
                </View>
                <Pressable disabled={busy} hitSlop={8} onPress={removeCoupon}>
                  <Text style={styles.couponRemove}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.couponInputRow}>
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!validateCoupon.isPending}
                  onChangeText={(t) => setCouponInput(t.toUpperCase())}
                  onSubmitEditing={() => applyCoupon()}
                  placeholder="Have a coupon?"
                  placeholderTextColor={colors.iconMuted}
                  returnKeyType="done"
                  style={[styles.input, styles.couponInput]}
                  value={couponInput}
                />
                <Pressable
                  disabled={!couponInput.trim() || validateCoupon.isPending}
                  onPress={() => applyCoupon()}
                  style={[
                    styles.couponApplyBtn,
                    (!couponInput.trim() || validateCoupon.isPending) && styles.couponApplyBtnDisabled,
                  ]}
                >
                  {validateCoupon.isPending ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.couponApplyText}>Apply</Text>
                  )}
                </Pressable>
              </View>
            )}
            {couponMessage ? <Text style={styles.formError}>{couponMessage}</Text> : null}

            {!appliedCoupon?.valid && offers.length > 0 ? (
              <View style={styles.availableList}>
                <Text style={styles.availableHeading}>AVAILABLE OFFERS</Text>
                {offers.map((coupon) => (
                  <Pressable
                    key={coupon.id}
                    disabled={validateCoupon.isPending}
                    onPress={() => applyCoupon(coupon.code)}
                    style={styles.availableCard}
                  >
                    <View style={styles.availableInfo}>
                      <View style={styles.availableTitleRow}>
                        <Ionicons color={colors.gold} name="pricetag" size={13} />
                        <Text style={styles.availableSummary}>{coupon.summary}</Text>
                      </View>
                      {coupon.subtitle ? <Text style={styles.availableSubtitle}>{coupon.subtitle}</Text> : null}
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
        ) : null}

        <View style={styles.priceCard}>
          <Text style={styles.sectionLabelDark}>PRICE DETAILS</Text>
          <View style={styles.priceRows}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Subtotal ({purchasableUnits} {purchasableUnits === 1 ? 'item' : 'items'})
              </Text>
              <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
            </View>
            {discount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Coupon discount</Text>
                <Text style={styles.priceFree}>-{formatPrice(discount)}</Text>
              </View>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceFree}>Free</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatPrice(payable)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.payNote}>
          <Ionicons color={colors.heading} name="shield-checkmark-outline" size={18} />
          <Text style={styles.payNoteText}>Secure payment via Razorpay — UPI, cards & wallets</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable disabled={purchasable.length === 0 || busy} onPress={proceed}>
          <LinearGradient
            colors={['#D7A797', colors.gold]}
            end={{ x: 0.3, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.ctaButton, (purchasable.length === 0 || busy) && styles.ctaButtonDisabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {purchasable.length > 0 ? `Pay ${formatPrice(payable)}` : 'Proceed to Payment'}
                </Text>
                <Ionicons color={colors.white} name="arrow-forward" size={18} />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      <RazorpayCheckout
        visible={payVisible}
        order={payOrder}
        description="Lubist product order"
        prefill={{
          name: fullName || user?.full_name,
          email: user?.email,
          contact: phone.replace(/^\+/, ''),
        }}
        onSuccess={handlePaymentSuccess}
        // Guarded on `confirming`: Razorpay can report a dismissal behind a
        // payment that succeeded, which must not read as a cancellation.
        onDismiss={() => {
          if (confirming) return;
          setPayVisible(false);
        }}
        onError={(msg) => {
          if (confirming) return;
          setPayVisible(false);
          Alert.alert('Payment failed', msg);
        }}
      />

      {confirming ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.confirmTitle}>Confirming your payment</Text>
            <Text style={styles.confirmBody}>
              Payment received. Please stay on this screen while we place your order.
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 130,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    color: colors.muted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionLabelDark: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginTop: 24,
    textAlign: 'center',
  },
  itemsList: {
    gap: 12,
    marginTop: -8,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    padding: 8,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  itemThumb: {
    backgroundColor: colors.lightBorder,
    borderRadius: 4,
    height: 96,
    overflow: 'hidden',
    width: 80,
  },
  itemImage: {
    height: '100%',
    width: '100%',
  },
  itemBody: {
    flex: 1,
    paddingVertical: 2,
  },
  itemTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    paddingRight: 8,
  },
  itemSize: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: 2,
  },
  itemBottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  itemPriceWrap: {
    gap: 2,
  },
  itemPrice: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperValue: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 4,
    elevation: 2,
    gap: 14,
    padding: 16,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldHalf: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  formError: {
    color: colors.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  priceCard: {
    backgroundColor: colors.priceCard,
    borderColor: colors.lightBorder,
    borderRadius: 4,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  priceRows: {
    gap: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceValue: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  priceFree: {
    color: colors.green,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  priceDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 2,
  },
  totalLabel: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  totalValue: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  payNote: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.lightBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  payNoteText: {
    color: colors.muted,
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  ctaShell: {
    backgroundColor: 'rgba(255, 248, 244, 0.9)',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  ctaButton: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  backButtonDisabled: {
    opacity: 0.4,
  },
  stateBlock: {
    alignItems: 'center',
    gap: 12,
  },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  itemCardUnavailable: {
    opacity: 0.6,
  },
  unavailableText: {
    color: colors.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginTop: 8,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldHint: {
    color: colors.iconMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  fieldHintError: {
    color: colors.error,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  couponInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    letterSpacing: 1,
  },
  couponApplyBtn: {
    alignItems: 'center',
    backgroundColor: colors.heading,
    borderRadius: 4,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  couponApplyBtnDisabled: {
    opacity: 0.5,
  },
  couponApplyText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  couponAppliedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  couponChipText: {
    color: '#166534',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  couponRemove: {
    color: colors.iconMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  availableList: {
    gap: 8,
  },
  availableHeading: {
    color: colors.iconMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  availableCard: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.gold,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  availableInfo: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  availableTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  availableSummary: {
    color: colors.heading,
    flexShrink: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  availableSubtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  availableCodeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lightBorder,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  availableCode: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  availableApply: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(34, 26, 17, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  confirmCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
  },
  confirmTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    textAlign: 'center',
  },
  confirmBody: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
