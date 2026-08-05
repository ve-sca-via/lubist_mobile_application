import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import {
  useFavorites,
  useRemoveFavorite,
  favoriteSalonId,
  type FavoriteItem,
} from '@/services/api/hooks/useCustomerAPI';
import {
  useFavoriteProducts,
  useRemoveFavoriteProduct,
  effectivePrice,
  formatPrice,
  productImageUri,
  type Product,
} from '@/services/api/hooks/useProductsAPI';
import { businessTypeChipLabel } from '@/services/api/hooks/useSalonsAPI';
import { resolveImageUrl } from '@/services/api/imageUrl';
import { displayRating } from '@/services/api/rating';
import { salonLocationLabel } from '@/services/api/salonLocation';

const avatar = require('@/assets/home/avatar.png');
const fallbackSalon = require('@/assets/home/top-lumina.png');
const productFallback = require('@/assets/catalog/loreal.png');

type Tab = 'salons' | 'products';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream2: '#FFF1E6',
  cardBorder: '#F3F4F6',
  chipBg: '#EDE1D2',
  chipUnisex: '#6B6357',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  onImage: 'rgba(255, 255, 255, 0.9)',
  size: '#9CA3AF',
  sale: '#111827',
  segmentBg: '#F0E0D1',
};

type SavedNavigation = NativeStackNavigationProp<ClientStackParamList>;

function salonLocation(s: FavoriteItem) {
  return salonLocationLabel(s, 'Salon');
}

