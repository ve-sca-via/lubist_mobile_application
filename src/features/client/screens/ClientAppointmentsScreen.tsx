import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList, ClientTabParamList } from '@/navigation/navigation.types';
import { useMyBookings, useCancelBooking, type Booking } from '@/services/api/hooks/useBookingAPI';
import { useCreateReview } from '@/services/api/hooks/useCustomerAPI';
import { ReviewModal } from '@/features/client/components/ReviewModal';
import { resolveImageUrl } from '@/services/api/imageUrl';

const fallbackThumb = require('@/assets/home/top-lumina.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream2: '#FFF1E6',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  segmentBg: '#F0E0D1',
  green: '#2E7D32',
  greenBg: '#F0FDF4',
  greenBorder: '#BBF7D0',
  red: '#C0392B',
  redBg: '#FEF2F2',
  redBorder: '#FECACA',
  apptIcon: '#7B5548',
  apptIconBg: '#FDEDDF',
};

type Tab = 'upcoming' | 'past';
type BookingsNavigation = BottomTabNavigationProp<ClientTabParamList>;

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function formatDate(ymd?: string) {
  if (!ymd) return '';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function servicesLabel(b: Booking) {
  const list = b.services ?? [];
  const first = list[0]?.name ?? list[0]?.service_name;
  if (!first) return `${list.length || 0} service${list.length === 1 ? '' : 's'}`;
  return list.length > 1 ? `${first} +${list.length - 1} more` : first;
}

function timeSlotsLabel(b: Booking) {
  if (b.time_slots?.length) return b.time_slots.join(', ');
  return '';
}

const priceText = (v?: number | null) => `₹${Math.round(Number(v) || 0)}`;

function paymentBreakdown(b: Booking) {
  const services = b.services ?? [];
  const originalServicesTotal = services.reduce((total: number, service: any) => {
    const quantity = service.quantity || 1;
    const originalUnitPrice = service.original_price ?? service.unit_price ?? service.price ?? 0;
    return total + Number(originalUnitPrice) * quantity;
  }, 0);
  const servicePrice = Number(b.service_price ?? 0);
  const convenienceFee = Number(b.convenience_fee ?? 0);
  const bookingDiscountAmount = Math.max(0, originalServicesTotal - servicePrice);
  const couponServiceDiscount = Number(b.discount_amount ?? 0);
  const couponFeeDiscount = Number(b.convenience_fee_discount ?? 0);
  const couponSavings = couponServiceDiscount + couponFeeDiscount;
  const hasCoupon = Boolean(b.coupon_code) && couponSavings > 0;
  const saleDiscount = Math.max(0, bookingDiscountAmount - couponServiceDiscount);
  const convenienceFeeBeforeDiscount = convenienceFee + couponFeeDiscount;
  return {
    originalServicesTotal,
    servicePrice,
    convenienceFee,
    couponServiceDiscount,
    couponFeeDiscount,
    couponSavings,
    hasCoupon,
    saleDiscount,
    convenienceFeeBeforeDiscount,
  };
}

function statusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === 'cancelled') return { pill: styles.statusCancelled, text: styles.statusTextCancelled };
  if (s === 'completed') return { pill: styles.statusDone, text: styles.statusTextDone };
  return { pill: styles.statusConfirmed, text: styles.statusTextConfirmed };
}

