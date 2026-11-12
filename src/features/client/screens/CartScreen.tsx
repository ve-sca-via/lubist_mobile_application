import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
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
  useClearProductCart,
  useCreateProductOrder,
  useDevVerifyProductOrder,
  useProductCart,
  useRemoveProductCartItem,
  useUpdateProductCartItem,
  useVerifyProductOrder,
} from '@/services/api/hooks/useProductsAPI';
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
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();

  const cartQuery = useProductCart();
  const updateItem = useUpdateProductCartItem();
  const removeItem = useRemoveProductCartItem();
  const createOrder = useCreateProductOrder();
  const verifyOrder = useVerifyProductOrder();
  const devVerifyOrder = useDevVerifyProductOrder();
  const clearCart = useClearProductCart();

  const items = cartQuery.data?.items ?? [];
  const totalAmount = cartQuery.data?.total_amount ?? 0;
  const itemCount = cartQuery.data?.item_count ?? 0;

  // Delivery details — collected here since there is no saved-address API yet.
  // Name/phone are prefilled from the signed-in profile where available.
  const [fullName, setFullName] = useState<string>(user?.full_name ?? '');
  const [phone, setPhone] = useState<string>(user?.phone ?? '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Razorpay pay-sheet + the order awaiting verification.
  const [payOrder, setPayOrder] = useState<RazorpayOrder | null>(null);
  const [payVisible, setPayVisible] = useState(false);
  const [placedNumber, setPlacedNumber] = useState<string | null>(null);

  const busy =
    createOrder.isPending || verifyOrder.isPending || devVerifyOrder.isPending;

  // Backend clamps to available stock and removes the line at qty 0.
  const changeQty = (itemId: string, current: number, delta: number) =>
    updateItem.mutate({ itemId, quantity: Math.max(1, current + delta) });

  const finishOrder = (orderNumber?: string | null) => {
    clearCart.mutate();
    Alert.alert(
      'Order placed',
      orderNumber
        ? `Your order ${orderNumber} has been placed successfully.`
        : 'Your order has been placed successfully.',
      [{ text: 'Done', onPress: () => navigation.navigate('Tabs') }],
    );
  };

  const handlePaymentSuccess = (result: RazorpaySuccess) => {
    setPayVisible(false);
    verifyOrder.mutate(
      {
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      },
      {
        onSuccess: () => finishOrder(placedNumber),
        onError: (err: any) =>
          Alert.alert(
            'Payment not confirmed',
            err?.message ||
              'Your payment went through but the order could not be confirmed. Please contact support.',
          ),
      },
    );
  };

  const proceed = () => {
    if (items.length === 0) return;
    const address = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      address_line: addressLine.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    };
    if (Object.values(address).some((v) => !v)) {
      setFormError('Please fill in all delivery details.');
      return;
    }
    setFormError(null);

    createOrder.mutate(
      {
        shipping_address: address,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      },
      {
        onSuccess: (res) => {
          setPlacedNumber(res.order?.order_number ?? null);
          if (res.dev_mode) {
            // Simulation mode: no real Razorpay order, mark it paid directly.
            devVerifyOrder.mutate(res.order.id, {
              onSuccess: () => finishOrder(res.order?.order_number),
              onError: (err: any) =>
                Alert.alert('Order failed', err?.message || 'Could not complete the order.'),
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
        },
        onError: (err: any) =>
          Alert.alert('Checkout failed', err?.message || 'Could not start checkout.'),
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.heading} name="arrow-back" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>YOUR BAG ({itemCount})</Text>

        {cartQuery.isLoading ? (
          <ActivityIndicator color={colors.gold} size="large" style={styles.loader} />
        ) : cartQuery.isError ? (
          <Text style={styles.emptyText}>Couldn’t load your cart. Please try again.</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>Your bag is empty.</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => {
              const uri = resolveImageUrl(item.image_url ?? item.image_urls?.[0] ?? null);
              return (
                <View key={item.id} style={styles.itemCard}>
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
                        disabled={removeItem.isPending}
                        onPress={() => removeItem.mutate(item.id)}
                      >
                        <Ionicons color={colors.iconMuted} name="close" size={18} />
                      </Pressable>
                    </View>

                    <View style={styles.itemBottomRow}>
                      <View style={styles.itemPriceWrap}>
                        <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
                        <Text style={styles.itemSize}>
                          {formatPrice(item.price)} each
                        </Text>
                      </View>

                      <View style={styles.stepper}>
                        <Pressable
                          disabled={updateItem.isPending || item.quantity <= 1}
                          onPress={() => changeQty(item.id, item.quantity, -1)}
                          style={styles.stepperButton}
                        >
                          <Ionicons color={colors.heading} name="remove" size={14} />
                        </Pressable>
                        <Text style={styles.stepperValue}>{item.quantity}</Text>
                        <Pressable
                          disabled={updateItem.isPending}
                          onPress={() => changeQty(item.id, item.quantity, 1)}
                          style={styles.stepperButton}
                        >
                          <Ionicons color={colors.heading} name="add" size={14} />
                        </Pressable>
                      </View>
                    </View>
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
              onChangeText={setAddressLine}
              placeholder="House / flat, street, area"
              placeholderTextColor={colors.iconMuted}
              style={[styles.input, styles.inputMultiline]}
              value={addressLine}
            />
          </View>

          <View style={styles.fieldRow}>
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
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Pincode</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setPincode}
                placeholder="Pincode"
                placeholderTextColor={colors.iconMuted}
                style={styles.input}
                value={pincode}
              />
            </View>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.sectionLabelDark}>PRICE DETAILS</Text>
          <View style={styles.priceRows}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({itemCount} items)</Text>
              <Text style={styles.priceValue}>{formatPrice(totalAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceFree}>Free</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.payNote}>
          <Ionicons color={colors.heading} name="shield-checkmark-outline" size={18} />
          <Text style={styles.payNoteText}>Secure payment via Razorpay — UPI, cards & wallets</Text>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable disabled={items.length === 0 || busy} onPress={proceed}>
          <LinearGradient
            colors={['#D7A797', colors.gold]}
            end={{ x: 0.3, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.ctaButton, (items.length === 0 || busy) && styles.ctaButtonDisabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.ctaText}>Proceed to Payment</Text>
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
});
