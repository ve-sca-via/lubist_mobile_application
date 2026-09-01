import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { STATUS_COLORS, StatusBadge, getBookingDisplayStatus } from '@/features/vendor/components/StatusBadge';
import { useUpdateVendorBookingStatus, useVendorBookings } from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;
type Route = RouteProp<VendorStackParamList, 'BookingDetails'>;

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function VendorBookingDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { data: bookings, isLoading } = useVendorBookings();
  const updateStatus = useUpdateVendorBookingStatus();

  const booking = useMemo(
    () => bookings?.find((b) => b.id === route.params.bookingId),
    [bookings, route.params.bookingId],
  );

  if (isLoading && !bookings) {
    return (
      <View style={styles.screen}>
        <Header onClose={() => navigation.goBack()} />
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.screen}>
        <Header onClose={() => navigation.goBack()} />
        <View style={styles.body}>
          <Text style={styles.emptyText}>Booking not found.</Text>
        </View>
      </View>
    );
  }

  const displayStatus = getBookingDisplayStatus(booking.status, booking.booking_date);
  const hasCoupon = !!booking.coupon_code && (booking.discount_amount ?? 0) + (booking.convenience_fee_discount ?? 0) > 0;
  const subtotal = booking.subtotal_service_price ?? booking.service_price + (booking.discount_amount ?? 0);
  const totalDue = booking.total_amount ?? booking.service_price + booking.convenience_fee;
  const staffAssigned = booking.staff_name || booking.assigned_staff || booking.stylist_name || 'Not assigned';

  async function handleStatusUpdate(status: string) {
    try {
      await updateStatus.mutateAsync({ bookingId: booking!.id, status });
      Alert.alert('Success', `Booking ${status} successfully!`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update booking status');
    }
  }

  return (
    <View style={styles.screen}>
      <Header onClose={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.idCard}>
          <View>
            <Text style={styles.idLabel}>Booking ID</Text>
            <Text style={styles.idValue}>{booking.booking_number}</Text>
          </View>
          <StatusBadge status={displayStatus} />
        </View>

        <SectionHeading>Customer Information</SectionHeading>
        <View style={styles.customerCard}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={18} color="#8a6a4a" />
            </View>
            <View>
              <Text style={styles.customerName}>{booking.customer_name || 'Guest'}</Text>
              {booking.customer_email ? <Text style={styles.customerMeta}>{booking.customer_email}</Text> : null}
            </View>
          </View>
          {booking.customer_phone ? (
            <Pressable style={styles.callButton} onPress={() => Linking.openURL(`tel:${booking.customer_phone}`)}>
              <Ionicons name="call-outline" size={14} color="#fff" />
              <Text style={styles.callButtonLabel}>Call Customer</Text>
            </Pressable>
          ) : null}
        </View>

        <SectionHeading muted>Appointment Details</SectionHeading>
        <View style={styles.detailsCard}>
          <DetailRow icon="calendar-outline" label="Date" value={formatDate(booking.booking_date)} />
          <View style={styles.divider} />
          <DetailRow
            icon="time-outline"
            label="Time"
            value={`${(booking.time_slots ?? []).join(', ') || '—'} (${booking.duration_minutes} min)`}
          />
          <View style={styles.divider} />
          <DetailRow icon="person-circle-outline" label="Staff Assigned" value={staffAssigned} />
        </View>

        <SectionHeading muted>Services Requested</SectionHeading>
        <View style={styles.servicesCard}>
          {(booking.services ?? []).length ? (
            (booking.services ?? []).map((service, idx) => (
              <View key={idx} style={styles.serviceRow}>
                <View>
                  <Text style={styles.serviceName}>
                    {service.name}
                    {service.quantity && service.quantity > 1 ? ` × ${service.quantity}` : ''}
                  </Text>
                  {service.duration_minutes ? (
                    <Text style={styles.serviceMeta}>{service.duration_minutes} mins</Text>
                  ) : null}
                </View>
                {service.unit_price ? (
                  <Text style={styles.servicePrice}>
                    ₹{(service.unit_price * (service.quantity ?? 1)).toLocaleString()}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.serviceMeta}>{booking.service_names_str || 'No services listed'}</Text>
          )}
        </View>

        <SectionHeading color="#623c00">Payment Summary</SectionHeading>
        <View style={styles.paymentCard}>
          {hasCoupon ? (
            <>
              <SummaryRow label="Service Total" value={`₹${subtotal.toLocaleString()}`} strike />
              <SummaryRow
                label={`Coupon Discount (${booking.coupon_code})`}
                value={`-₹${(booking.discount_amount ?? 0).toLocaleString()}`}
                accent="#1e8e3e"
              />
            </>
          ) : null}
          <SummaryRow label={hasCoupon ? 'Service Subtotal' : 'Subtotal'} value={`₹${booking.service_price.toLocaleString()}`} />
          <SummaryRow
            label={booking.convenience_fee ? 'Convenience Fee' : 'Tax / Fees'}
            value={`₹${booking.convenience_fee.toLocaleString()}`}
          />
          <View style={styles.paymentDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>₹{totalDue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.collectionCard}>
          <View style={styles.collectionAccent} />
          <View style={styles.collectionBody}>
            <Text style={styles.collectionHeading}>Collection Details</Text>
            <View style={styles.collectionRow}>
              <Text style={styles.collectionLabel}>To Collect at Salon:</Text>
              <Text style={styles.collectionValue}>₹{booking.service_price.toLocaleString()}</Text>
            </View>
            <View style={styles.calloutBox}>
              <Ionicons name="information-circle-outline" size={18} color="#8a6a4a" />
              <Text style={styles.calloutText}>
                Collect this amount from the customer after completing the service.
              </Text>
            </View>
          </View>
        </View>

        {booking.notes ? (
          <>
            <SectionHeading muted>Notes</SectionHeading>
            <View style={styles.detailsCard}>
              <Text style={styles.customerMeta}>{booking.notes}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {booking.status === 'pending' ? (
          <>
            <Pressable
              style={styles.primaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('confirmed')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonLabel}>Confirm Booking</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('cancelled')}
            >
              <Text style={styles.secondaryButtonLabel}>Cancel Booking</Text>
            </Pressable>
          </>
        ) : booking.status === 'confirmed' ? (
          <>
            <Pressable
              style={styles.primaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('completed')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonLabel}>Mark as Completed</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              disabled={updateStatus.isPending}
              onPress={() => handleStatusUpdate('cancelled')}
            >
              <Text style={styles.secondaryButtonLabel}>Cancel Booking</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.readOnlyFooter}>
            <Text style={styles.hint}>This booking is marked as {booking.status}.</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>Back to bookings</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={22} color="#241b14" />
      </Pressable>
      <Text style={styles.headerTitle}>Booking Details</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

function SectionHeading({
  children,
  muted,
  color,
}: {
  children: React.ReactNode;
  muted?: boolean;
  color?: string;
}) {
  return (
    <Text style={[styles.sectionHeading, muted && styles.sectionHeadingMuted, color ? { color } : null]}>
      {String(children).toUpperCase()}
    </Text>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color="#8a6a4a" style={styles.detailIcon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  strike,
  accent,
}: {
  label: string;
  value: string;
  strike?: boolean;
  accent?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strike && styles.summaryValueStrike, accent ? { color: accent } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 78,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#f89e07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  headerTitle: {
    color: '#241b14',
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },
  loader: {
    marginTop: 40,
  },
  body: {
    gap: 12,
    padding: 20,
    paddingBottom: 140,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
  },
  idCard: {
    alignItems: 'center',
    backgroundColor: '#fff1e6',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 16,
  },
  idLabel: {
    color: '#534433',
    fontSize: 13,
  },
  idValue: {
    color: '#221a11',
    fontSize: 16,
    fontWeight: typography.weight.semibold,
    marginTop: 4,
  },
  sectionHeading: {
    color: '#221a11',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.1,
    marginBottom: 4,
    marginTop: 4,
  },
  sectionHeadingMuted: {
    color: '#534433',
  },
  customerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#f0e0d1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 17,
    shadowColor: '#2c2c2c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  customerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 12,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: '#f6e5d7',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  customerName: {
    color: '#221a11',
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
  customerMeta: {
    color: '#534433',
    fontSize: 13,
    marginTop: 2,
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: '#1db954',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  callButtonLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderColor: '#f0e0d1',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    marginBottom: 8,
    padding: 17,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailLabel: {
    color: '#534433',
    fontSize: 13,
  },
  detailValue: {
    color: '#221a11',
    fontSize: 15,
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#f0e0d1',
    height: 1,
  },
  servicesCard: {
    backgroundColor: '#fff',
    borderColor: '#f0e0d1',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
    padding: 17,
  },
  serviceRow: {
    alignItems: 'center',
    backgroundColor: '#fff8f4',
    borderColor: '#f0e0d1',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13,
  },
  serviceName: {
    color: '#221a11',
    fontSize: 15,
    fontWeight: typography.weight.medium,
  },
  serviceMeta: {
    color: '#534433',
    fontSize: 13,
    marginTop: 2,
  },
  servicePrice: {
    color: '#221a11',
    fontSize: 15,
    fontWeight: typography.weight.medium,
  },
  paymentCard: {
    backgroundColor: 'rgba(255,221,185,0.2)',
    borderColor: 'rgba(248,158,7,0.3)',
    borderRadius: 8,
    borderWidth: 2,
    gap: 10,
    marginBottom: 8,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#534433',
    fontSize: 15,
  },
  summaryValue: {
    color: '#221a11',
    fontSize: 15,
  },
  summaryValueStrike: {
    color: '#9ca3af',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  paymentDivider: {
    backgroundColor: 'rgba(248,158,7,0.2)',
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    color: '#623c00',
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  totalValue: {
    color: palette.primary,
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  collectionCard: {
    backgroundColor: '#fff',
    borderColor: '#f6a400',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#f6a400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  collectionAccent: {
    backgroundColor: '#1db954',
    height: 4,
  },
  collectionBody: {
    gap: 14,
    padding: 16,
  },
  collectionHeading: {
    color: '#221a11',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.1,
  },
  collectionRow: {
    borderBottomColor: '#f0e0d1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  collectionLabel: {
    color: '#221a11',
    fontSize: 15,
  },
  collectionValue: {
    color: '#1db954',
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  calloutBox: {
    backgroundColor: '#fff1e6',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  calloutText: {
    color: '#534433',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    backgroundColor: palette.background,
    gap: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: typography.weight.semibold,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  readOnlyFooter: {
    alignItems: 'center',
    gap: 6,
  },
  hint: {
    color: palette.muted,
    fontSize: 13,
  },
  backLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
});