export function ClientAppointmentsScreen() {
  const navigation = useNavigation<BookingsNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch } = useMyBookings();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview();

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const todayYMD = toYMD(new Date());
  const { upcoming, past } = useMemo(() => {
    const bookings = data?.data ?? [];
    const isDone = (b: Booking) =>
      b.status?.toLowerCase() === 'completed' ||
      b.status?.toLowerCase() === 'cancelled' ||
      (b.booking_date ?? '') < todayYMD;
    return {
      upcoming: bookings.filter((b) => !isDone(b)),
      past: bookings.filter(isDone),
    };
  }, [data, todayYMD]);

  const list = tab === 'upcoming' ? upcoming : past;

  const openSalon = (b: Booking) =>
    parent?.navigate('SalonDetails', {
      salon: { id: b.salon_id, name: b.salon_name ?? 'Salon', location: '', rating: 'New' },
    });

  const submitReview = ({ rating, comment }: { rating: number; comment: string }) => {
    if (!reviewBooking) return;
    createReview(
      { salon_id: reviewBooking.salon_id, booking_id: reviewBooking.id, rating, comment },
      {
        onSuccess: () => {
          setReviewBooking(null);
          Alert.alert('Thank you!', 'Your review has been submitted.');
        },
        onError: (err: any) =>
          Alert.alert('Could not submit', err.message || 'Please try again later.'),
      },
    );
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmCancel = (b: Booking) => {
    Alert.alert('Cancel booking', `Cancel your booking ${b.booking_number}? This can't be undone.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: () =>
          cancelBooking(b.id, {
            onError: (err: any) => Alert.alert('Error', err.message || 'Could not cancel booking.'),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      <View style={styles.segment}>
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.segmentButton, tab === t && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptySubtitle}>Couldn't load your bookings.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.apptIcon} name="calendar-outline" size={26} />
            </View>
            <Text style={styles.emptyTitle}>No bookings here yet</Text>
            <Text style={styles.emptySubtitle}>Your {tab} salon visits will appear here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((booking) => {
              const ss = statusStyle(booking.status);
              const logo = resolveImageUrl(booking.salon_logo_url);
              const canCancel = tab === 'upcoming';
              const isCompleted = booking.status?.toLowerCase() === 'completed';
              const services = booking.services ?? [];
              const isExpanded = expanded.has(booking.id);
              const pay = paymentBreakdown(booking);
              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Image source={logo ? { uri: logo } : fallbackThumb} style={styles.thumb} />
                    <View style={styles.cardInfo}>
                      <Text numberOfLines={1} style={styles.service}>
                        {servicesLabel(booking)}
                      </Text>
                      <Text style={styles.salon}>{booking.salon_name ?? 'Salon'}</Text>
                      {booking.booking_number ? (
                        <Text style={styles.bookingNumber}>Booking #{booking.booking_number}</Text>
                      ) : null}
                      <View style={styles.metaRow}>
                        <Ionicons color={colors.gold} name="time-outline" size={13} />
                        <Text style={styles.metaText}>
                          {formatDate(booking.booking_date)}
                          {timeSlotsLabel(booking) ? `, ${timeSlotsLabel(booking)}` : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusPill, ss.pill]}>
                      <Text style={[styles.statusText, ss.text]}>{booking.status}</Text>
                    </View>
                  </View>

                  {services.length > 0 ? (
                    <Pressable onPress={() => toggleExpanded(booking.id)} style={styles.detailsToggle}>
                      <Text style={styles.detailsToggleText}>
                        {isExpanded ? 'Hide details' : `Services Booked (${services.length})`}
                      </Text>
                      <Ionicons
                        color={colors.gold}
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                      />
                    </Pressable>
                  ) : null}

                  {isExpanded ? (
                    <View style={styles.serviceList}>
                      {services.map((service: any, idx: number) => {
                        const name = service.service_name ?? service.name ?? 'Service';
                        const quantity = service.quantity || 1;
                        const unitPrice = Number(service.unit_price ?? service.price ?? 0);
                        const originalPrice =
                          service.original_price != null ? Number(service.original_price) : null;
                        return (
                          <View key={idx} style={styles.serviceRow}>
                            <View style={styles.serviceInfo}>
                              <Text style={styles.serviceName}>{name}</Text>
                              {quantity > 1 ? (
                                <Text style={styles.serviceMeta}>Quantity: {quantity}</Text>
                              ) : null}
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
                  ) : null}

                  <View style={styles.paymentCard}>
                    {pay.hasCoupon ? (
                      <View style={styles.couponBadge}>
                        <Ionicons color={colors.green} name="pricetag" size={12} />
                        <Text style={styles.couponBadgeText}>
                          {booking.coupon_code} applied — saved {priceText(pay.couponSavings)}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Original Service Total</Text>
                      <Text style={styles.priceValue}>{priceText(pay.originalServicesTotal)}</Text>
                    </View>
                    {pay.saleDiscount > 0 ? (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Sale Discount</Text>
                        <Text style={styles.discountValue}>-{priceText(pay.saleDiscount)}</Text>
                      </View>
                    ) : null}
                    {pay.couponServiceDiscount > 0 ? (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                          Coupon{booking.coupon_code ? ` (${booking.coupon_code})` : ''}
                        </Text>
                        <Text style={styles.discountValue}>-{priceText(pay.couponServiceDiscount)}</Text>
                      </View>
                    ) : null}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Service Total (Pay at Salon)</Text>
                      <Text style={styles.priceValue}>{priceText(pay.servicePrice)}</Text>
                    </View>
                    {pay.couponFeeDiscount > 0 ? (
                      <>
                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Booking Fee</Text>
                          <Text style={styles.priceValueStrike}>{priceText(pay.convenienceFeeBeforeDiscount)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>
                            Fee Discount{booking.coupon_code ? ` (${booking.coupon_code})` : ''}
                          </Text>
                          <Text style={styles.discountValue}>-{priceText(pay.couponFeeDiscount)}</Text>
                        </View>
                      </>
                    ) : null}
                    <View style={styles.paymentDivider} />
                    <View style={styles.priceRow}>
                      <Text style={styles.payLabel}>Paid Online</Text>
                      <Text style={styles.payAmount}>{priceText(pay.convenienceFee)}</Text>
                    </View>
                    {pay.servicePrice > 0 ? (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Pay at Salon</Text>
                        <Text style={styles.payAtSalonValue}>{priceText(pay.servicePrice)}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.actions}>
                    {canCancel ? (
                      <Pressable
                        disabled={isCancelling}
                        onPress={() => confirmCancel(booking)}
                        style={[styles.actionBtn, styles.actionOutline]}
                      >
                        <Text style={styles.actionOutlineText}>Cancel</Text>
                      </Pressable>
                    ) : isCompleted ? (
                      <Pressable
                        onPress={() => setReviewBooking(booking)}
                        style={[styles.actionBtn, styles.actionOutline]}
                      >
                        <Ionicons color={colors.text} name="star-outline" size={15} />
                        <Text style={styles.actionOutlineText}>Write Review</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => openSalon(booking)}
                      style={[styles.actionBtn, styles.actionPrimary]}
                    >
                      <Text style={styles.actionPrimaryText}>
                        {canCancel ? 'View Salon' : 'Book Again'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewBooking != null}
        salonName={reviewBooking?.salon_name ?? 'Salon'}
        submitting={isSubmittingReview}
        onSubmit={submitReview}
        onDismiss={() => setReviewBooking(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    backgroundColor: colors.white,
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 22, letterSpacing: -0.2 },
  segment: { backgroundColor: colors.segmentBg, borderRadius: 14, flexDirection: 'row', margin: 16, padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: 10, flex: 1, justifyContent: 'center', paddingVertical: 10 },
  segmentActive: { backgroundColor: colors.gold },
  segmentText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  segmentTextActive: { color: colors.white },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 4 },
  list: { gap: 16 },
  card: {
    backgroundColor: colors.cardCream2,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumb: { backgroundColor: colors.tan, borderRadius: 12, height: 64, width: 64 },
  cardInfo: { flex: 1, gap: 3 },
  service: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 16 },
  salon: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 13 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 2 },
  metaText: { color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 13 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 9999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusConfirmed: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
  statusDone: { backgroundColor: colors.tan, borderColor: colors.border },
  statusCancelled: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, textTransform: 'capitalize' },
  statusTextConfirmed: { color: colors.green },
  statusTextDone: { color: colors.muted },
  statusTextCancelled: { color: colors.red },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 14 },
  bookingNumber: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 1 },
  detailsToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  detailsToggleText: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  serviceList: { gap: 8, marginTop: 6 },
  serviceRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.bg,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 10,
  },
  serviceInfo: { flex: 1, gap: 2 },
  serviceName: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  serviceMeta: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 11 },
  serviceAmount: { alignItems: 'flex-end' },
  servicePrice: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  serviceStrike: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  paymentCard: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    gap: 6,
    marginTop: 12,
    padding: 12,
  },
  couponBadge: {
    alignItems: 'center',
    backgroundColor: colors.greenBg,
    borderColor: colors.greenBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  couponBadgeText: { color: colors.green, flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11 },
  priceRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { color: colors.text, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, paddingRight: 8 },
  priceValue: { color: colors.heading, fontFamily: 'Inter_500Medium', fontSize: 12 },
  priceValueStrike: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountValue: { color: colors.green, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  paymentDivider: { backgroundColor: colors.border, height: 1, marginVertical: 4 },
  payLabel: { color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 11 },
  payAmount: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 16 },
  payAtSalonValue: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { alignItems: 'center', borderRadius: 12, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 11 },
  actionOutline: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 },
  actionOutlineText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  actionPrimary: { backgroundColor: colors.gold },
  actionPrimaryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  empty: { alignItems: 'center', gap: 14, paddingTop: 64 },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.apptIconBg,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 2,
    width: 64,
  },
  emptyTitle: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 18 },
  emptySubtitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
