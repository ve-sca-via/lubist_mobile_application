import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { resolveImageUrl } from '@/services/api/imageUrl';
import { displayRating } from '@/services/api/rating';
import { salonAddress } from '@/services/api/salonLocation';
import { useRelatedSalons, type Salon } from '@/services/api/hooks/useSalonsAPI';

type Navigation = NativeStackNavigationProp<ClientStackParamList>;

const colors = {
  heading: '#221A11',
  gold: '#F89E07',
  muted: '#5D5F5F',
  white: '#FFFFFF',
  border: '#F0E0D1',
};

function salonLocation(s: Salon) {
  return salonAddress(s);
}

/**
 * "Related Salons" row shown at the bottom of the salon detail screen.
 *
 * Reads the backend /salons/{id}/related endpoint (same-city first, then
 * backfilled) and renders a horizontally scrollable strip of compact salon
 * cards. Renders nothing while loading or when there's nothing related. Tapping
 * a card pushes a fresh SalonDetails so the back button returns to the current
 * salon.
 */
export function RelatedSalonsSection({ salonId }: { salonId?: string }) {
  const navigation = useNavigation<Navigation>();
  const { data, isLoading } = useRelatedSalons(salonId);
  const salons = data?.salons ?? [];

  if (isLoading || salons.length === 0) return null;

  const open = (s: Salon) =>
    navigation.push('SalonDetails', {
      salon: {
        id: s.id,
        name: s.business_name,
        location: salonLocation(s),
        rating: displayRating(s.average_rating, s.total_reviews).label,
        reviewCount: s.total_reviews ?? 0,
        heroImage: s.logo_url ?? s.cover_images?.[0] ?? undefined,
      },
    });

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Related Salons</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {salons.map((item) => {
          const uri = resolveImageUrl(item.logo_url ?? item.cover_images?.[0] ?? null);
          const rating = displayRating(item.average_rating, item.total_reviews);
          const location = salonLocation(item);
          return (
            <Pressable key={item.id} onPress={() => open(item)} style={styles.card}>
              <View style={styles.imageWrap}>
                {uri ? (
                  <Image resizeMode="cover" source={{ uri }} style={styles.image} />
                ) : null}
                <View style={styles.ratingBadge}>
                  <Ionicons color={colors.gold} name="star" size={10} />
                  <Text style={styles.ratingText}>{rating.label}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.name}>
                {item.business_name}
              </Text>
              {location ? (
                <View style={styles.locationRow}>
                  <Ionicons color={colors.muted} name="location-outline" size={12} />
                  <Text numberOfLines={1} style={styles.location}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
    overflow: 'hidden',
    paddingBottom: 10,
    width: 200,
  },
  imageWrap: {
    backgroundColor: '#FCEBDC',
    height: 120,
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 4,
    bottom: 8,
    flexDirection: 'row',
    gap: 3,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
  },
  ratingText: {
    color: colors.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  name: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginHorizontal: 10,
    marginTop: 8,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 10,
    marginTop: 4,
  },
  location: {
    color: colors.muted,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
