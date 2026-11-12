import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { resolveImageUrl } from '@/services/api/imageUrl';
import { formatPrice, useProductOrder } from '@/services/api/hooks/useProductsAPI';
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
  shippingAddressLines,
} from '@/features/client/components/orderDisplay';

const productFallback = require('@/assets/product/shampoo-hero.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  tan: '#F0E0D1',
  cardCream: '#FFF1E6',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  green: '#15803D',
  warnBg: '#FEF3C7',
  warnFg: '#92400E',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'OrderDetail'>;
type Route = RouteProp<ClientStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useProductOrder(params.orderId);

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons color={colors.heading} name="arrow-back" size={22} />
      </Pressable>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {order?.order_number ?? params.orderNumber ?? 'Order'}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        {header}
        <View style={styles.center}>
          <Ionicons color={colors.gold} name="alert-circle-outline" size={36} />
          <Text style={styles.stateText}>
            {(error as Error | null)?.message || "Couldn't load this order."}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const items = order.items ?? [];
  const status = orderStatusStyle(order.status);
  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const subtotal = order.subtotal ?? itemsTotal;
  const discount = Number(order.discount_total) || 0;
  const address = shippingAddressLines(order.shipping_address);
  const phone = typeof order.shipping_address?.phone === 'string' ? order.shipping_address.phone : '';
  const awaitingPayment = (order.payment_status ?? '').toLowerCase() === 'pending';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {header}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl colors={[colors.gold]} onRefresh={refetch} refreshing={isRefetching} tintColor={colors.gold} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <Text style={styles.label}>ORDER #</Text>
              <Text selectable style={styles.orderNumber}>
                {order.order_number}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.fg }]}>{orderStatusLabel(order.status)}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Ionicons color={colors.muted} name="calendar-outline" size={14} />
            <Text style={styles.metaText}>Placed {formatOrderDate(order.created_at)}</Text>
          </View>
          {awaitingPayment ? (
            <View style={styles.notice}>
              <Ionicons color={colors.warnFg} name="time-outline" size={16} />
              <Text style={styles.noticeText}>
                Payment not confirmed yet. If you were charged, this order updates automatically once the
                payment is confirmed.
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>ITEMS ({items.length})</Text>
        <View style={styles.card}>
          {items.length === 0 ? <Text style={styles.metaText}>No items on this order.</Text> : null}
          {items.map((item, index) => {
            const uri = resolveImageUrl(item.image_url);
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: item.product_id, productName: item.product_name })
                }
                style={[styles.itemRow, index > 0 && styles.itemDivider]}
              >
                <View style={styles.thumb}>
                  <Image resizeMode="contain" source={uri ? { uri } : productFallback} style={styles.thumbImage} />
                </View>
                <View style={styles.flex1}>
                  <Text numberOfLines={2} style={styles.itemName}>
                    {item.product_name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Qty {item.quantity} · {formatPrice(item.unit_price)} each
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatPrice(item.total_price)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>PRICE DETAILS</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.rowBetween}>
              <Text style={styles.priceLabel}>
                Coupon discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
              </Text>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          ) : null}
          <View style={styles.rowBetween}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={styles.discountValue}>Free</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total_amount)}</Text>
          </View>
        </View>

        {address.length > 0 || phone ? (
          <>
            <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
            <View style={styles.card}>
              {address.map((line, i) => (
                <Text key={`${i}-${line}`} style={i === 0 ? styles.addressFirst : styles.addressLine}>
                  {line}
                </Text>
              ))}
              {phone ? (
                <View style={styles.metaRow}>
                  <Ionicons color={colors.muted} name="call-outline" size={14} />
                  <Text style={styles.metaText}>{phone}</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {order.razorpay_payment_id ? (
          <>
            <Text style={styles.sectionTitle}>PAYMENT</Text>
            <View style={styles.card}>
              <Text style={styles.label}>PAYMENT ID</Text>
              <Text selectable style={styles.mono}>
                {order.razorpay_payment_id}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  center: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 32 },
  stateText: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  stateBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  stateBtnText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  scroll: { gap: 12, paddingBottom: 120, paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: colors.cardCream,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  flex1: { flex: 1 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.muted, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  orderNumber: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 16, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  metaText: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 13 },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.warnBg,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  noticeText: { color: colors.warnFg, flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  sectionTitle: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 1.2,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  itemRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  itemDivider: { borderTopColor: colors.pillBorder, borderTopWidth: 1, paddingTop: 10 },
  thumb: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.tan,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 56,
  },
  thumbImage: { height: '100%', width: '100%' },
  itemName: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  itemMeta: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  itemTotal: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  priceLabel: { color: colors.text, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, paddingRight: 12 },
  priceValue: { color: colors.heading, fontFamily: 'Inter_400Regular', fontSize: 15 },
  discountValue: { color: colors.green, fontFamily: 'Inter_500Medium', fontSize: 15 },
  divider: { backgroundColor: colors.pillBorder, height: 1 },
  totalLabel: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
  totalValue: { color: colors.gold, fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
  addressFirst: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  addressLine: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  mono: { color: colors.heading, fontFamily: 'Inter_500Medium', fontSize: 13, letterSpacing: 0.3 },
});
