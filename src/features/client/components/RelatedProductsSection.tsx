import { useNavigation } from '@react-navigation/native';
import { memo } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import {
  discountLabel,
  effectivePrice,
  formatPrice,
  originalPrice,
  productImageUri,
  useRelatedProducts,
  type Product,
} from '@/services/api/hooks/useProductsAPI';

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

const colors = {
  heading: '#221A11',
  gold: '#F89E07',
  muted: '#5D5F5F',
  white: '#FFFFFF',
  border: '#F0E0D1',
};

/**
 * "Related Products" row shown at the bottom of the product detail screen.
 *
 * Reads the backend /products/{id}/related endpoint (same-category first, then
 * backfilled) and renders a horizontally scrollable strip of compact product
 * cards. Renders nothing while loading or when there's nothing related, so the
 * screen never shows a lonely heading. Tapping a card pushes a fresh
 * ProductDetail so the back button returns to the current product.
 */
// Memoized: it only depends on the id, so the parent detail screen's own
// re-renders (favourite toggles, query updates) don't re-render the strip.
export const RelatedProductsSection = memo(function RelatedProductsSection({ productId }: { productId?: string }) {
  const navigation = useNavigation<Navigation>();
  const { data, isLoading } = useRelatedProducts(productId);
  const products = data?.products ?? [];

  if (isLoading || products.length === 0) return null;

  const open = (p: Product) =>
    navigation.push('ProductDetail', { productId: p.id, productName: p.brand ?? p.name });

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Related Products</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {products.map((item) => {
          const uri = productImageUri(item);
          const price = effectivePrice(item);
          const original = originalPrice(item);
          const discount = discountLabel(item);
          return (
            <Pressable key={item.id} onPress={() => open(item)} style={styles.card}>
              <View style={styles.imageWrap}>
                {uri ? (
                  <Image resizeMode="contain" source={{ uri }} style={styles.image} />
                ) : null}
              </View>
              {item.category ? (
                <Text numberOfLines={1} style={styles.category}>
                  {item.category.toUpperCase()}
                </Text>
              ) : null}
              <Text numberOfLines={2} style={styles.name}>
                {item.name}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(price)}</Text>
                {original ? <Text style={styles.original}>{formatPrice(original)}</Text> : null}
              </View>
              {discount ? <Text style={styles.discount}>{discount}</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  title: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  row: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    width: 150,
  },
  imageWrap: {
    alignItems: 'center',
    backgroundColor: '#FCEBDC',
    borderRadius: 6,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  category: {
    color: '#C97D02',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  name: {
    color: colors.heading,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 4,
    minHeight: 34,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  price: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  original: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discount: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginTop: 2,
  },
});
