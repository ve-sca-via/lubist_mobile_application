import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useSalonServices, type SalonService } from '@/services/api/hooks/useSalonsAPI';
import { useCart, useAddToCart, useRemoveCartItem } from '@/services/api/hooks/useBookingAPI';
import { resolveImageUrl } from '@/services/api/imageUrl';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  contentBg: '#FCFCFB',
  searchBg: '#F9FAFB',
  searchBorder: '#E5E7EB',
  circleBg: '#F3F4F6',
  catLabel: '#4B5563',
  catActive: '#111827',
  underline: '#0891B2',
  accordionBorder: 'rgba(243, 244, 246, 0.5)',
  accordionTitle: '#111827',
  serviceIcon: '#F3B7C0',
  serviceTitle: '#222222',
  serviceNote: '#8E98A8',
  servicePrice: '#000000',
  strike: '#9CA3AF',
  addBorder: '#E7D7C9',
  gold: '#F89E07',
  divider: '#EAEAEA',
  heading: '#221A11',
  back: '#1F2937',
  placeholder: '#534433',
  cartBar: '#221A11',
  white90: 'rgba(255,255,255,0.85)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList>;
type Route = RouteProp<ClientStackParamList, 'SalonServices'>;

const priceText = (v: number) => `₹${Math.round(v)}`;
const UNCATEGORIZED = '__uncategorized__';

interface Category {
  id: string;
  name: string;
  icon_url?: string | null;
}

