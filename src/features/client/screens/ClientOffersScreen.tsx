import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAvailableCoupons, type AvailableCoupon } from '@/services/api/hooks/useBookingAPI';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  offerDark: '#2C2C2C',
  cardCream: '#FFF6EC',
  cardCream2: '#FCEBDC',
  offerBorder: 'rgba(248, 158, 7, 0.2)',
  offerIconBg: '#FFFFFF',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'Offers'>;

function formatValidUntil(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ClientOffersScreen() {
  const navigation = useNavigation<Navigation>();
  // Platform-wide offers available to the customer (no salon context).
  const { data, isLoading, isError, refetch, isRefetching } = useAvailableCoupons();
  const offers = data ?? [];

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="pricetags-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>Couldn't load offers</Text>
          <Pressable onPress={() => refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (offers.length === 0) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="pricetags-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>No offers right now</Text>
          <Text style={styles.stateSubtitle}>
            Check back soon — new deals are added regularly.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons color={colors.heading} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={isLoading || isError ? EMPTY_OFFERS : offers}
        keyExtractor={offerKey}
        renderItem={renderOffer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={OfferSeparator}
        ListEmptyComponent={renderBody()}
      />
    </SafeAreaView>
  );
}

const EMPTY_OFFERS: AvailableCoupon[] = [];

const offerKey = (coupon: AvailableCoupon) => coupon.id;

const renderOffer = ({ item }: { item: AvailableCoupon }) => <OfferRow coupon={item} />;

function OfferSeparator() {
  return <View style={styles.separator} />;
}

const OfferRow = memo(function OfferRow({ coupon }: { coupon: AvailableCoupon }) {
  const subtitle = coupon.subtitle ?? coupon.title ?? 'Apply this code at checkout.';
  const validUntil = formatValidUntil(coupon.valid_until);
  const minOrder =
    coupon.min_order_amount && coupon.min_order_amount > 0
      ? `Min. order ₹${coupon.min_order_amount}`
      : null;

  return (
    <LinearGradient
      colors={[colors.cardCream, colors.cardCream2]}
      end={{ x: 0.2, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardIcon}>
          <Ionicons color={colors.gold} name="pricetag" size={16} />
        </View>
        <Text style={styles.cardTitle}>{coupon.summary}</Text>
      </View>

      <Text style={styles.cardSubtitle}>{subtitle}</Text>

      {minOrder || validUntil ? (
        <View style={styles.metaRow}>
          {minOrder ? (
            <View style={styles.metaItem}>
              <Ionicons color={colors.muted} name="cart-outline" size={12} />
              <Text style={styles.metaText}>{minOrder}</Text>
            </View>
          ) : null}
          {validUntil ? (
            <View style={styles.metaItem}>
              <Ionicons color={colors.muted} name="time-outline" size={12} />
              <Text style={styles.metaText}>Valid till {validUntil}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.codeRow}>
        <View style={styles.codeChip}>
          <Text style={styles.code}>{coupon.code}</Text>
        </View>
        <Text style={styles.codeHint}>Use at checkout</Text>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  backBtn: { height: 28, justifyContent: 'center', width: 44 },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 16 },
  separator: { height: 14 },
  card: {
    borderColor: colors.offerBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  cardTopRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: colors.offerIconBg,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  cardTitle: {
    color: colors.offerDark,
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  cardSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  metaText: { color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 12 },
  codeRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 2 },
  codeChip: {
    backgroundColor: colors.white,
    borderColor: colors.offerBorder,
    borderRadius: 6,
    borderStyle: 'dashed',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  code: {
    color: colors.offerDark,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  codeHint: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 },
  state: { alignItems: 'center', gap: 12, paddingHorizontal: 32, paddingTop: 96 },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: '#FDEDDF',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  stateTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
  },
  stateSubtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  stateBtn: {
    backgroundColor: colors.gold,
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  stateBtnText: { color: colors.white, fontFamily: 'Montserrat_600SemiBold', fontSize: 13 },
});
