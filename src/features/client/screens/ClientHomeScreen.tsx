import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  ClientStackParamList,
  ClientTabParamList,
  SalonRouteData,
} from '@/navigation/navigation.types';
import { useDeviceLocation } from '@/services/location/useDeviceLocation';
import {
  useNearbySalons,
  useReverseGeocode,
  type NearbySalon,
} from '@/services/api/hooks/useLocationAPI';
import {
  usePublicSalons,
  businessTypeLabel,
  type Salon,
} from '@/services/api/hooks/useSalonsAPI';
import { useBanners, bannerImageUri, type Banner } from '@/services/api/hooks/useBannersAPI';
import { useAvailableCoupons, type AvailableCoupon } from '@/services/api/hooks/useBookingAPI';
import { useGetUserProfile } from '@/services/api/hooks/useAuthAPI';
import { resolveImageUrl } from '@/services/api/imageUrl';
import { displayRating } from '@/services/api/rating';

// Assets exported 1:1 from Figma ("HOmescreen").
const hero = require('@/assets/home/hero.png');
const nearbyLumiere = require('@/assets/home/nearby-lumiere.png');
const nearbyGlow = require('@/assets/home/nearby-glow.png');
const serviceImage = require('@/assets/home/service.png');
const brandHaircare = require('@/assets/home/brand-haircare.png');
const brandSkincare = require('@/assets/home/brand-skincare.png');
const brandMakeup = require('@/assets/home/brand-makeup.png');
const topLumina = require('@/assets/home/top-lumina.png');
const topAura = require('@/assets/home/top-aura.png');

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  muted2: '#867461',
  topHeading: '#655D52',
  serviceSub: '#7A7A7A',
  apptIcon: '#7B5548',
  border: '#E7D7C9',
  tan: '#F0E0D1',
  cardCream: '#FFF6EC',
  cardCream2: '#FFF1E6',
  offWhite: '#FFF8F4',
  apptBorder: '#EDBCAA',
  offerDark: '#2C2C2C',
  offerIconBg: '#FDEDDF',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  pill: 'rgba(240, 224, 209, 0.5)',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
  badgeDark: 'rgba(0, 0, 0, 0.3)',
  badgeBorder: 'rgba(255, 255, 255, 0.1)',
  onImage: 'rgba(255, 255, 255, 0.9)',
  onImageDivider: 'rgba(255, 255, 255, 0.3)',
  chipBg: '#EDE1D2',
  chipUnisex: '#6B6357',
  offerBorder: 'rgba(248, 158, 7, 0.2)',
  goldBorder: 'rgba(230, 194, 122, 0.8)',
  dotInactive: '#F0E0D1',
};

// A distinct establishment type present in the catalogue, built at runtime from
// the salons returned by the API (see ServicesForYou / serviceCategories).
type ServiceCategory = { type: string; label: string; count: number };