export function ClientAccountScreen() {
  const navigation = useNavigation<SavedNavigation>();
  const { isAuthenticated, user } = useAuth();
  const canFavorite = isAuthenticated && !user?.guest;
  const [tab, setTab] = useState<Tab>('salons');

  const favoritesQuery = useFavorites(canFavorite);
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const favorites = favoritesQuery.data?.favorites ?? [];

  const productFavoritesQuery = useFavoriteProducts(canFavorite);
  const { mutate: removeFavoriteProduct, isPending: isRemovingProduct } =
    useRemoveFavoriteProduct();
  const favoriteProducts = productFavoritesQuery.data?.favorites ?? [];

  const openProduct = (p: Product) =>
    navigation.navigate('ProductDetail', { productId: p.id, productName: p.brand ?? p.name });

  const openSalon = (s: FavoriteItem) =>
    navigation.navigate('SalonDetails', {
      salon: {
        id: favoriteSalonId(s) ?? '',
        name: s.business_name ?? 'Salon',
        location: salonLocation(s),
        rating: displayRating(s.average_rating, s.total_reviews).label,
        reviewCount: s.total_reviews ?? 0,
        heroImage: s.logo_url ?? s.cover_images?.[0] ?? undefined,
      },
    });

  const renderBody = () => {
    if (!canFavorite) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="heart-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>Sign in to see your saved salons</Text>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Go to Profile</Text>
          </Pressable>
        </View>
      );
    }
    if (favoritesQuery.isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
    }
    if (favoritesQuery.isError) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateSubtitle}>Couldn't load your saved salons.</Text>
          <Pressable onPress={() => favoritesQuery.refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (favorites.length === 0) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="heart-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>No saved salons yet</Text>
          <Text style={styles.stateSubtitle}>Tap the heart on a salon to save it here.</Text>
        </View>
      );
    }
    return (
      <View style={styles.salonList}>
        {favorites.map((salon) => {
          const id = favoriteSalonId(salon) ?? '';
          const remote = resolveImageUrl(salon.logo_url ?? salon.cover_images?.[0]);
          return (
            <Pressable key={id} onPress={() => openSalon(salon)} style={styles.salonCard}>
              <View style={styles.salonImageWrap}>
                <Image source={remote ? { uri: remote } : fallbackSalon} style={styles.salonImage} />
                <Pressable
                  disabled={isRemoving}
                  hitSlop={8}
                  onPress={() => removeFavorite(id)}
                  style={styles.salonFav}
                >
                  <Ionicons color={colors.gold} name="heart" size={18} />
                </Pressable>
              </View>
              <View style={styles.salonContent}>
                <View style={styles.salonTitleRow}>
                  <Text style={styles.salonName}>{salon.business_name ?? 'Salon'}</Text>
                  <View style={styles.salonRating}>
                    <Ionicons color={colors.gold} name="star" size={12} />
                    <Text style={styles.salonRatingText}>
                      {displayRating(salon.average_rating, salon.total_reviews).label}
                    </Text>
                  </View>
                </View>
                <View style={styles.salonMeta}>
                  <Ionicons
                    color={colors.text}
                    name="location-outline"
                    size={14}
                    style={styles.salonMetaIcon}
                  />
                  <Text numberOfLines={2} style={styles.salonMetaText}>
                    {salonLocation(salon)}
                  </Text>
                </View>
                {salon.business_type ? (
                  <View style={styles.salonChips}>
                    <View style={styles.salonChip}>
                      <Text style={styles.salonChipText}>
                        {businessTypeChipLabel(salon.business_type).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderProducts = () => {
    if (!canFavorite) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="bag-handle-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>Sign in to see your saved products</Text>
          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Go to Profile</Text>
          </Pressable>
        </View>
      );
    }
    if (productFavoritesQuery.isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
    }
    if (productFavoritesQuery.isError) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateSubtitle}>Couldn't load your saved products.</Text>
          <Pressable onPress={() => productFavoritesQuery.refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (favoriteProducts.length === 0) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="bag-handle-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>No saved products yet</Text>
          <Text style={styles.stateSubtitle}>Tap the heart on a product to save it here.</Text>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {favoriteProducts.map((product) => {
          const uri = productImageUri(product);
          return (
            <Pressable
              key={product.id}
              onPress={() => openProduct(product)}
              style={styles.productCard}
            >
              <View style={styles.productImageWrap}>
                <Image
                  source={uri ? { uri } : productFallback}
                  style={styles.productImage}
                />
                <Pressable
                  disabled={isRemovingProduct}
                  hitSlop={8}
                  onPress={() => removeFavoriteProduct(product.id)}
                  style={styles.productFav}
                >
                  <Ionicons color={colors.gold} name="heart" size={14} />
                </Pressable>
              </View>
              <Text style={styles.productBrand}>{product.brand ?? product.name}</Text>
              <Text numberOfLines={2} style={styles.productDesc}>
                {product.short_description ?? product.name}
              </Text>
              {product.weight ? <Text style={styles.productSize}>{product.weight}</Text> : null}
              <Text style={styles.productPrice}>{formatPrice(effectivePrice(product))}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons color={colors.heading} name="arrow-back" size={18} />
            </Pressable>
          ) : null}
          <Text style={styles.headerTitle}>Saved</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Profile')}>
          <Image source={avatar} style={styles.avatar} />
        </Pressable>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setTab('salons')}
          style={[styles.segmentButton, tab === 'salons' && styles.segmentActive]}
        >
          <Ionicons color={tab === 'salons' ? colors.white : colors.text} name="heart" size={14} />
          <Text style={[styles.segmentText, tab === 'salons' && styles.segmentTextActive]}>Salons</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('products')}
          style={[styles.segmentButton, tab === 'products' && styles.segmentActive]}
        >
          <Ionicons color={tab === 'products' ? colors.white : colors.text} name="bag-handle" size={14} />
          <Text style={[styles.segmentText, tab === 'products' && styles.segmentTextActive]}>Products</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'salons' ? renderBody() : renderProducts()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.cardCream2,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.2,
  },
  avatar: {
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    height: 40,
    width: 40,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 96,
  },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: '#FDEDDF',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  stateTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  stateSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  stateBtn: {
    backgroundColor: colors.gold,
    borderRadius: 24,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  stateBtnText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  segment: {
    backgroundColor: colors.segmentBg,
    borderRadius: 14,
    flexDirection: 'row',
    margin: 16,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.gold,
  },
  segmentText: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  salonList: {
    gap: 16,
  },
  salonCard: {
    backgroundColor: colors.cardCream2,
    borderColor: colors.pillBorder,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  salonImageWrap: {
    height: 160,
    position: 'relative',
  },
  salonImage: {
    height: '100%',
    width: '100%',
  },
  salonFav: {
    alignItems: 'center',
    backgroundColor: colors.onImage,
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
  },
  salonContent: {
    gap: 8,
    padding: 16,
  },
  salonTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    paddingRight: 10,
  },
  salonRating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  salonRatingText: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  salonMeta: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  salonMetaIcon: {
    marginTop: 3,
  },
  salonMetaText: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 21,
  },
  salonChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  salonChip: {
    backgroundColor: colors.chipBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  salonChipText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  salonChipUnisex: {
    color: colors.chipUnisex,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  productCard: {
    borderColor: colors.cardBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    padding: 8,
    width: '48%',
  },
  productImageWrap: {
    marginBottom: 6,
    position: 'relative',
  },
  productImage: {
    backgroundColor: colors.tan,
    borderRadius: 6,
    height: 120,
    width: '100%',
  },
  productFav: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
  },
  productBrand: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  productDesc: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
  },
  productSize: {
    color: colors.size,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  productPrice: {
    color: colors.sale,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    paddingVertical: 4,
  },
});
