import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { resolveImageUrl } from '@/services/api/imageUrl';
import {
  formatPrice,
  useMyProductOrders,
  type MyProductOrder,
} from '@/services/api/hooks/useProductsAPI';
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
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
};

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'MyOrders'>;

/** Thumbnails shown per order card before collapsing the rest into "+N". */
const MAX_THUMBS = 3;

const OrderRow = memo(function OrderRow({
  order,
  onPress,
}: {
  order: MyProductOrder;
  onPress: (order: MyProductOrder) => void;
}) {
  const status = orderStatusStyle(order.status);
  const items = order.items ?? [];
  const units = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const extra = items.length - MAX_THUMBS;

  return (
    <Pressable onPress={() => onPress(order)} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text numberOfLines={1} style={styles.orderNumber}>
            {order.order_number}
          </Text>
          <Text style={styles.orderDate}>Placed {formatOrderDate(order.created_at)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.fg }]}>{orderStatusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.thumbRow}>
        {items.slice(0, MAX_THUMBS).map((item) => {
          const uri = resolveImageUrl(item.image_url);
          return (
            <View key={item.id} style={styles.thumb}>
              <Image resizeMode="contain" source={uri ? { uri } : productFallback} style={styles.thumbImage} />
            </View>
          );
        })}
        {extra > 0 ? (
          <View style={[styles.thumb, styles.thumbMore]}>
            <Text style={styles.thumbMoreText}>+{extra}</Text>
          </View>
        ) : null}
        <Text numberOfLines={2} style={styles.itemSummary}>
          {items.length === 1
            ? items[0].product_name
            : `${units} ${units === 1 ? 'item' : 'items'}`}
        </Text>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountRight}>
          <Text style={styles.amount}>{formatPrice(order.total_amount)}</Text>
          <Ionicons color={colors.muted} name="chevron-forward" size={16} />
        </View>
      </View>
    </Pressable>
  );
});

export function MyOrdersScreen() {
  const navigation = useNavigation<Navigation>();
  const { isAuthenticated, user } = useAuth();
  const signedIn = isAuthenticated && !user?.guest;

  const { data, isLoading, isError, error, refetch, isRefetching } = useMyProductOrders(signedIn);
  const orders = data ?? [];

  const openOrder = useCallback(
    (order: MyProductOrder) =>
      navigation.navigate('OrderDetail', { orderId: order.id, orderNumber: order.order_number }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<MyProductOrder>>(
    ({ item }) => <OrderRow onPress={openOrder} order={item} />,
    [openOrder],
  );

  const renderState = () => {
    if (!signedIn) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="receipt-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>Sign in to see your orders</Text>
        </View>
      );
    }
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
          <Text style={styles.stateSubtitle}>
            {(error as Error | null)?.message || "Couldn't load your orders."}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <View style={styles.stateIcon}>
          <Ionicons color={colors.gold} name="bag-handle-outline" size={26} />
        </View>
        <Text style={styles.stateTitle}>No orders yet</Text>
        <Text style={styles.stateSubtitle}>Looks like you haven't placed any product orders yet.</Text>
        <Pressable onPress={() => navigation.navigate('ProductCatalog', {})} style={styles.stateBtn}>
          <Text style={styles.stateBtnText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  };

  const showList = signedIn && !isLoading && !isError;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons color={colors.heading} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.backBtn} />
      </View>

      {showList ? (
        <FlatList
          contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.listContent}
          data={orders}
          keyExtractor={(order) => order.id}
          ListEmptyComponent={renderState}
          refreshControl={
            <RefreshControl colors={[colors.gold]} onRefresh={refetch} refreshing={isRefetching} tintColor={colors.gold} />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderState()
      )}
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
  headerTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 20, letterSpacing: -0.2 },
  listContent: { gap: 14, paddingBottom: 120, paddingHorizontal: 16, paddingTop: 16 },
  emptyContent: { flexGrow: 1 },
  card: {
    backgroundColor: colors.cardCream,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  cardTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  cardTopLeft: { flex: 1, gap: 2, paddingRight: 10 },
  orderNumber: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 15 },
  orderDate: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5 },
  thumbRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  thumb: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.tan,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  thumbImage: { height: '100%', width: '100%' },
  thumbMore: { backgroundColor: colors.tan },
  thumbMoreText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  itemSummary: { color: colors.text, flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, paddingLeft: 4 },
  cardBottom: {
    alignItems: 'center',
    borderTopColor: colors.pillBorder,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  amountLabel: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14 },
  amountRight: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  amount: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 17 },
  state: { alignItems: 'center', gap: 12, paddingHorizontal: 32, paddingTop: 96 },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: '#FDEDDF',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  stateTitle: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 18, textAlign: 'center' },
  stateSubtitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  stateBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  stateBtnText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