type Essential = {
  id: string;
  label: string;
  image?: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

const essentials: Essential[] = [
  { id: 'e1', label: 'Haircare', image: brandHaircare },
  { id: 'e2', label: 'Skincare', image: brandSkincare },
  { id: 'e3', label: 'Makeup', image: brandMakeup },
  { id: 'e4', label: 'Bath&Body', icon: 'ellipsis-horizontal' },
];

type HomeNavigation = BottomTabNavigationProp<ClientTabParamList>;

// Initials shown in the header profile avatar, e.g. "Jane Doe" -> "JD".
function initialsOf(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ClientHomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const parent = navigation.getParent<NativeStackNavigationProp<ClientStackParamList>>();
  const openSalon = (salon: SalonRouteData) => parent?.navigate('SalonDetails', { salon });
  const openCatalog = (category: string) => parent?.navigate('ProductCatalog', { category });
  const openOffers = () => parent?.navigate('Offers');
  const openDiscover = (initialQuery?: string) =>
    navigation.navigate('Discover', initialQuery ? { initialQuery } : undefined);
  const openBusinessType = (type: string, title: string) =>
    navigation.navigate('Discover', { businessType: type, title });

  const { data: profile } = useGetUserProfile();
  const initials = initialsOf(profile?.user?.full_name);

  // Saved salons/products screen (the cart lives in the bottom nav now).
  const openSaved = () => parent?.navigate('Saved');

  // Resolve a banner's tap target: external URLs open in the browser; recognised
  // in-app links (offers/salon/product/catalog/discover) navigate within the app.
  const handleBannerPress = (banner: Banner) => {
    const raw = banner.link_url?.trim();
    if (!raw) return;
    if (/^https?:\/\//i.test(raw)) {
      Linking.openURL(raw).catch(() => {});
      return;
    }
    const target = parseInAppBannerLink(raw);
    if (!target) return;
    switch (target.type) {
      case 'offers':
        openOffers();
        break;
      case 'salon':
        openSalon({ id: target.id, name: '', location: '', rating: '' });
        break;
      case 'product':
        parent?.navigate('ProductDetail', { productId: target.id });
        break;
      case 'catalog':
        openCatalog(target.category);
        break;
      case 'discover':
        openDiscover(target.query);
        break;
    }
  };

  // Platform-wide coupons for the "Current Offers" carousel (informational).
  const { data: availableOffers } = useAvailableCoupons();
  const offers = availableOffers ?? [];

  const { coords, permission, loading: locLoading, refetch: refetchLocation } = useDeviceLocation();
  const { data: geo } = useReverseGeocode(coords?.latitude ?? null, coords?.longitude ?? null);
  const nearby = useNearbySalons({
    lat: coords?.latitude ?? null,
    lon: coords?.longitude ?? null,
    radius: 15,
    limit: 10,
  });

  // Top salons: highest-rated public salons (rating, then review count).
  const publicSalons = usePublicSalons({ limit: 50 });
  const topSalons = useMemo(() => {
    const list = publicSalons.data?.salons ?? [];
    return [...list]
      .sort(
        (a, b) =>
          (b.average_rating ?? 0) - (a.average_rating ?? 0) ||
          (b.total_reviews ?? 0) - (a.total_reviews ?? 0),
      )
      .slice(0, 5);
  }, [publicSalons.data]);

  // "Services for you": the distinct establishment types actually present in the
  // catalogue (with a count each), so the section reflects real data instead of a
  // hardcoded list. Ordered by how many salons offer each type.
  const serviceCategories = useMemo<ServiceCategory[]>(() => {
    const list = publicSalons.data?.salons ?? [];
    const counts = new Map<string, number>();
    for (const salon of list) {
      const type = salon.business_type;
      if (!type) continue;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, label: businessTypeLabel(type) }));
  }, [publicSalons.data]);

  const openTopSalon = (s: Salon) =>
    openSalon({
      id: s.id,
      name: s.business_name,
      location: [s.city, s.state].filter(Boolean).join(', '),
      rating: displayRating(s.average_rating, s.total_reviews).label,
      reviewCount: s.total_reviews ?? 0,
      heroImage: s.logo_url ?? s.cover_images?.[0] ?? undefined,
    });

  const locationLabel = locLoading
    ? 'Detecting your location…'
    : permission === 'denied'
      ? 'Location access is off'
      : geo?.address || 'Location unavailable';

  const openNearbySalon = (s: NearbySalon) => {
    const distance = s.distance_km != null ? `${s.distance_km.toFixed(1)} km` : '';
    openSalon({
      id: s.id,
      name: s.business_name,
      location: [s.city, s.state].filter(Boolean).join(', '),
      rating: displayRating(s.average_rating, s.total_reviews).label,
      reviewCount: s.total_reviews ?? 0,
      distance,
      heroImage: s.logo_url ?? s.cover_images?.[0] ?? undefined,
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <Header
        label={locationLabel}
        denied={permission === 'denied'}
        initials={initials}
        onPressLocation={refetchLocation}
        onPressProfile={() => parent?.navigate('Profile')}
        onPressSaved={openSaved}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroCarousel onPressBanner={handleBannerPress} />
        <SearchBar onSubmit={openDiscover} />
        <AppointmentsCard onPress={() => navigation.navigate('Bookings')} />

        {offers.length > 0 ? (
          <>
            <SectionTitle text="CURRENT OFFERS" />
            <ScrollView
              contentContainerStyle={styles.offersRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {offers.map((offer) => (
                <OfferCard key={offer.id} coupon={offer} />
              ))}
            </ScrollView>
            <PaginationDots activeIndex={0} count={offers.length} />
          </>
        ) : null}

        <NearYouSection
          salons={nearby.data?.salons ?? []}
          loading={nearby.isLoading}
          isError={nearby.isError}
          hasLocation={coords != null}
          denied={permission === 'denied'}
          onEnableLocation={refetchLocation}
          onOpen={openNearbySalon}
          onSeeAll={() =>
            navigation.navigate(
              'Discover',
              coords
                ? {
                    nearby: { lat: coords.latitude, lon: coords.longitude, radius: 15 },
                    title: 'Salons Near You',
                  }
                : undefined,
            )
          }
        />

        <ServicesForYou categories={serviceCategories} onOpen={openBusinessType} />

        <BeautyEssentials onOpen={openCatalog} />

        <TopSalonsSection
          salons={topSalons}
          loading={publicSalons.isLoading}
          isError={publicSalons.isError}
          onOpen={openTopSalon}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({
  label,
  denied,
  initials,
  onPressLocation,
  onPressProfile,
  onPressSaved,
}: {
  label: string;
  denied: boolean;
  initials: string;
  onPressLocation: () => void;
  onPressProfile: () => void;
  onPressSaved: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerLeft} onPress={onPressLocation}>
        <View style={styles.locationRow}>
          <Ionicons color={colors.gold} name="location-sharp" size={13} />
          <Text style={styles.locationLabel}>{denied ? 'LOCATION OFF' : 'YOUR LOCATION'}</Text>
          <Ionicons color={colors.muted} name={denied ? 'refresh' : 'chevron-down'} size={13} />
        </View>
        <Text numberOfLines={1} style={styles.addressText}>{label}</Text>
      </Pressable>

      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="Saved"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onPressSaved}
          style={styles.cartIconButton}
        >
          <Ionicons color={colors.heading} name="heart-outline" size={20} />
        </Pressable>
        <Pressable hitSlop={8} onPress={onPressProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// Width of a full-bleed hero card: screen width minus the scroll content's
// horizontal padding (16 each side).
const HERO_WIDTH = Dimensions.get('window').width - 32;

/**
 * Home-screen hero carousel, driven by admin-managed banners (useBanners).
 * Falls back to the bundled hero asset while loading or when no banners exist,
 * so the screen never looks broken. Banners with a `link_url` are tappable;
 * the parent resolves the target (external URL vs in-app deep link).
 */
function HeroCarousel({ onPressBanner }: { onPressBanner: (banner: Banner) => void }) {
  const { data, isLoading } = useBanners();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);

  const banners = data?.banners ?? [];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    indexRef.current = index;
    if (index !== activeIndex) setActiveIndex(index);
  };

  // Auto-advance every 4s. A manual swipe updates indexRef (via onScroll), so the
  // next tick continues from wherever the user left off. Re-armed when the banner
  // count changes; no timer for 0/1 banners.
  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % banners.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * HERO_WIDTH, animated: true });
    }, 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  // Fallback: bundled hero while loading or when there are no active banners.
  if (isLoading || banners.length === 0) {
    return (
      <View style={styles.heroBanner}>
        <Image source={hero} style={styles.heroImage} />
      </View>
    );
  }

  // Single banner: no need for a pager.
  if (banners.length === 1) {
    return <HeroSlide banner={banners[0]} onPress={onPressBanner} />;
  }

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {banners.map((banner) => (
          <HeroSlide key={banner.id} banner={banner} onPress={onPressBanner} />
        ))}
      </ScrollView>
      <PaginationDots activeIndex={activeIndex} count={banners.length} />
    </View>
  );
}

