import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurfaceCard } from '@/shared/components/SurfaceCard';
import { STATUS_COLORS, StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { VendorMetricCard } from '@/features/vendor/components/VendorMetricCard';
import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useVendorAnalytics, useVendorBookings, VendorBooking } from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList, VendorTabParamList } from '@/navigation/navigation.types';

type Navigation = BottomTabNavigationProp<VendorTabParamList>;

// Figma "Vendor portal" file, node 1:456 (Dashboard). Local palette matches
// that frame's tokens exactly rather than the shared @/theme/palette, same
// convention the client screens use (see ClientHomeScreen).
const colors = {
  contentBg: '#FFF8F4',
  appBarBg: 'rgba(255,255,255,0.9)',
  heading: '#2D2D2D',
  gold: '#F89E07',
  goldDeep: '#DB8B06',
  muted: '#6B6B6B',
  linkBrown: '#8C5A2B',
  cardCream: '#FFFDFC',
  cardWhite: '#FFFFFF',
  cardBorder: 'rgba(255,247,237,0.5)',
  iconBadgeBg: '#FFEDD5',
  iconBrown: '#8C5A2B',
  iconBrownDark: '#865300',
  avatarBg: '#F3F4F6',
  avatarBorder: 'rgba(215,195,172,0.3)',
  featuredBadgeBg: '#FEF9C3',
  featuredBadgeFg: '#854D0E',
  heroFallbackStart: '#F0E0D1',
  heroFallbackEnd: '#F8E5CA',
};

type QuickActionKey = 'NewBooking' | 'StaffSchedule' | 'Services' | 'RunPromo';

const QUICK_ACTIONS: Array<{
  key: QuickActionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  outlined?: boolean;
}> = [
  { key: 'NewBooking', label: 'New Booking', icon: 'add-circle-outline', iconColor: colors.iconBrown },
  { key: 'StaffSchedule', label: 'Staff\nSchedule', icon: 'people-outline', iconColor: colors.iconBrown },
  { key: 'Services', label: 'Services', icon: 'cut-outline', iconColor: colors.iconBrown },
  { key: 'RunPromo', label: 'Run Promo', icon: 'megaphone-outline', iconColor: colors.iconBrownDark, outlined: true },
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

  // "New Booking" and "Staff Schedule" don't have dedicated screens yet (no
  // staff-management feature exists) - point them at the closest real screen /
  // a friendly notice instead of a dead end, while keeping the Figma layout.
  function goToQuickAction(key: QuickActionKey) {
    if (key === 'RunPromo') stackNavigation?.navigate('RunPromo');
    else if (key === 'Services') navigation.navigate('Services');
    else if (key === 'NewBooking') navigation.navigate('Bookings');
    else Alert.alert('Coming soon', 'Staff scheduling is on the roadmap.');
  }

  const heroImage = salon?.cover_images?.[0] ?? salon?.logo_url ?? null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.appBar}>
        <View style={styles.appBarSpacer} />
        <Text numberOfLines={1} style={styles.wordmark}>
          {salon?.business_name || 'Vendor Dashboard'}
        </Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initials(salon?.business_name || 'V')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {heroImage ? (
          <Image resizeMode="cover" source={{ uri: heroImage }} style={styles.heroBanner} />
        ) : (
          <LinearGradient
            colors={[colors.heroFallbackStart, colors.heroFallbackEnd]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroBanner}
          />
        )}

        <View style={styles.content}>
          <View>
            <Text style={styles.sectionHeading}>QUICK ACTIONS</Text>
            <ScrollView
              contentContainerStyle={styles.actionsRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.key}
                  onPress={() => goToQuickAction(action.key)}
                  style={[styles.actionCard, action.outlined && styles.actionCardOutlined]}
                >
                  <View style={styles.actionIconCircle}>
                    <Ionicons color={action.iconColor} name={action.icon} size={18} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text style={styles.sectionHeading}>OVERALL PERFORMANCE</Text>
            {analyticsLoading && !analytics ? (
              <ActivityIndicator color={colors.gold} style={styles.loader} />
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
                  badge={analytics && !analytics.average_rating ? 'New' : undefined}
                  icon="star-outline"
                  iconColor={colors.iconBrown}
                  value={(analytics?.average_rating ?? 0).toFixed(1)}
                  label="Avg Rating"
                />
              </View>
            )}
          </View>

          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>RECENT BOOKINGS</Text>
              <Pressable onPress={() => navigation.navigate('Bookings')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            {bookingsLoading && !bookings ? (
              <ActivityIndicator color={colors.gold} style={styles.loader} />
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
                      {featured ? (
                        <LinearGradient
                          colors={[colors.gold, colors.goldDeep]}
                          end={{ x: 1, y: 1 }}
                          start={{ x: 0, y: 0 }}
                          style={styles.featuredCard}
                        >
                          <View style={styles.bookingRow}>
                            <View style={styles.featuredLeft}>
                              <View style={styles.featuredAvatar}>
                                <Text style={styles.featuredAvatarLabel}>{initials(booking.customer_name || 'G')}</Text>
                              </View>
                              <View style={styles.featuredTextCol}>
                                <Text style={styles.featuredName}>{booking.customer_name || 'Guest'}</Text>
                                <Text style={styles.featuredMeta}>
                                  {firstServiceLine(booking)} • {bookingTime(booking)}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.featuredBadge}>
                              <Text style={styles.featuredBadgeText}>{STATUS_COLORS[displayStatus].label}</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      ) : (
                        <View style={styles.bookingCard}>
                          <View style={styles.bookingRow}>
                            <View style={styles.bookingInfo}>
                              <Text style={styles.bookingName}>{booking.customer_name || 'Guest'}</Text>
                              <Text style={styles.bookingMeta}>
                                {firstServiceLine(booking)} • {bookingTime(booking)}
                              </Text>
                            </View>
                            <StatusBadge status={displayStatus} />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.appBarBg,
    flex: 1,
  },
  appBar: {
    alignItems: 'center',
    backgroundColor: colors.appBarBg,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    zIndex: 10,
  },
  appBarSpacer: {
    width: 40,
  },
  wordmark: {
    color: colors.gold,
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    letterSpacing: -1,
    textAlign: 'center',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.avatarBg,
    borderColor: colors.avatarBorder,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarLabel: {
    color: colors.gold,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  scroll: {
    backgroundColor: colors.contentBg,
  },
  heroBanner: {
    height: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    width: '100%',
  },
  content: {
    backgroundColor: colors.contentBg,
    gap: 32,
    paddingBottom: 140,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeading: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.7,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  loader: {
    marginVertical: 24,
  },
  actionsRow: {
    gap: 16,
    paddingRight: 20,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.cardCream,
    borderRadius: 16,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    shadowColor: '#543E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: 112,
  },
  actionCardOutlined: {
    backgroundColor: colors.cardWhite,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.iconBadgeBg,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  actionLabel: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionHeaderRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  viewAll: {
    color: colors.linkBrown,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: colors.cardCream,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#543E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  bookingMeta: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  featuredCard: {
    borderColor: colors.gold,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#543E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  featuredLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  featuredAvatar: {
    alignItems: 'center',
    backgroundColor: colors.avatarBg,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  featuredAvatarLabel: {
    color: colors.iconBrown,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  featuredTextCol: {
    flex: 1,
    gap: 2,
  },
  featuredName: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  featuredMeta: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    opacity: 0.9,
  },
  featuredBadge: {
    backgroundColor: colors.featuredBadgeBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    color: colors.featuredBadgeFg,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
});