export function SalonServicesScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { salonId, salonName } = route.params;

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  const servicesQuery = useSalonServices(salonId);
  const cart = useCart();
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

  const services = servicesQuery.data?.services ?? [];

  // Distinct categories from the service taxonomy, in first-seen order.
  const categories: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    for (const s of services) {
      const c = s.taxonomy?.category;
      const id = c?.id ?? UNCATEGORIZED;
      if (!map.has(id)) map.set(id, { id, name: c?.name ?? 'Other', icon_url: c?.icon_url });
    }
    return Array.from(map.values());
  }, [services]);

  const activeCat = selectedCat ?? categories[0]?.id ?? null;

  // Services in the active category, filtered by search, grouped by subcategory.
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const inCat = services.filter((s) => {
      const catId = s.taxonomy?.category?.id ?? UNCATEGORIZED;
      if (activeCat && catId !== activeCat) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const map = new Map<string, { id: string; name: string; items: SalonService[] }>();
    for (const s of inCat) {
      const sub = s.taxonomy?.subcategory;
      const id = sub?.id ?? '__general__';
      if (!map.has(id)) map.set(id, { id, name: sub?.name ?? 'General', items: [] });
      map.get(id)!.items.push(s);
    }
    return Array.from(map.values());
  }, [services, activeCat, search]);

  const cartItems = cart.data?.items ?? [];
  const itemCount = cart.data?.item_count ?? 0;
  const totalAmount = cart.data?.total_amount ?? 0;
  const busy = isAdding || isRemoving;
  const cartItemFor = (serviceId: string) => cartItems.find((i) => i.service_id === serviceId);

  const toggleService = (svc: SalonService) => {
    const existing = cartItemFor(svc.id);
    if (existing) removeItem(existing.id);
    else addToCart({ service_id: svc.id, salon_id: salonId, quantity: 1 });
  };

  const toggleSub = (id: string) => setOpenSubs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={colors.back} name="arrow-back" size={24} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {salonName ?? 'Services'}
        </Text>
        <View style={styles.headerSpacer} />
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Ionicons color={colors.heading} name="cart-outline" size={24} />
        </Pressable>
      </View>

      {servicesQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : servicesQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Couldn't load services.</Text>
          <Pressable onPress={() => servicesQuery.refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>This salon has no services listed.</Text>
        </View>
      ) : (
        <>
          <View style={styles.filterSection}>
            <View style={styles.searchInput}>
              <Ionicons color={colors.serviceNote} name="search-outline" size={18} />
              <TextInput
                placeholder="Search for a service..."
                placeholderTextColor={colors.placeholder}
                style={styles.searchText}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.categoryRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categories.map((category) => {
                const isActive = category.id === activeCat;
                const icon = resolveImageUrl(category.icon_url);
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCat(category.id)}
                    style={styles.categoryItem}
                  >
                    <View style={styles.categoryCircle}>
                      {icon ? (
                        <Image source={{ uri: icon }} style={styles.categoryImage} />
                      ) : (
                        <Ionicons color={colors.catLabel} name="sparkles-outline" size={26} />
                      )}
                    </View>
                    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                      {category.name}
                    </Text>
                    {isActive ? <View style={styles.categoryUnderline} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.contentArea}>
              {groups.length === 0 ? (
                <Text style={styles.emptyText}>No services match your search.</Text>
              ) : (
                groups.map((group) => {
                  const isOpen = !!openSubs[group.id];
                  return (
                    <View key={group.id} style={styles.accordion}>
                      <Pressable onPress={() => toggleSub(group.id)} style={styles.accordionHeader}>
                        <Text style={styles.accordionTitle}>
                          {group.name} ({group.items.length})
                        </Text>
                        <Ionicons
                          color={colors.accordionTitle}
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={20}
                        />
                      </Pressable>

                      {isOpen ? (
                        <View style={styles.serviceList}>
                          {group.items.map((svc, index) => {
                            const inCart = !!cartItemFor(svc.id);
                            const hasDiscount =
                              svc.discounted_price != null && svc.discounted_price < svc.price;
                            return (
                              <View key={svc.id}>
                                {index > 0 ? <View style={styles.divider} /> : null}
                                <View style={styles.serviceItem}>
                                  <View style={styles.serviceInfo}>
                                    <View style={styles.serviceAccent} />
                                    <Text style={styles.serviceTitle}>{svc.name}</Text>
                                    {svc.description ? (
                                      <Text numberOfLines={2} style={styles.serviceNote}>
                                        {svc.description}
                                      </Text>
                                    ) : null}
                                    <Text style={styles.serviceMeta}>{svc.duration_minutes} min</Text>
                                    <View style={styles.priceRow}>
                                      {hasDiscount ? (
                                        <Text style={styles.strike}>{priceText(svc.price)}</Text>
                                      ) : null}
                                      <Text style={styles.servicePrice}>
                                        {priceText(hasDiscount ? (svc.discounted_price as number) : svc.price)}
                                      </Text>
                                    </View>
                                  </View>

                                  <Pressable
                                    disabled={busy}
                                    onPress={() => toggleService(svc)}
                                    style={[styles.addButton, inCart && styles.addButtonActive]}
                                  >
                                    <Ionicons
                                      color={inCart ? colors.white : colors.gold}
                                      name={inCart ? 'checkmark' : 'add'}
                                      size={14}
                                    />
                                    <Text style={[styles.addButtonText, inCart && styles.addButtonTextActive]}>
                                      {inCart ? 'ADDED' : 'ADD'}
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </>
      )}

      {itemCount > 0 ? (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate('SelectTime', { salonId, salonName })}>
          <View>
            <Text style={styles.cartBarCount}>
              {itemCount} {itemCount === 1 ? 'service' : 'services'} • {priceText(totalAmount)}
            </Text>
            <Text style={styles.cartBarHint}>Service total — fee shown at payment</Text>
          </View>
          <View style={styles.cartBarCta}>
            <Text style={styles.cartBarCtaText}>Select time</Text>
            <Ionicons color={colors.white} name="arrow-forward" size={18} />
          </View>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: { alignItems: 'center', backgroundColor: colors.white, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16 },
  backButton: { paddingRight: 8 },
  headerTitle: { color: colors.heading, flexShrink: 1, fontFamily: 'Poppins_700Bold', fontSize: 20, marginLeft: 8 },
  headerSpacer: { flex: 1 },
  stateBox: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 24 },
  stateText: { color: colors.serviceNote, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  filterSection: { backgroundColor: colors.white, gap: 16, paddingBottom: 16, paddingHorizontal: 16, paddingTop: 4 },
  searchInput: {
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderColor: colors.searchBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  searchText: { color: colors.placeholder, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  categoryRow: { gap: 24, paddingRight: 8 },
  categoryItem: { alignItems: 'center', gap: 8, paddingBottom: 12 },
  categoryCircle: {
    alignItems: 'center',
    backgroundColor: colors.circleBg,
    borderRadius: 9999,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  categoryImage: { height: '100%', width: '100%' },
  categoryLabel: { color: colors.catLabel, fontFamily: 'Montserrat_500Medium', fontSize: 12 },
  categoryLabelActive: { color: colors.catActive, fontFamily: 'Montserrat_600SemiBold' },
  categoryUnderline: { backgroundColor: colors.underline, borderRadius: 2, bottom: 0, height: 3, position: 'absolute', width: '70%' },
  scrollContent: { paddingBottom: 140 },
  contentArea: { backgroundColor: colors.contentBg, gap: 16, paddingBottom: 48, paddingHorizontal: 16, paddingTop: 16 },
  emptyText: { color: colors.serviceNote, fontFamily: 'Inter_400Regular', fontSize: 14, paddingVertical: 32, textAlign: 'center' },
  accordion: {
    backgroundColor: colors.white,
    borderColor: colors.accordionBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  accordionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  accordionTitle: { color: colors.accordionTitle, fontFamily: 'Poppins_600SemiBold', fontSize: 16, letterSpacing: -0.4 },
  serviceList: { gap: 16, paddingBottom: 20, paddingHorizontal: 20 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  serviceInfo: { flex: 1, paddingRight: 16 },
  serviceAccent: { backgroundColor: colors.serviceIcon, borderRadius: 2, height: 4, marginBottom: 6, width: 18 },
  serviceTitle: { color: colors.serviceTitle, fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 22 },
  serviceNote: { color: colors.serviceNote, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 4 },
  serviceMeta: { color: colors.serviceNote, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 6 },
  priceRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 6 },
  strike: { color: colors.strike, fontFamily: 'Inter_400Regular', fontSize: 13, textDecorationLine: 'line-through' },
  servicePrice: { color: colors.servicePrice, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.addBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  addButtonActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  addButtonText: { color: colors.gold, fontFamily: 'Montserrat_700Bold', fontSize: 13 },
  addButtonTextActive: { color: colors.white },
  divider: { backgroundColor: colors.divider, height: 1 },
  cartBar: {
    alignItems: 'center',
    backgroundColor: colors.cartBar,
    borderRadius: 16,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: 'absolute',
    right: 16,
  },
  cartBarCount: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  cartBarHint: { color: colors.white90, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  cartBarCta: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  cartBarCtaText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
