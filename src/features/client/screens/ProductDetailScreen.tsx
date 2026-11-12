import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
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
import { RelatedProductsSection } from '@/features/client/components/RelatedProductsSection';
import { useAuth } from '@/store/AuthContext';
import {
  discountLabel,
  effectivePrice,
  formatPrice,
  originalPrice,
  productImageUri,
  useAddFavoriteProduct,
  useAddToProductCart,
  useFavoriteProducts,
  useProduct,
  useProductCart,
  useRemoveFavoriteProduct,
} from '@/services/api/hooks/useProductsAPI';

const heroImg = require('@/assets/product/shampoo-hero.png');

const specs = [
  { id: 'ing', label: 'KEY INGREDIENTS', value: 'Rosemary, Biotin' },
  { id: 'scalp', label: 'SCALP TYPE', value: 'All Scalp Types' },
  { id: 'concern', label: 'HAIR CONCERN', value: 'Damage Repair, Thinning' },
];

const features = [
  { id: 'auth', icon: 'shield-checkmark-outline' as const, label: '100% Authentic' },
  { id: 'returns', icon: 'refresh-outline' as const, label: 'Easy Returns' },
];

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  headerBorder: '#F3F4F6',
  heading: '#221A11',
  gold: '#F89E07',
  goldRate: '#F7A92A',
  muted: '#5D5F5F',
  text: '#534433',
  border: '#F0E0D1',
  inputBorder: '#D9C3AD',
  ratingBadge: '#F6E5D7',
  sizeSelectedBg: 'rgba(248, 158, 7, 0.05)',
  shareBorder: 'rgba(217, 195, 173, 0.3)',
  placeholder: 'rgba(83, 68, 51, 0.6)',
  readMore: 'rgba(93, 95, 95, 0.5)',
  avatarBg: '#FCEBDC',
  rateBorder: 'rgba(240, 224, 209, 0.6)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const productId = route.params?.productId;
  const fallbackName = route.params?.productName ?? 'Product';

  const { isAuthenticated, user } = useAuth();
  const canFavorite = isAuthenticated && !user?.guest;

  const productQuery = useProduct(productId);
  const product = productQuery.data?.product;

  const cart = useProductCart();
  const cartCount = cart.data?.item_count ?? 0;
  const addToCart = useAddToProductCart();

  const favoritesQuery = useFavoriteProducts(canFavorite);
  const addFavorite = useAddFavoriteProduct();
  const removeFavorite = useRemoveFavoriteProduct();
  const isFavorited = !!product && favoritesQuery.data?.favorites.some((p) => p.id === product.id);
  const isTogglingFavorite = addFavorite.isPending || removeFavorite.isPending;

  const toggleFavorite = () => {
    if (!product || isTogglingFavorite) return;
    if (!canFavorite) {
      navigation.navigate('Profile');
      return;
    }
    if (isFavorited) removeFavorite.mutate(product.id);
    else addFavorite.mutate(product.id);
  };

  const headerTitle = product?.brand ?? product?.name ?? fallbackName;
  const heroUri = product ? productImageUri(product) : null;
  const price = product ? effectivePrice(product) : null;
  const original = product ? originalPrice(product) : null;
  const discount = product ? discountLabel(product) : null;

  const handleAddToBag = () => {
    if (!product) return;
    addToCart.mutate(
      { product_id: product.id },
      { onSuccess: () => navigation.navigate('Cart') },
    );
  };

  if (productQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </SafeAreaView>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons color={colors.heading} name="arrow-back" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>{fallbackName}</Text>
          </View>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn’t load this product.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons color={colors.heading} name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image resizeMode="contain" source={heroUri ? { uri: heroUri } : heroImg} style={styles.heroImage} />
          <Pressable
            disabled={isTogglingFavorite}
            hitSlop={8}
            onPress={toggleFavorite}
            style={styles.favFloat}
          >
            <Ionicons
              color={isFavorited ? colors.gold : colors.text}
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={18}
            />
          </Pressable>
          <Pressable style={styles.shareFloat}>
            <Ionicons color={colors.text} name="share-social-outline" size={18} />
          </Pressable>
        </View>

        <Text style={styles.productTitle}>{product.name}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingValue}>4.8</Text>
            <Ionicons color={colors.gold} name="star" size={11} />
          </View>
          <Text style={styles.reviewsCount}>1.2k Reviews</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceMain}>{price != null ? formatPrice(price) : '—'}</Text>
          {original ? <Text style={styles.priceOriginal}>{formatPrice(original)}</Text> : null}
          {discount ? <Text style={styles.priceDiscount}>{discount}</Text> : null}
        </View>

        {product.weight ? (
          <>
            <Text style={styles.sectionLabel}>Size</Text>
            <View style={styles.sizeRow}>
              <View style={[styles.sizeButton, styles.sizeButtonSelected]}>
                <Text style={styles.sizeLabel}>{product.weight}</Text>
                <Text style={styles.sizePrice}>{price != null ? formatPrice(price) : ''}</Text>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.featuresRow}>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <Ionicons color={colors.gold} name={feature.icon} size={18} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Ionicons color={colors.muted} name="location-outline" size={16} />
            <Text style={styles.sectionLabel}>Check Delivery & Services</Text>
          </View>
          <View style={styles.deliveryInputRow}>
            <View style={styles.pincodeInput}>
              <TextInput
                placeholder="Enter Pincode"
                placeholderTextColor={colors.placeholder}
                style={styles.pincodeText}
              />
            </View>
            <Pressable style={styles.checkButton}>
              <Text style={styles.checkText}>Check</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.blockTitle}>Product Details</Text>
        <View style={styles.specsCard}>
          {specs.map((spec, index) => (
            <View key={spec.id} style={[styles.specRow, index > 0 && styles.specRowBorder]}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.descCard}>
          <View style={styles.descHeader}>
            <Text style={styles.descTitle}>Description</Text>
            <Ionicons color={colors.muted} name="chevron-down" size={18} />
          </View>
          <Text style={styles.descBody}>
            {product.description ?? product.short_description ?? 'No description available.'}
          </Text>
          {product.description ? <Text style={styles.readMore}>Read More</Text> : null}
        </View>

        <Text style={styles.blockTitle}>Customer Reviews</Text>
        <View style={styles.ratingSummary}>
          <View style={styles.ratingSummaryLeft}>
            <View style={styles.ratingScoreRow}>
              <Text style={styles.ratingScore}>4.4</Text>
              <Text style={styles.ratingScoreMax}>/5</Text>
            </View>
            <Text style={styles.ratingOverall}>Overall rating</Text>
            <Text style={styles.ratingCount}>522348 verified ratings</Text>
          </View>
          <Pressable style={styles.rateButton}>
            <Text style={styles.rateText}>Rate</Text>
          </Pressable>
        </View>

        <Text style={styles.photosTitle}>Review Photos</Text>
        <View style={styles.photosRow}>
          <LinearGradient
            colors={['rgba(215,167,151,0.3)', 'rgba(246,229,215,0.8)']}
            style={styles.photoTile}
          />
          <LinearGradient
            colors={['rgba(246,229,215,0.6)', 'rgba(217,195,173,0.4)']}
            style={styles.photoTile}
          />
          <LinearGradient
            colors={['rgba(240,224,209,0.5)', 'rgba(248,158,7,0.1)']}
            style={[styles.photoTile, styles.photoTileMore]}
          >
            <Text style={styles.photoMoreText}>+12</Text>
          </LinearGradient>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewUser}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>A</Text>
              </View>
              <View>
                <Text style={styles.reviewName}>Anjali S.</Text>
                <Text style={styles.reviewStars}>★★★★★</Text>
              </View>
            </View>
            <Text style={styles.reviewTime}>2 days ago</Text>
          </View>
          <Text style={styles.reviewBody}>
            Absolutely changed my hair texture after just 3 washes. The scent is very subtle and
            premium, feels like stepping out of a high-end spa. Highly recommend for chemically
            treated hair.
          </Text>
          <View style={styles.helpfulRow}>
            <Ionicons color={colors.muted} name="thumbs-up-outline" size={14} />
            <Text style={styles.helpfulText}>Helpful (12)</Text>
          </View>
        </View>

        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Reviews</Text>
        </Pressable>

        <RelatedProductsSection productId={product.id} />
      </ScrollView>

      <View style={styles.ctaShell}>
        <Pressable disabled={addToCart.isPending} onPress={handleAddToBag}>
          <LinearGradient
            colors={['#865300', colors.gold]}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={[styles.addToBag, addToCart.isPending && styles.addToBagDisabled]}
          >
            {addToCart.isPending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons color={colors.white} name="bag-handle-outline" size={18} />
                <Text style={styles.addToBagText}>
                  ADD TO BAG{price != null ? ` - ${formatPrice(price)}` : ''}
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.headerBorder,
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
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
    height: 320,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  shareFloat: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    shadowColor: 'rgba(44, 44, 44, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    top: 12,
    width: 40,
  },
  favFloat: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 60,
    shadowColor: 'rgba(44, 44, 44, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    top: 12,
    width: 40,
  },
  productTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    lineHeight: 19.2,
    marginTop: 16,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: colors.ratingBadge,
    borderRadius: 2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingValue: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  reviewsCount: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  priceMain: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  priceOriginal: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  priceDiscount: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  sectionLabel: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sizeButton: {
    borderColor: colors.inputBorder,
    borderRadius: 2,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sizeButtonSelected: {
    backgroundColor: colors.sizeSelectedBg,
    borderColor: colors.gold,
    borderWidth: 2,
  },
  sizeLabel: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  sizeLabelIdle: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
  },
  sizePrice: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  featureText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  deliveryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deliveryInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pincodeInput: {
    borderColor: colors.inputBorder,
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pincodeText: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    padding: 0,
  },
  checkButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  checkText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  blockTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    marginTop: 28,
  },
  specsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  specRowBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  specLabel: {
    color: colors.muted,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  specValue: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'right',
  },
  descCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 16,
    padding: 16,
  },
  descHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  descTitle: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  descBody: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  readMore: {
    color: colors.readMore,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  ratingSummary: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 16,
  },
  ratingSummaryLeft: {
    gap: 2,
  },
  ratingScoreRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
  },
  ratingScore: {
    color: colors.heading,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 32,
    lineHeight: 36,
  },
  ratingScoreMax: {
    color: colors.muted,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    marginBottom: 4,
  },
  ratingOverall: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  ratingCount: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  rateButton: {
    borderColor: colors.rateBorder,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  rateText: {
    color: colors.goldRate,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  photosTitle: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: 20,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  photoTile: {
    borderColor: colors.inputBorder,
    borderRadius: 4,
    borderWidth: 1,
    height: 72,
    width: 72,
  },
  photoTileMore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoMoreText: {
    color: colors.gold,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewUser: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  reviewAvatar: {
    alignItems: 'center',
    backgroundColor: colors.avatarBg,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  reviewAvatarText: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  reviewName: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  reviewStars: {
    color: colors.gold,
    fontSize: 11,
    marginTop: 2,
  },
  reviewTime: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  reviewBody: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22.75,
  },
  helpfulRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  helpfulText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  viewAllButton: {
    alignItems: 'center',
    borderColor: colors.inputBorder,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 14,
  },
  viewAllText: {
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  ctaShell: {
    backgroundColor: colors.bg,
    borderTopColor: colors.shareBorder,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
  },
  addToBag: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 54,
    paddingVertical: 16,
  },
  addToBagDisabled: {
    opacity: 0.7,
  },
  addToBagText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
