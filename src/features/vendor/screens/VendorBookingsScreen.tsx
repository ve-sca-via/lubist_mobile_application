import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { STATUS_COLORS, StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useVendorBookings, VendorBooking } from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

type QuickFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';
type SecondaryFilter = 'pending' | 'confirmed' | 'today' | 'past' | null;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function serviceLine(booking: VendorBooking): string {
  const names = booking.service_names?.length
    ? booking.service_names
    : (booking.services ?? []).map((s) => s.name).filter((n): n is string => Boolean(n));
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0] || 'Service';
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Splits a display time like "10:00 AM" into ["10:00", "AM"]; falls back to [raw, ''] otherwise. */
function splitTime(raw?: string): [string, string] {
  if (!raw) return ['—', ''];
  const match = raw.trim().match(/^(\d{1,2}:\d{2})\s*(AM|PM)?$/i);
  if (!match) return [raw, ''];
  return [match[1], (match[2] ?? '').toUpperCase()];
}

export function VendorBookingsScreen() {
  const navigation = useNavigation<Navigation>();
  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: bookings } = useVendorBookings();

  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [secondaryFilter, setSecondaryFilter] = useState<SecondaryFilter>(null);

  const stats = useMemo(() => {
    const list = bookings ?? [];
    const count = (s: string) => list.filter((b) => b.status === s).length;
    return {
      total: list.length,
      confirmed: count('confirmed'),
      completed: count('completed'),
      cancelled: count('cancelled'),
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const today = todayIso();
    return (bookings ?? []).filter((b) => {
      if (quickFilter === 'upcoming' && b.booking_date < today) return false;
      if (quickFilter === 'completed' && b.status !== 'completed') return false;
      if (quickFilter === 'cancelled' && b.status !== 'cancelled') return false;
      if (secondaryFilter === 'pending' && b.status !== 'pending') return false;
      if (secondaryFilter === 'confirmed' && b.status !== 'confirmed') return false;
      if (secondaryFilter === 'today' && b.booking_date !== today) return false;
      if (secondaryFilter === 'past' && b.booking_date >= today) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [b.customer_name, b.booking_number, b.customer_phone, b.customer_email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, quickFilter, secondaryFilter, search]);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>Bookings Management</Text>
      <Text style={styles.subtitle}>View and manage all salon bookings</Text>

      <View style={styles.statsGrid}>
        <StatTile label="Total" value={stats.total} color={palette.primary} />
        <StatTile label="Confirmed" value={stats.confirmed} color={STATUS_COLORS.confirmed.fg} />
        <StatTile label="Completed" value={stats.completed} color={STATUS_COLORS.completed.fg} />
        <StatTile label="Cancelled" value={stats.cancelled} color={STATUS_COLORS.cancelled.fg} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={palette.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search bookings..."
          placeholderTextColor={palette.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {(['all', 'upcoming', 'completed', 'cancelled'] as QuickFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.filterChip, quickFilter === filter && styles.filterChipActive]}
            onPress={() => setQuickFilter(filter)}
          >
            <Text style={[styles.filterChipLabel, quickFilter === filter && styles.filterChipLabelActive]}>
              {filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.secondaryRow}>
        {(['pending', 'confirmed', 'today', 'past'] as Exclude<SecondaryFilter, null>[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.secondaryChip, secondaryFilter === filter && styles.secondaryChipActive]}
            onPress={() => setSecondaryFilter(secondaryFilter === filter ? null : filter)}
          >
            <Text style={[styles.secondaryChipLabel, secondaryFilter === filter && styles.secondaryChipLabelActive]}>
              {filter[0].toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No bookings match these filters</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filtered.map((booking) => {
            const displayStatus = getBookingDisplayStatus(booking.status, booking.booking_date);
            const accent = STATUS_COLORS[displayStatus].fg;
            const cancelled = booking.status === 'cancelled';
            const [time, ampm] = splitTime(booking.time_slots?.[0]);
            const name = booking.customer_name || 'Guest';

            return (
              <Pressable
                key={booking.id}
                onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
              >
                <View style={[styles.card, { borderLeftColor: accent }, cancelled && styles.cardMuted]}>
                  <View style={[styles.timeBlock, { backgroundColor: `${accent}1a` }]}>
                    <Text style={[styles.timeValue, { color: accent }, cancelled && styles.timeValueStrike]}>
                      {time}
                    </Text>
                    {ampm ? <Text style={styles.timeSuffix}>{ampm}</Text> : null}
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>{initials(name)}</Text>
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{name}</Text>
                        <Text style={styles.cardMeta}>
                          {serviceLine(booking)} • {booking.duration_minutes} min
                        </Text>
                      </View>
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

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#221a11',
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: '#534433',
    fontSize: 16,
    marginBottom: 20,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statTile: {
    backgroundColor: '#fff',
    borderColor: '#fcebdc',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '46%',
    flexGrow: 1,
    padding: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statLabel: {
    color: '#534433',
    fontSize: 14,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: typography.weight.semibold,
  },
  searchWrap: {
    justifyContent: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    left: 12,
    position: 'absolute',
    zIndex: 1,
  },
  search: {
    backgroundColor: '#fff',
    borderColor: '#d9c3ad',
    borderRadius: 12,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    paddingLeft: 41,
    paddingRight: 14,
    paddingVertical: 14,
  },
  filterRow: {
    flexGrow: 0,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#eae0d3',
    borderRadius: 12,
    marginRight: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
  },
  filterChipLabel: {
    color: '#534433',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
  filterChipLabelActive: {
    color: '#fff',
  },
  secondaryRow: {
    flexGrow: 0,
    marginBottom: 20,
  },
  secondaryChip: {
    backgroundColor: 'transparent',
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  secondaryChipActive: {
    backgroundColor: palette.surface,
    borderColor: palette.primary,
  },
  secondaryChipLabel: {
    color: palette.muted,
    fontSize: 12,
  },
  secondaryChipLabelActive: {
    color: palette.primary,
    fontWeight: typography.weight.semibold,
  },
  emptyCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fffdfc',
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#543e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardMuted: {
    opacity: 0.75,
  },
  timeBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: 88,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: typography.weight.semibold,
  },
  timeValueStrike: {
    textDecorationLine: 'line-through',
  },
  timeSuffix: {
    color: '#534433',
    fontSize: 14,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#ede1d2',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarLabel: {
    color: '#6b6357',
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    color: '#221a11',
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  cardMeta: {
    color: '#534433',
    fontSize: 13,
  },
});
