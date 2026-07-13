import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useCart, useAvailableSlots } from '@/services/api/hooks/useBookingAPI';

const colors = {
  bg: '#FFFAF5',
  header: '#FCFCFB',
  white: '#FFFFFF',
  ink: '#1C1B1B',
  title: '#221A11',
  iconDark: '#0B0C0C',
  muted: '#747878',
  muted2: '#444748',
  border: '#EAEAEA',
  circleBtn: '#F7F3F2',
  infoBg: '#F1EDEC',
  gold: '#F89E07',
  noteBorder: 'rgba(234, 234, 234, 0.5)',
  ctaShell: 'rgba(252, 252, 251, 0.9)',
  disabled: '#C7C7C7',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'SelectTime'>;

const MAX_SLOTS = 3;
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function buildDates(count = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export function SelectTimeScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { salonId, salonName } = route.params;

  const dates = useMemo(() => buildDates(14), []);
  const [selectedDate, setSelectedDate] = useState(() => toYMD(dates[0]));
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const cart = useCart();
  const serviceIds = useMemo(
    () => (cart.data?.items ?? []).map((i) => i.service_id),
    [cart.data],
  );
  const slotsQuery = useAvailableSlots(salonId, selectedDate, serviceIds);
  const slots = slotsQuery.data?.available_slots ?? [];

  const selectDate = (ymd: string) => {
    setSelectedDate(ymd);
    setSelectedTimes([]);
  };

  const toggleTime = (slot: string) => {
    setSelectedTimes((prev) => {
      if (prev.includes(slot)) return prev.filter((t) => t !== slot);
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, slot];
    });
  };

  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const fullDateLabel = selectedDateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
  const isToday = selectedDate === toYMD(dates[0]);

  const items = cart.data?.items ?? [];
  const canContinue = selectedTimes.length > 0 && items.length > 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons color={colors.iconDark} name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {salonName ?? 'Select time'}
          </Text>
          <Text style={styles.headerSubtitle}>Pick a date & time</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.dateDropdown}>
            <View style={styles.dateDropdownLeft}>
              <Text style={styles.dateToday}>{isToday ? 'Today' : 'Selected'}</Text>
              <Text style={styles.datePipe}>|</Text>
              <Text style={styles.dateFull}>{fullDateLabel}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.dateRow} horizontal showsHorizontalScrollIndicator={false}>
            {dates.map((d, index) => {
              const ymd = toYMD(d);
              const isActive = ymd === selectedDate;
              const wd = index === 0 ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              return (
                <Pressable
                  key={ymd}
                  onPress={() => selectDate(ymd)}
                  style={[styles.datePill, isActive ? styles.datePillActive : styles.datePillIdle]}
                >
                  <Text style={[styles.datePillText, isActive && styles.datePillTextActive]}>
                    {wd} {d.getDate()} {mon}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.timeSection}>
            <View style={styles.infoBanner}>
              <Ionicons color={colors.muted} name="information-circle-outline" size={14} />
              <Text style={styles.infoText}>You can select up to 3 time slots</Text>
            </View>

            {slotsQuery.isLoading ? (
              <ActivityIndicator color={colors.gold} style={{ paddingVertical: 24 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.emptySlots}>No slots available for this day. Try another date.</Text>
            ) : (
              <View style={styles.timeGrid}>
                {slots.map((slot) => {
                  const isSelected = selectedTimes.includes(slot);
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => toggleTime(slot)}
                      style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                    >
                      <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{slot}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('Checkout', {
              salonId,
              salonName,
              bookingDate: selectedDate,
              timeSlots: selectedTimes,
            })
          }
          style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
        >
          <Text style={styles.ctaText}>
            {selectedTimes.length > 0 ? `Continue (${selectedTimes.length} selected)` : 'Select a time slot'}
          </Text>
        </Pressable>
        <Text style={styles.ctaLegal}>
          By continuing, you agree to our <Text style={styles.ctaLegalLink}>Terms</Text> &{' '}
          <Text style={styles.ctaLegalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderBottomColor: 'rgba(196, 199, 199, 0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: { width: 36 },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { color: colors.title, fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
  headerSubtitle: { color: colors.muted, fontFamily: 'Montserrat_400Regular', fontSize: 12, marginTop: 2 },
  scrollContent: { gap: 24, paddingBottom: 170, paddingHorizontal: 24, paddingTop: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 2,
    padding: 16,
    shadowColor: 'rgba(34, 34, 34, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  dateDropdown: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  dateDropdownLeft: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  dateToday: { color: colors.ink, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  datePipe: { color: colors.muted, fontFamily: 'Montserrat_400Regular', fontSize: 16 },
  dateFull: { color: colors.muted2, flexShrink: 1, fontFamily: 'Montserrat_400Regular', fontSize: 14 },
  dateRow: { gap: 10, paddingRight: 8, paddingTop: 16 },
  datePill: { alignItems: 'center', borderRadius: 9999, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 9 },
  datePillActive: { backgroundColor: colors.iconDark },
  datePillIdle: { borderColor: colors.border, borderWidth: 1 },
  datePillText: { color: colors.muted2, fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: 0.65 },
  datePillTextActive: { color: colors.white },
  timeSection: { gap: 16, paddingTop: 16 },
  infoBanner: { alignItems: 'center', backgroundColor: colors.infoBg, borderRadius: 8, flexDirection: 'row', gap: 8, padding: 12 },
  infoText: { color: colors.muted2, fontFamily: 'Inter_400Regular', fontSize: 12 },
  emptySlots: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 16, textAlign: 'center' },
  timeGrid: { columnGap: 8, flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  timeSlot: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 12, borderWidth: 1, paddingVertical: 12, width: '31.5%' },
  timeSlotSelected: { backgroundColor: colors.iconDark, borderColor: colors.iconDark },
  timeText: { color: colors.ink, fontFamily: 'Poppins_400Regular', fontSize: 14 },
  timeTextSelected: { color: colors.white },
  ctaShell: {
    backgroundColor: colors.ctaShell,
    borderTopColor: 'rgba(196, 199, 199, 0.2)',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  ctaButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 24, paddingVertical: 16 },
  ctaButtonDisabled: { backgroundColor: colors.disabled },
  ctaText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  ctaLegal: { color: colors.muted, fontFamily: 'Montserrat_400Regular', fontSize: 12, marginTop: 12, textAlign: 'center' },
  ctaLegalLink: { color: colors.muted, textDecorationLine: 'underline' },
});
