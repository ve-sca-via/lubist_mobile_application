import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { usePendingIds } from '@/shared/hooks/usePendingIds';
import {
  Product,
  discountLabel,
  effectivePrice,
  formatPrice,
  originalPrice,
  productImageUri,
  useAddToProductCart,
  useProductCart,
  useProducts,
} from '@/services/api/hooks/useProductsAPI';

const productFallback = require('@/assets/catalog/loreal.png');

const offers = [
  { id: 'o1', title: 'Flat 10% OFF', subtitle: 'On all services with online payment.' },
  { id: 'o2', title: 'Flat 10% OFF', subtitle: 'On all services with online payment.' },
];

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  border: '#F3F4F6',
  heading: '#221A11',
  text: '#534433',
  gold: '#F89E07',
  orange: '#F97316',
  searchBorder: '#E7D7C9',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  size: '#9CA3AF',
  strike: '#9E9E9E',
  sale: '#111827',
  discount: '#27AE60',
  offerBorder: 'rgba(248, 158, 7, 0.2)',
  offerTitle: '#2C2C2C',
  card: '#FFF6EC',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'ProductCatalog'>;

export function ProductCatalogScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const category = route.params?.category;
  const initialSearch = route.params?.search ?? '';
  const title = category ?? (initialSearch ? `“${initialSearch}”` : 'All Products');

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search);
  const productsQuery = useProducts({ category, search: debouncedSearch });
  const products = productsQuery.data?.products ?? [];

  const cart = useProductCart();
  const cartCount = cart.data?.item_count ?? 0;
  // Stable callbacks (mutate, not the mutation object) so memoized cards don't
  // re-render on every keystroke in the search box.
  const { mutateAsync: addToCart } = useAddToProductCart();
  const pending = usePendingIds();
  const { add: markPending, remove: clearPending } = pending;
  const addProduct = useCallback(
    (product: Product) => {
      markPending(product.id);
      // Errors were silent before too (mutate with no handlers); keep it that way.
      addToCart({ product_id: product.id })
        .catch(() => {})
        .finally(() => clearPending(product.id));
    },
    [addToCart, markPending, clearPending],
  );

  const openProduct = useCallback(
    (product: Product) =>
      navigation.navigate('ProductDetail', {
        productId: product.id,
        productName: product.brand ?? product.name,
      }),
    [navigation],
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <CatalogProductCard
        adding={pending.ids.has(item.id)}
        onAdd={addProduct}
        onOpen={openProduct}
        product={item}
      />
    ),
    [pending.ids, addProduct, openProduct],
  );

  const showGrid = !productsQuery.isLoading && !productsQuery.isError && products.length > 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons color={colors.heading} name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Cart')} style={styles.cartWrap}>
          <Ionicons color={colors.heading} name="cart-outline" size={24} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchInput}>
          <Ionicons color={colors.text} name="search-outline" size={18} />
          <TextInput
            onChangeText={setSearch}
            placeholder="Search products, brands..."
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
            style={styles.searchText}
            value={search}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Ionicons color={colors.white} name="options-outline" size={16} />
        </Pressable>
      </View>

      {/* Up to 50 products: virtualized 3-column grid; offers + heading are the header. */}
      <FlatList
        data={showGrid ? products : EMPTY_PRODUCTS}
        keyExtractor={productKey}
        renderItem={renderProduct}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={9}
        maxToRenderPerBatch={9}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>CURRENT OFFERS</Text>
            <ScrollView
              contentContainerStyle={styles.offersRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {offers.map((offer) => (
                <LinearGradient
                  key={offer.id}
                  colors={[colors.card, '#FCEBDC']}
                  end={{ x: 0.2, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.offerCard}
                >
                  <View style={styles.offerTopRow}>
                    <Ionicons color={colors.gold} name="pricetag" size={14} />
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                  </View>
                  <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                </LinearGradient>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, styles.productsHeading]}>OUR PRODUCTS</Text>
            {showGrid ? <View style={styles.gridTop} /> : null}
          </>
        }
        ListEmptyComponent={
          productsQuery.isLoading ? (
            <ActivityIndicator color={colors.gold} size="large" style={styles.loader} />
          ) : productsQuery.isError ? (
            <Text style={styles.emptyText}>Couldn’t load products. Please try again.</Text>
          ) : (
            <Text style={styles.emptyText}>No products found.</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const EMPTY_PRODUCTS: Product[] = [];

const productKey = (product: Product) => product.id;

/** One grid cell; memoized so search typing / cart updates don't re-render the grid. */
const CatalogProductCard = memo(function CatalogProductCard({
  product,
  adding,
  onOpen,
  onAdd,
}: {
  product: Product;
  adding: boolean;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
}) {
  const original = originalPrice(product);
  const discount = discountLabel(product);
  const uri = productImageUri(product);
  return (
    <Pressable onPress={() => onOpen(product)} style={styles.card}>
      <Image
        resizeMode="cover"
        source={uri ? { uri } : productFallback}
        style={styles.productImage}
      />
      <Text style={styles.productBrand}>{product.brand ?? product.name}</Text>
      <Text numberOfLines={2} style={styles.productDesc}>
        {product.short_description ?? product.name}
      </Text>
      {product.weight ? <Text style={styles.productSize}>{product.weight}</Text> : null}

      <View style={styles.priceRow}>
        {original ? <Text style={styles.priceOriginal}>{formatPrice(original)}</Text> : null}
        <Text style={styles.priceSale}>{formatPrice(effectivePrice(product))}</Text>
        {discount ? <Text style={styles.priceDiscount}>{discount}</Text> : null}
      </View>

      <Pressable disabled={adding} onPress={() => onAdd(product)} style={styles.addButton}>
        <Text style={styles.addText}>Add</Text>
        <Ionicons color={colors.white} name="bag-add-outline" size={11} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  cartWrap: {
    height: 24,
    width: 24,
  },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderColor: colors.white,
    borderRadius: 9999,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  cartBadgeText: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
  },
  searchSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  searchInput: {
    alignItems: 'center',
    borderColor: colors.searchBorder,
    borderRadius: 9999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 44,
    paddingHorizontal: 16,
  },
  searchText: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 9999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1.1,
    paddingHorizontal: 20,
  },
  offersRow: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  offerCard: {
    borderColor: colors.offerBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
    width: 220,
  },
  offerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offerTitle: {
    color: colors.offerTitle,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  offerSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_300Light',
    fontSize: 10,
    lineHeight: 14.4,
  },
  productsHeading: {
    marginTop: 28,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  // FlatList grid: the old wrapping grid's side padding goes on each row and
  // its top padding becomes a spacer at the end of the list header.
  gridRow: {
    paddingHorizontal: 8,
  },
  gridTop: {
    height: 12,
  },
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    gap: 2,
    padding: 8,
    width: '33.333%',
  },
  productImage: {
    backgroundColor: colors.card,
    borderRadius: 6,
    height: 96,
    marginBottom: 6,
    width: '100%',
  },
  productBrand: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  productDesc: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 13.5,
  },
  productSize: {
    color: colors.size,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    marginTop: 2,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 4,
  },
  priceOriginal: {
    color: colors.strike,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  priceSale: {
    color: colors.sale,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  priceDiscount: {
    color: colors.discount,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  addText: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9,
  },
});
