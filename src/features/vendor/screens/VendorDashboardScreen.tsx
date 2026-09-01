import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { VendorMetricCard } from '@/features/vendor/components/VendorMetricCard';
import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useVendorAnalytics, useVendorBookings, VendorBooking } from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList, VendorTabParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = BottomTabNavigationProp<VendorTabParamList>;

const QUICK_ACTIONS: Array<{
  key: 'Bookings' | 'Services' | 'RunPromo';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'Bookings', label: 'Bookings', icon: 'calendar-outline' },
  { key: 'Services', label: 'Manage Services', icon: 'cut-outline' },
  { key: 'RunPromo', label: 'Run Promo', icon: 'megaphone-outline' },
];

function firstServiceLine(booking: VendorBooking): string {
  const names = booking.service_names?.length
    ? booking.service_names
    : (booking.services ?? []).map((s) => s.name).filter((n): n is string => Boolean(n));
  if (!names.length) return 'Service';
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0];
}

function bookingTime(booking: VendorBooking): string {
  return booking.time_slots?.[0] ?? booking.booking_date;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function VendorDashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<VendorStackParamList>>();

  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: analytics, isLoading: analyticsLoading } = useVendorAnalytics();
  const { data: bookings, isLoading: bookingsLoading } = useVendorBookings({ limit: 10 });

  const recentBookings = [...(bookings ?? [])]
    .sort((a, b) => (b.created_at || b.booking_date).localeCompare(a.created_at || a.booking_date))
    .slice(0, 5);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  function goToQuickAction(key: 'Bookings' | 'Services' | 'RunPromo') {
    if (key === 'RunPromo') stackNavigation?.navigate('RunPromo');
    else navigation.navigate(key);
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>{salon?.business_name || 'Vendor Dashboard'}</Text>
          <Text style={styles.subtitle}>Track performance, services, and booking demand.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initials(salon?.business_name || 'V')}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>QUICK ACTIONS</Text>
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable key={action.key} style={styles.actionCard} onPress={() => goToQuickAction(action.key)}>
            <View style={styles.actionIconCircle}>
              <Ionicons name={action.icon} size={18} color={palette.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionHeading}>OVERALL PERFORMANCE</Text>
      {analyticsLoading && !analytics ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : (
        <View style={styles.metricGrid}>
          <VendorMetricCard icon="cash-outline" value={`₹${(analytics?.total_revenue ?? 0).toLocaleString()}`} label="Revenue" />
          <VendorMetricCard
            icon="calendar-outline"
            value={String(analytics?.total_bookings ?? 0)}
            label="Bookings"
            badge={analytics?.pending_bookings ? `+${analytics.pending_bookings} New` : undefined}
          />
          <VendorMetricCard icon="cut-outline" value={String(analytics?.active_services ?? 0)} label="Active Services" />
          <VendorMetricCard
            icon="star-outline"
            value={(analytics?.average_rating ?? 0).toFixed(1)}
            label="Avg Rating"
            badgeTone="neutral"
          />
        </View>
      )}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>RECENT BOOKINGS</Text>
        <Pressable onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      {bookingsLoading && !bookings ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : recentBookings.length === 0 ? (
        <SurfaceCard>
          <Text style={styles.emptyText}>No bookings yet</Text>
        </SurfaceCard>
      ) : (
        <View style={styles.list}>
          {recentBookings.map((booking, index) => {
            const displayStatus = getBookingDisplayStatus(booking.status, booking.booking_date);
            const featured = index === 0 && (displayStatus === 'pending' || displayStatus === 'in_progress');
            return (
              <Pressable
                key={booking.id}
                onPress={() => stackNavigation?.navigate('BookingDetails', { bookingId: booking.id })}
              >
                <View style={featured ? styles.featuredCard : styles.bookingCard}>
                  <View style={styles.bookingRow}>
                    <View style={styles.bookingInfo}>
                      <Text style={featured ? styles.featuredName : styles.bookingName}>
                        {booking.customer_name || 'Guest'}
                      </Text>
                      <Text style={featured ? styles.featuredMeta : styles.bookingMeta}>
                        {firstServiceLine(booking)} • {bookingTime(booking)}
                      </Text>
                    </View>
                    <StatusBadge status={displayStatus} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  wordmark: {
    color: palette.primary,
    fontSize: 22,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 4,
    maxWidth: 260,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: 'rgba(215,195,172,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarLabel: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },
  sectionHeading: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.7,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  loader: {
    marginVertical: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 16,
    flex: 1,
    gap: 10,
    paddingVertical: 20,
    shadowColor: '#543e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  actionIconCircle: {
    alignItems: 'center',
    backgroundColor: '#ffedd5',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  actionLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  sectionHeaderRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  viewAll: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  bookingCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#543e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  featuredCard: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    borderColor: palette.primary,
    borderWidth: 1,
    padding: 17,
    shadowColor: '#543e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  bookingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  bookingName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  bookingMeta: {
    color: palette.muted,
    fontSize: 12,
  },
  featuredName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  featuredMeta: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
  },
});
