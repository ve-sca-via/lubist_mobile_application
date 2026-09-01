import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useActiveVendorPromotion, useApplyVendorPromotion } from '@/services/api/hooks/useVendorAPI';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function VendorRunPromoScreen() {
  const navigation = useNavigation<Navigation>();
  const { data: activePromo, isLoading } = useActiveVendorPromotion();
  const applyPromo = useApplyVendorPromotion();

  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'flat_amount' | 'percentage'>('flat_amount');
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxDiscountLimit, setMaxDiscountLimit] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!activePromo) return;
    setTitle(activePromo.title);
    setDiscountType(activePromo.discount_type);
    setDiscountValue(String(activePromo.discount_value));
    setMinBookingAmount(activePromo.min_booking_amount != null ? String(activePromo.min_booking_amount) : '');
    setMaxDiscountLimit(activePromo.max_discount_limit != null ? String(activePromo.max_discount_limit) : '');
    setStartDate(activePromo.start_date);
    setEndDate(activePromo.end_date ?? '');
  }, [activePromo]);

  function validate(): string | null {
    if (!title.trim()) return 'Offer title is required.';
    const value = Number(discountValue);
    if (!discountValue.trim() || Number.isNaN(value) || value <= 0) return 'Enter a valid discount value.';
    if (discountType === 'percentage' && value > 100) return 'Percentage discount cannot exceed 100.';
    if (!startDate.trim()) return 'Start date is required (YYYY-MM-DD).';
    if (endDate.trim()) {
      if (endDate < startDate) return 'End date must be on or after start date.';
      if (endDate < todayIso()) return 'End date cannot be in the past.';
    }
    const min = minBookingAmount.trim() ? Number(minBookingAmount) : undefined;
    if (min !== undefined && (Number.isNaN(min) || min < 0)) return 'Min. booking amount must be 0 or more.';
    const max = maxDiscountLimit.trim() ? Number(maxDiscountLimit) : undefined;
    if (max !== undefined && (Number.isNaN(max) || max < 0)) return 'Max. limit must be 0 or more.';
    if (min !== undefined && max !== undefined && max < min) {
      return 'Max discount limit should be greater than or equal to minimum booking amount.';
    }
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      Alert.alert('Invalid promotion', error);
      return;
    }

    try {
      const result = await applyPromo.mutateAsync({
        title: title.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_booking_amount: minBookingAmount.trim() ? Number(minBookingAmount) : null,
        max_discount_limit: maxDiscountLimit.trim() ? Number(maxDiscountLimit) : null,
        start_date: startDate.trim(),
        end_date: endDate.trim() || null,
      });

      let message = 'Promotion saved successfully!';
      if (result.status === 'scheduled') {
        message = `Promo saved. Discounts apply automatically from ${result.start_date}.`;
      } else if (result.services_updated > 0) {
        message = `Discount applied to ${result.services_updated} service(s)!`;
      }
      Alert.alert('Success', message);
      navigation.navigate('Tabs', { screen: 'Dashboard' } as never);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save promotion');
    }
  }

  return (
    <View style={styles.screen}>
      <Header onBack={() => navigation.goBack()} />
      {isLoading ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : (
        <View style={styles.body}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="pricetag" size={20} color={palette.primary} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Flat Discount Offer</Text>
              <Text style={styles.heroBody}>
                Apply a fixed price or percentage reduction across all your services. Ideal for flash sales or
                seasonal promotions.
              </Text>
            </View>
          </View>

          {activePromo ? (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerTitle}>
                Current promo: {activePromo.title} ({activePromo.status})
              </Text>
              <Text style={styles.activeBannerMeta}>
                {activePromo.start_date} {activePromo.end_date ? `→ ${activePromo.end_date}` : '(no end date)'} •
                Applies to all services
              </Text>
            </View>
          ) : null}

          <SectionHeading>Offer Details</SectionHeading>
          <View style={styles.card}>
            <FieldLabel>Offer Title (visible to clients)</FieldLabel>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Summer Glow Special"
              placeholderTextColor="#867461"
            />

            <FieldLabel spaced>Discount Type</FieldLabel>
            <View style={styles.segmented}>
              {(['flat_amount', 'percentage'] as const).map((type) => {
                const active = discountType === type;
                return (
                  <Pressable
                    key={type}
                    style={[styles.segmentButton, active && styles.segmentButtonActive]}
                    onPress={() => setDiscountType(type)}
                  >
                    <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                      {type === 'flat_amount' ? 'Flat Amount (₹)' : 'Percentage (%)'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FieldLabel spaced>Discount Value</FieldLabel>
            <View style={styles.prefixedInputWrap}>
              <Text style={styles.prefixSymbol}>{discountType === 'percentage' ? '%' : '₹'}</Text>
              <TextInput
                style={styles.prefixedInput}
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <SectionHeading>Value & Limits</SectionHeading>
          <View style={styles.card}>
            <View style={styles.limitsRow}>
              <View style={styles.limitField}>
                <FieldLabel>Min. Booking</FieldLabel>
                <View style={styles.pillInputWrap}>
                  <Text style={styles.pillSymbol}>₹</Text>
                  <TextInput
                    style={styles.pillInput}
                    value={minBookingAmount}
                    onChangeText={setMinBookingAmount}
                    keyboardType="decimal-pad"
                    placeholder="Optional"
                    placeholderTextColor="#6b7280"
                  />
                </View>
              </View>
              <View style={styles.limitField}>
                <FieldLabel>Max. Limit</FieldLabel>
                <View style={styles.pillInputWrap}>
                  <Text style={styles.pillSymbol}>₹</Text>
                  <TextInput
                    style={styles.pillInput}
                    value={maxDiscountLimit}
                    onChangeText={setMaxDiscountLimit}
                    keyboardType="decimal-pad"
                    placeholder="Optional"
                    placeholderTextColor="#6b7280"
                  />
                </View>
              </View>
            </View>
          </View>

          <SectionHeading>Validity Period</SectionHeading>
          <View style={styles.card}>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <FieldLabel>Start Date</FieldLabel>
                <View style={styles.dateInputWrap}>
                  <Ionicons name="calendar-outline" size={15} color="#534433" />
                  <TextInput
                    style={styles.dateInput}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#867461"
                  />
                </View>
              </View>
              <View style={styles.dateField}>
                <FieldLabel>End Date (Optional)</FieldLabel>
                <View style={styles.dateInputWrap}>
                  <Ionicons name="calendar-outline" size={15} color="#534433" />
                  <TextInput
                    style={styles.dateInput}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#867461"
                  />
                </View>
              </View>
            </View>
          </View>

          <Pressable style={styles.submitButton} disabled={applyPromo.isPending} onPress={handleSubmit}>
            <Text style={styles.submitButtonLabel}>{applyPromo.isPending ? 'Saving…' : 'Apply Discount'}</Text>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color="#221a11" />
      </Pressable>
      <Text style={styles.headerTitle}>Flat Discount</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionHeading}>{String(children).toUpperCase()}</Text>;
}

function FieldLabel({ children, spaced }: { children: React.ReactNode; spaced?: boolean }) {
  return <Text style={[styles.fieldLabel, spaced && styles.fieldLabelSpaced]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0,
  },
  headerTitle: {
    color: '#221a11',
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },
  loader: { marginTop: 40 },
  body: {
    gap: 8,
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderColor: 'rgba(240,224,209,0.5)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    padding: 17,
  },
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,158,7,0.2)',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroTextWrap: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: '#221a11',
    fontSize: 18,
    fontWeight: typography.weight.semibold,
  },
  heroBody: {
    color: '#534433',
    fontSize: 14,
    lineHeight: 20,
  },
  activeBanner: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  activeBannerTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  activeBannerMeta: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeading: {
    borderBottomColor: '#f0e0d1',
    borderBottomWidth: 1,
    color: '#534433',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: 'rgba(240,224,209,0.5)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  fieldLabel: {
    color: '#221a11',
    fontSize: 14,
    fontWeight: typography.weight.medium,
    marginBottom: 8,
  },
  fieldLabelSpaced: {
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff8f4',
    borderColor: '#d9c3ad',
    borderRadius: 4,
    borderWidth: 1,
    color: '#221a11',
    fontSize: 15,
    paddingHorizontal: 17,
    paddingVertical: 15,
  },
  segmented: {
    backgroundColor: 'rgba(240,224,209,0.5)',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  segmentLabel: {
    color: '#534433',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  segmentLabelActive: {
    color: '#865300',
    fontWeight: typography.weight.semibold,
  },
  prefixedInputWrap: {
    alignItems: 'center',
    backgroundColor: '#fff8f4',
    borderColor: '#d9c3ad',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  prefixSymbol: {
    color: '#534433',
    fontSize: 16,
    marginRight: 8,
  },
  prefixedInput: {
    color: '#221a11',
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  limitsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  limitField: {
    flex: 1,
  },
  pillInputWrap: {
    alignItems: 'center',
    backgroundColor: '#fff1e6',
    borderRadius: 18,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  pillSymbol: {
    color: '#534433',
    fontSize: 16,
    marginRight: 6,
  },
  pillInput: {
    color: '#221a11',
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateField: {
    flex: 1,
  },
  dateInputWrap: {
    alignItems: 'center',
    backgroundColor: '#fff8f4',
    borderColor: '#d9c3ad',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  dateInput: {
    color: '#221a11',
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 16,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: typography.weight.bold,
  },
});