function HeroSlide({ banner, onPress }: { banner: Banner; onPress: (b: Banner) => void }) {
  const remote = bannerImageUri(banner);
  const tappable = Boolean(banner.link_url?.trim());
  return (
    <Pressable
      disabled={!tappable}
      onPress={() => onPress(banner)}
      style={[styles.heroBanner, { width: HERO_WIDTH }]}
    >
      <Image
        source={remote ? { uri: remote } : hero}
        style={styles.heroImage}
        accessibilityLabel={banner.title ?? 'Promotional banner'}
      />
    </Pressable>
  );
}

function SearchBar({ onSubmit }: { onSubmit: (query?: string) => void }) {
  const [value, setValue] = useState('');
  const submit = () => onSubmit(value.trim() || undefined);
  return (
    <View style={styles.searchBar}>
      <Ionicons color={colors.placeholder} name="search-outline" size={20} />
      <TextInput
        placeholder="Search salons by name or city"
        placeholderTextColor={colors.placeholder}
        style={styles.searchInput}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        returnKeyType="search"
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <Pressable hitSlop={8} onPress={submit}>
          <Ionicons color={colors.gold} name="arrow-forward-circle" size={22} />
        </Pressable>
      ) : null}
    </View>
  );
}

function AppointmentsCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.appointmentsCard}>
      <View style={styles.appointmentsLeft}>
        <View style={styles.appointmentsIcon}>
          <Ionicons color={colors.apptIcon} name="calendar-outline" size={18} />
        </View>
        <Text style={styles.appointmentsText}>My Appointments</Text>
      </View>
      <Ionicons color={colors.muted2} name="chevron-forward" size={18} />
    </Pressable>
  );
}

