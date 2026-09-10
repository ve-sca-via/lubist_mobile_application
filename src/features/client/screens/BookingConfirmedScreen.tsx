import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';

const colors = {
  bg: '#FFFAF5',
  gold: '#F89E07',
  text: '#534433',
  heading: '#221A11',
  divider: '#E7D7C9',
  white: '#FFFFFF',
  card: '#FFF6EC',
  green: '#166534',
};

type DetailRow = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'BookingConfirmed'>;

const priceText = (v?: number | null) => `₹${Math.round(Number(v) || 0)}`;

function formatDate(ymd?: string) {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function BookingConfirmedScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const booking = route.params?.booking;

  const services = booking?.services ?? [];

  const originalServicesTotal = services.reduce((total, service) => {
    const quantity = service.quantity || 1;
    const originalUnitPrice =
      service.original_price ?? service.unit_price ?? service.price ?? 0;
    return total + Number(originalUnitPrice) * quantity;
  }, 0);
  const servicePrice = Number(booking?.service_price ?? 0);
  const convenienceFee = Number(booking?.convenience_fee ?? 0);
  const bookingDiscountAmount = Math.max(0, originalServicesTotal - servicePrice);
  const couponServiceDiscount = Number(booking?.discount_amount ?? 0);
  const couponFeeDiscount = Number(booking?.convenience_fee_discount ?? 0);
  const couponSavings = couponServiceDiscount + couponFeeDiscount;
  const hasCoupon = Boolean(booking?.coupon_code) && couponSavings > 0;
  const saleDiscount = Math.max(0, bookingDiscountAmount - couponServiceDiscount);
  const convenienceFeeBeforeDiscount = convenienceFee + couponFeeDiscount;

  const details: DetailRow[] = [
    ...(booking?.booking_number
      ? [{ id: 'ref', icon: 'receipt-outline' as const, label: 'Booking Number', value: booking.booking_number }]
      : []),
    { id: 'date', icon: 'calendar-outline', label: 'Date', value: formatDate(booking?.booking_date) },
    {
      id: 'time',
      icon: 'time-outline',
      label: (booking?.time_slots?.length ?? 0) > 1 ? 'Time Slots' : 'Time',
      value: booking?.time_slots?.length ? booking.time_slots.join(', ') : '—',
    },
    { id: 'location', icon: 'location-outline', label: 'Salon', value: booking?.salon_name ?? 'Salon' },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.glow} />
          <Ionicons color={colors.gold} name="checkmark-circle" size={75} />
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>Your appointment is set. Get ready for your glow!</Text>
        </View>

        <View style={styles.details}>
          {details.map((row, index) => (
            <View key={row.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <Ionicons color={colors.gold} name={row.icon} size={20} style={styles.rowIcon} />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                  {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        {services.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>SERVICES BOOKED ({services.length})</Text>
            <View style={styles.card}>
              {services.map((service, index) => {
                const name = service.service_name ?? service.name ?? 'Service';
                const quantity = service.quantity || 1;
                const unitPrice = Number(service.unit_price ?? service.price ?? 0);
                const originalPrice = service.original_price != null ? Number(service.original_price) : null;
                return (
                  <View key={index} style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{name}</Text>
                      {quantity > 1 ? <Text style={styles.serviceMeta}>Quantity: {quantity}</Text> : null}
                      {service.duration_minutes ? (
                        <Text style={styles.serviceMeta}>{service.duration_minutes} mins</Text>
                      ) : null}
                    </View>
                    <View style={styles.serviceAmount}>
                      <Text style={styles.servicePrice}>{priceText(unitPrice * quantity)}</Text>
                      {originalPrice && originalPrice > unitPrice ? (
                        <Text style={styles.serviceStrike}>{priceText(originalPrice * quantity)}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>PAYMENT SUMMARY</Text>
          <View style={styles.card}>
            {hasCoupon ? (
              <View style={styles.couponBadge}>
                <Ionicons color={colors.green} name="pricetag" size={13} />
                <Text style={styles.couponText}>
                  {booking?.coupon_code} applied — you saved {priceText(couponSavings)}
                </Text>
              </View>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Original Service Total</Text>
              <Text style={styles.priceValue}>{priceText(originalServicesTotal)}</Text>
            </View>
            {saleDiscount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Sale Discount</Text>
                <Text style={styles.discountValue}>-{priceText(saleDiscount)}</Text>
              </View>
            ) : null}
            {couponServiceDiscount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Coupon{booking?.coupon_code ? ` (${booking.coupon_code})` : ''}</Text>
                <Text style={styles.discountValue}>-{priceText(couponServiceDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Total (Pay at Salon)</Text>
              <Text style={styles.priceValue}>{priceText(servicePrice)}</Text>
            </View>
            {couponFeeDiscount > 0 ? (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Booking Fee</Text>
                  <Text style={styles.priceValueStrike}>{priceText(convenienceFeeBeforeDiscount)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    Fee Discount{booking?.coupon_code ? ` (${booking.coupon_code})` : ''}
                  </Text>
                  <Text style={styles.discountValue}>-{priceText(couponFeeDiscount)}</Text>
                </View>
              </>
            ) : null}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Paid Online</Text>
              <Text style={styles.totalValue}>{priceText(convenienceFee)}</Text>
            </View>
            {servicePrice > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Pay at Salon</Text>
                <Text style={styles.payAtSalonValue}>{priceText(servicePrice)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable onPress={() => navigation.popToTop()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 17,
  },
  hero: {
    alignItems: 'center',
    marginTop: 48,
  },
  glow: {
    backgroundColor: colors.gold,
    borderRadius: 64,
    height: 126,
    opacity: 0.2,
    position: 'absolute',
    top: -24,
    width: 127,
  },
  title: {
    color: colors.gold,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
    marginTop: 18,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
    textAlign: 'center',
  },
  details: {
    gap: 15,
    marginTop: 40,
    paddingHorizontal: 3,
  },
  divider: {
    backgroundColor: colors.divider,
    height: 1,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  rowValue: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginTop: 4,
  },
  rowSub: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  block: {
    gap: 12,
    marginTop: 32,
  },
  sectionTitle: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 10,
    padding: 16,
  },
  serviceRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  serviceMeta: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  serviceAmount: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  serviceStrike: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  couponBadge: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  couponText: {
    color: colors.green,
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingRight: 12,
  },
  priceValue: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  priceValueStrike: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  discountValue: {
    color: colors.green,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  priceDivider: {
    backgroundColor: colors.divider,
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  totalValue: {
    color: colors.gold,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  payAtSalonValue: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  doneText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.14,
  },
});
