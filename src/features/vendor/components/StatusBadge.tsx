import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/theme/typography';

export type BookingDisplayStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export const STATUS_COLORS: Record<BookingDisplayStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Waiting', bg: '#f3f4f6', fg: '#4b5563' },
  confirmed: { label: 'Confirmed', bg: '#f8e5ca', fg: '#8c5a2b' },
  in_progress: { label: 'In Progress', bg: '#fef3c7', fg: '#b45309' },
  completed: { label: 'Completed', bg: '#e6f4ea', fg: '#1e8e3e' },
  cancelled: { label: 'Cancelled', bg: '#fce8e8', fg: '#c5221f' },
  no_show: { label: 'No Show', bg: '#f0e6e1', fg: '#8a5a3a' },
};

/**
 * A `confirmed` booking whose date is today displays as "In Progress" — this
 * is a display-only transform (the stored status stays `confirmed`), matching
 * the web app's `getDisplayStatusKey`.
 */
export function getBookingDisplayStatus(status: string, bookingDate?: string): BookingDisplayStatus {
  if (status === 'confirmed' && bookingDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (bookingDate === today) return 'in_progress';
  }
  return (STATUS_COLORS[status as BookingDisplayStatus] ? status : 'pending') as BookingDisplayStatus;
}

export function StatusBadge({ status }: { status: BookingDisplayStatus }) {
  const config = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
});