function OfferCard({ coupon }: { coupon: AvailableCoupon }) {
  const subtitle = coupon.subtitle ?? coupon.title ?? 'Apply this code at checkout.';
  return (
    <LinearGradient
      colors={[colors.cardCream, '#FCEBDC']}
      end={{ x: 0.2, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.offerCard}
    >
      <View style={styles.offerTopRow}>
        <View style={styles.offerIcon}>
          <Ionicons color={colors.gold} name="pricetag" size={14} />
        </View>
        <Text style={styles.offerTitle}>{coupon.summary}</Text>
      </View>
      <Text style={styles.offerSubtitle}>{subtitle}</Text>
      <View style={styles.offerCodeChip}>
        <Text style={styles.offerCode}>{coupon.code}</Text>
      </View>
    </LinearGradient>
  );
}

function NearYouSection({
  salons,
  loading,
  isError,
  hasLocation,
  denied,
  onEnableLocation,
  onOpen,
  onSeeAll,
}: {
  salons: NearbySalon[];
  loading: boolean;
  isError: boolean;
  hasLocation: boolean;
  denied: boolean;
  onEnableLocation: () => void;
  onOpen: (salon: NearbySalon) => void;
  onSeeAll: () => void;
}) {
  const fallbackImages = [nearbyLumiere, nearbyGlow];

  const renderBody = () => {
    if (denied || !hasLocation) {
      return (
        <Pressable onPress={onEnableLocation} style={styles.nearYouStateBox}>
          <Ionicons color={colors.gold} name="location-outline" size={22} />
          <Text style={styles.nearYouStateText}>
            Turn on location to see salons near you.
          </Text>
          <Text style={styles.nearYouStateAction}>Enable location</Text>
        </Pressable>
      );
    }
    if (loading) {
      return (
        <View style={styles.nearYouStateBox}>
          <ActivityIndicator color={colors.gold} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.nearYouStateBox}>
          <Text style={styles.nearYouStateText}>Couldn't load nearby salons.</Text>
        </View>
      );
    }
    if (salons.length === 0) {
      return (
        <View style={styles.nearYouStateBox}>
          <Text style={styles.nearYouStateText}>No salons found near you yet.</Text>
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={styles.nearYouRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {salons.map((salon, index) => {
          const remote = resolveImageUrl(salon.logo_url ?? salon.cover_images?.[0]);
          return (
            <NearYouCard
              key={salon.id}
              imageSource={remote ? { uri: remote } : fallbackImages[index % fallbackImages.length]}
              location={[salon.city, salon.state].filter(Boolean).join(', ') || 'Nearby'}
              name={salon.business_name}
              onPress={() => onOpen(salon)}
              pills={[salon.city].filter(Boolean) as string[]}
              rating={displayRating(salon.average_rating, salon.total_reviews).label}
              timing={salon.distance_km != null ? `${salon.distance_km.toFixed(1)} km` : ''}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>NEAR YOU</Text>
        <Pressable style={styles.seeAll} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>SEE ALL </Text>
          <Ionicons color={colors.gold} name="chevron-forward" size={12} />
        </Pressable>
      </View>

      {renderBody()}
    </View>
  );
}

function NearYouCard({
  imageSource,
  location,
  name,
  onPress,
  pills,
  rating,
  timing,
}: {
  imageSource: ImageSourcePropType;
  location: string;
  name: string;
  onPress: () => void;
  pills: string[];
  rating: string;
  timing: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.nearYouCard}>
      <View style={styles.nearYouImageWrap}>
        <Image source={imageSource} style={styles.nearYouImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={styles.nearYouGradient}
        />

        <View style={styles.nearYouBadges}>
          <View style={styles.nearYouHeart}>
            <Ionicons color={colors.white} name="heart-outline" size={14} />
          </View>
          <View style={styles.nearYouRating}>
            <Ionicons color={colors.white} name="star" size={11} />
            <Text style={styles.nearYouRatingText}>{rating}</Text>
          </View>
        </View>

        <View style={styles.nearYouContent}>
          <Text style={styles.nearYouName}>{name}</Text>
          <View style={styles.nearYouMetaRow}>
            <View style={styles.nearYouMeta}>
              <Ionicons color={colors.onImage} name="location-outline" size={12} />
              <Text style={styles.nearYouMetaText}>{location}</Text>
            </View>
            {timing ? (
              <>
                <View style={styles.nearYouMetaDivider} />
                <View style={styles.nearYouMeta}>
                  <Ionicons color={colors.onImage} name="navigate-outline" size={12} />
                  <Text style={styles.nearYouMetaText}>{timing}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.servicePills}>
        {pills.map((pill) => (
          <View key={pill} style={styles.servicePill}>
            <Text style={styles.servicePillText}>{pill}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function ServicesForYou({
  categories,
  onOpen,
}: {
  categories: ServiceCategory[];
  onOpen: (type: string, title: string) => void;
}) {
  // Nothing to show until the catalogue loads (or if no salon has a type set).
  if (categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.dividerHeading}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerTitle}>SERVICES FOR YOU</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.servicesGrid}>
        {categories.map((category) => (
          <Pressable
            key={category.type}
            onPress={() => onOpen(category.type, category.label)}
            style={styles.serviceCard}
          >
            <View style={styles.serviceText}>
              <Text style={styles.serviceTitle}>{category.label}</Text>
              <Text style={styles.serviceSubtitle}>
                {category.count} {category.count === 1 ? 'place' : 'places'}
              </Text>
            </View>
            <Image source={serviceImage} style={styles.serviceThumb} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BeautyEssentials({ onOpen }: { onOpen: (category: string) => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>BEAUTY ESSENTIALS</Text>
        <Ionicons color={colors.text} name="arrow-forward" size={16} />
      </View>

      <View style={styles.essentialsRow}>
        {essentials.map((item) => (
          <Pressable key={item.id} onPress={() => onOpen(item.label)} style={styles.essentialItem}>
            <View style={styles.essentialCircle}>
              {item.image ? (
                <Image source={item.image} style={styles.essentialImage} />
              ) : item.icon ? (
                <Ionicons color={colors.muted2} name={item.icon} size={24} />
              ) : null}
            </View>
            <Text style={styles.essentialLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TopSalonsSection({
  salons,
  loading,
  isError,
  onOpen,
}: {
  salons: Salon[];
  loading: boolean;
  isError: boolean;
  onOpen: (salon: Salon) => void;
}) {
  const fallbackImages = [topLumina, topAura];

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.nearYouStateBox}>
          <ActivityIndicator color={colors.gold} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.nearYouStateBox}>
          <Text style={styles.nearYouStateText}>Couldn't load top salons.</Text>
        </View>
      );
    }
    if (salons.length === 0) {
      return (
        <View style={styles.nearYouStateBox}>
          <Text style={styles.nearYouStateText}>No salons available yet.</Text>
        </View>
      );
    }
    return (
      <View style={styles.topRatedList}>
        {salons.map((salon, index) => {
          const remote = resolveImageUrl(salon.logo_url ?? salon.cover_images?.[0]);
          const { hasRating, label } = displayRating(salon.average_rating, salon.total_reviews);
          const chips = [
            salon.salon_type ? salon.salon_type.replace(/_/g, ' ').toUpperCase() : null,
            salon.city,
          ].filter(Boolean) as string[];
          return (
            <TopSalonCard
              key={salon.id}
              chips={chips}
              hasRating={hasRating}
              imageSource={remote ? { uri: remote } : fallbackImages[index % fallbackImages.length]}
              location={[salon.city, salon.state].filter(Boolean).join(', ') || 'Salon'}
              name={salon.business_name}
              onPress={() => onOpen(salon)}
              rating={label}
              reviews={salon.total_reviews ?? 0}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, styles.topRatedHeading]}>TOP SALONS</Text>
      {renderBody()}
    </View>
  );
}

function TopSalonCard({
  chips,
  hasRating,
  imageSource,
  location,
  name,
  onPress,
  rating,
  reviews,
}: {
  chips: string[];
  hasRating: boolean;
  imageSource: ImageSourcePropType;
  location: string;
  name: string;
  onPress: () => void;
  rating: string;
  reviews: number;
}) {
  return (
    <Pressable onPress={onPress} style={styles.topRatedCard}>
      <View style={styles.topRatedImageWrap}>
        <Image source={imageSource} style={styles.topRatedImage} />
        {hasRating ? (
          <View style={styles.topRatedOffer}>
            <Text style={styles.topRatedOfferText}>★ {rating}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.topRatedContent}>
        <View style={styles.topRatedTitleRow}>
          <Text numberOfLines={1} style={styles.topRatedName}>{name}</Text>
          <View style={styles.topRatedRating}>
            <Ionicons color={colors.gold} name="star" size={12} />
            <Text style={styles.topRatedRatingText}>
              {rating}
              {hasRating && reviews > 0 ? ` (${reviews})` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.topRatedMeta}>
          <Ionicons color={colors.text} name="location-outline" size={14} />
          <Text numberOfLines={1} style={styles.topRatedMetaText}>{location}</Text>
        </View>
        {chips.length ? (
          <View style={styles.topRatedChips}>
            {chips.map((chip, index) => (
              <View key={chip} style={styles.topRatedChip}>
                <Text style={[styles.topRatedChipText, index === 0 && styles.topRatedChipUnisex]}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>{text}</Text>;
}

type BannerTarget =
  | { type: 'offers' }
  | { type: 'salon'; id: string }
  | { type: 'product'; id: string }
  | { type: 'catalog'; category: string }
  | { type: 'discover'; query?: string };

/**
 * Parse a non-http banner `link_url` into an in-app navigation target.
 *
 * Admins enter these free-form in the banner form, so we accept a few tolerant
 * shapes (case-insensitive), with either `:` or `/` separators and an optional
 * `scheme://` or `host/` prefix:
 *   offers                        → Offers screen
 *   salon:<id>   | salons/<id>    → Salon details
 *   product:<id> | products/<id>  → Product details
 *   catalog/<category>            → Product catalog for a category
 *   search/<term> | discover[/<term>] → Discover (optionally pre-filled)
 * Returns null for anything unrecognised (the tap is then a no-op).
 */
function parseInAppBannerLink(raw: string): BannerTarget | null {
  // Drop a leading scheme (lubist://) and any host so "lubist.app/offers" and
  // "/offers" and "offers" all normalise to the same path.
  let path = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  if (path.includes('/') && !path.startsWith('/')) {
    // Strip a bare host prefix like "lubist.app/offers" but keep "salon/123".
    const [head, ...rest] = path.split('/');
    if (head.includes('.')) path = rest.join('/');
  }
  path = path.replace(/^\/+/, '').replace(/[?#].*$/, '').trim();
  if (!path) return null;

  const [rawKey, ...rawParts] = path.split(/[:/]/).filter(Boolean);
  const key = rawKey.toLowerCase();
  const arg = rawParts.join('/').trim();

  switch (key) {
    case 'offers':
    case 'offer':
    case 'coupons':
      return { type: 'offers' };
    case 'salon':
    case 'salons':
      return arg ? { type: 'salon', id: arg } : null;
    case 'product':
    case 'products':
      return arg ? { type: 'product', id: arg } : null;
    case 'catalog':
    case 'shop':
      return arg ? { type: 'catalog', category: arg } : null;
    case 'search':
    case 'discover':
    case 'salons-list':
      return { type: 'discover', query: arg || undefined };
    default:
      return null;
  }
}

function PaginationDots({ activeIndex, count }: { activeIndex: number; count: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[styles.dot, index === activeIndex && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationLabel: {
    color: colors.muted2,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  addressText: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cartIconButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.goldBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderColor: colors.white,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: colors.white,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
  },
  heroBanner: {
    borderRadius: 16,
    elevation: 4,
    height: 160,
    overflow: 'hidden',
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
    height: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  appointmentsCard: {
    alignItems: 'center',
    backgroundColor: colors.cardCream,
    borderColor: colors.apptBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  appointmentsLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  appointmentsIcon: {
    alignItems: 'center',
    backgroundColor: colors.offerIconBg,
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  appointmentsText: {
    color: colors.text,
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 1.1,
  },
  sectionTitleSpaced: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  offersRow: {
    gap: 12,
    marginTop: 14,
    paddingRight: 8,
  },
  offerCard: {
    borderColor: colors.offerBorder,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 220,
  },
  offerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  offerIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  offerTitle: {
    color: colors.offerDark,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  offerSubtitle: {
    color: colors.text,
    fontFamily: 'Inter_300Light',
    fontSize: 10,
    lineHeight: 14.4,
  },
  offerCodeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.offerBorder,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offerCode: {
    color: colors.offerDark,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    backgroundColor: colors.dotInactive,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.gold,
    width: 18,
  },
  seeAll: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  seeAllText: {
    color: colors.gold,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.7,
  },
  nearYouRow: {
    gap: 16,
    paddingRight: 8,
  },
  nearYouStateBox: {
    alignItems: 'center',
    backgroundColor: colors.cardCream,
    borderColor: colors.apptBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  nearYouStateText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  nearYouStateAction: {
    color: colors.gold,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  nearYouCard: {
    gap: 12,
    width: 240,
  },
  nearYouImageWrap: {
    borderRadius: 24,
    height: 160,
    overflow: 'hidden',
  },
  nearYouImage: {
    height: '100%',
    width: '100%',
  },
  nearYouGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  nearYouBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  nearYouHeart: {
    alignItems: 'center',
    backgroundColor: colors.badgeDark,
    borderColor: colors.badgeBorder,
    borderRadius: 12,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    marginRight: 'auto',
    width: 28,
  },
  nearYouRating: {
    alignItems: 'center',
    backgroundColor: colors.badgeDark,
    borderColor: colors.badgeBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nearYouRatingText: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  nearYouContent: {
    bottom: 12,
    gap: 4,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  nearYouName: {
    color: colors.white,
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
  },
  nearYouMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nearYouMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  nearYouMetaText: {
    color: colors.onImage,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  nearYouMetaDivider: {
    backgroundColor: colors.onImageDivider,
    height: 12,
    width: 1,
  },
  servicePills: {
    flexDirection: 'row',
    gap: 8,
  },
  servicePill: {
    backgroundColor: colors.pill,
    borderColor: colors.pillBorder,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  servicePillText: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  dividerHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerTitle: {
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: 1.4,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceCard: {
    alignItems: 'center',
    backgroundColor: colors.cardCream,
    borderRadius: 18,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 84,
    overflow: 'hidden',
    padding: 16,
    shadowColor: 'rgba(44, 44, 44, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    width: '47%',
  },
  serviceText: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  serviceTitle: {
    color: colors.heading,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  serviceSubtitle: {
    color: colors.serviceSub,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  serviceThumb: {
    borderRadius: 12,
    height: 52,
    width: 52,
  },
  essentialsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  essentialItem: {
    alignItems: 'center',
    gap: 8,
  },
  essentialCircle: {
    alignItems: 'center',
    backgroundColor: colors.tan,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  essentialImage: {
    height: 40,
    width: 40,
  },
  essentialLabel: {
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  topRatedHeading: {
    color: colors.topHeading,
    marginBottom: 16,
  },
  topRatedList: {
    gap: 16,
  },
  topRatedCard: {
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
  topRatedImageWrap: {
    height: 180,
    position: 'relative',
  },
  topRatedImage: {
    height: '100%',
    width: '100%',
  },
  topRatedOffer: {
    backgroundColor: colors.white,
    borderBottomRightRadius: 8,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 0,
  },
  topRatedOfferText: {
    color: colors.gold,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
  },
  topRatedFav: {
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
  topRatedContent: {
    gap: 8,
    padding: 16,
  },
  topRatedTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRatedName: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    paddingRight: 10,
  },
  topRatedRating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  topRatedRatingText: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  topRatedMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  topRatedMetaText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  topRatedChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  topRatedChip: {
    backgroundColor: colors.chipBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topRatedChipText: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  topRatedChipUnisex: {
    color: colors.chipUnisex,
  },
});
