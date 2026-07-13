import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  type CartItem,
} from '@/services/api/hooks/useBookingAPI';

const colors = {
  bg: '#FFF8F4',
  white: '#FFFFFF',
  headerBg: 'rgba(245, 233, 218, 0.95)',
  backBtn: '#FFF1E6',
  heading: '#221A11',
  muted: '#534433',
  iconMuted: '#867461',
  border: '#D9C3AD',
  lightBorder: '#F0E0D1',
  gold: '#F89E07',
  serviceIconBg: '#FDEDDF',
  strike: '#9CA3AF',
  green: '#2E7D32',
  discountBg: '#E7F6EC',
  discountText: '#1B8A4B',
  danger: '#DC2626',
  dangerBg: '#FEECEC',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

const priceText = (v: number) => `₹${Math.round(v)}`;

export function ServiceCartScreen() {
  const navigation = useNavigation<Navigation>();

  const cartQuery = useCart();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const itemCount = cart?.item_count ?? 0;
  const totalAmount = cart?.total_amount ?? 0;

  const confirmClear = () => {
    Alert.alert(
      'Clear services?',
      'Remove all selected services? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
      ],
    );
  };

  const browseServices = () => navigation.navigate('Tabs', { screen: 'Discover' } as never);

  const proceed = () => {
    if (!cart?.salon_id) return;
    navigation.navigate('SelectTime', {
      salonId: cart.salon_id,
      salonName: cart.salon_name ?? undefined,
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.heading} name="arrow-back" size={18} />
        </Pressable>
        <Text style={styles.headerTitle}>Selected Services</Text>
        {items.length > 0 ? (
          <Pressable disabled={isClearing} hitSlop={8} onPress={confirmClear} style={styles.clearBtn}>
            <Ionicons color={colors.danger} name="trash-outline" size={18} />
          </Pressable>
        ) : (
          <View style={styles.clearBtn} />
        )}
      </View>

      {cartQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : cartQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Couldn't load your services. Please try again.</Text>
          <Pressable onPress={() => cartQuery.refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.stateBox}>
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.iconMuted} name="basket-outline" size={40} />
          </View>
          <Text style={styles.emptyTitle}>No services selected</Text>
          <Text style={styles.stateText}>Add services to proceed with booking.</Text>
          <Pressable onPress={browseServices} style={styles.retryBtn}>
            <Text style={styles.retryText}>Browse Services</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {cart?.salon_name ? (
              <Text style={styles.subtitle}>
                Services from <Text style={styles.subtitleName}>{cart.salon_name}</Text>
              </Text>
            ) : null}

            <View style={styles.itemsList}>
              {items.map((item) => (
                <ServiceCartCard
                  key={item.id}
                  item={item}
                  disabled={isRemoving}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryCount}>
                  {itemCount} {itemCount === 1 ? 'service' : 'services'}
                </Text>
                <Text style={styles.summaryHint}>+ Booking fee & GST at checkout</Text>
              </View>
              <Text style={styles.summaryTotal}>{priceText(totalAmount)}</Text>
            </View>
            <Pressable onPress={proceed} style={styles.proceedBtn}>
              <Text style={styles.proceedText}>Select time</Text>
              <Ionicons color={colors.white} name="arrow-forward" size={18} />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function ServiceCartCard({
  item,
  disabled,
  onRemove,
}: {
  item: CartItem;
  disabled: boolean;
  onRemove: () => void;
}) {
  const details = item.service_details ?? {};
  const name = details.name ?? 'Service';
  const duration = details.duration_minutes;
  const salonName = item.salon_details?.business_name;
  const unit = item.unit_price ?? details.price ?? 0;
  const original = details.price;
  const hasDiscount = original != null && original > unit;
  const discountPct = details.discount_percentage;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemIcon}>
        <Ionicons color={colors.gold} name="cut-outline" size={20} />
      </View>

      <View style={styles.itemBody}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={2} style={styles.itemName}>
            {name}
          </Text>
          <Pressable disabled={disabled} hitSlop={8} onPress={onRemove} style={styles.removeBtn}>
            <Ionicons color={colors.danger} name="trash-outline" size={16} />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          {duration ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{duration} min</Text>
            </View>
          ) : null}
          {salonName ? (
            <Text numberOfLines={1} style={styles.metaSalon}>
              {salonName}
            </Text>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{priceText(unit)}</Text>
          {hasDiscount ? (
            <>
              <Text style={styles.strike}>{priceText(original as number)}</Text>
              {discountPct != null ? (
                <View style={styles.discountChip}>
                  <Text style={styles.discountText}>{discountPct}% OFF</Text>
                </View>
              ) : null}
            </>
          ) : null}
          {item.quantity > 1 ? <Text style={styles.qty}>x {item.quantity}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  clearBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stateBox: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 32 },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.serviceIconBg,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 4,
    width: 80,
  },
  emptyTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
  },
  stateText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 24,
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  scrollContent: { paddingBottom: 160, paddingHorizontal: 16, paddingTop: 16 },
  subtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 14,
  },
  subtitleName: { color: colors.heading, fontFamily: 'Inter_600SemiBold' },
  itemsList: { gap: 12 },
  itemCard: {
    backgroundColor: colors.white,
    borderColor: colors.lightBorder,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: colors.serviceIconBg,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  itemBody: { flex: 1, gap: 6 },
  itemTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    paddingRight: 8,
  },
  removeBtn: {
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  metaChip: {
    backgroundColor: colors.lightBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaChipText: { color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 11 },
  metaSalon: { color: colors.iconMuted, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12 },
  priceRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  price: { color: colors.gold, fontFamily: 'Inter_700Bold', fontSize: 15 },
  strike: {
    color: colors.strike,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountChip: {
    backgroundColor: colors.discountBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountText: { color: colors.discountText, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  qty: { color: colors.iconMuted, fontFamily: 'Inter_400Regular', fontSize: 12 },
  footer: {
    backgroundColor: 'rgba(255, 248, 244, 0.98)',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    gap: 12,
    left: 0,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCount: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  summaryHint: { color: colors.iconMuted, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  summaryTotal: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 20 },
  proceedBtn: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  proceedText: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
});
