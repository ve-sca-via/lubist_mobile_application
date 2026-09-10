import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import {
  buildTaxonomyIndex,
  groupServicesByTaxonomy,
  resolveServiceTaxonomy,
  taxonomySearchText,
  TaxonomyEntry,
} from '@/features/vendor/utils/serviceTaxonomy';
import {
  useDeleteVendorService,
  useServiceCategories,
  useUpdateVendorService,
  useVendorServices,
  VendorService,
} from '@/services/api/hooks/useVendorAPI';
import { Screen } from '@/shared/components/Screen';
import { VendorStackParamList, VendorTabParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Navigation = BottomTabNavigationProp<VendorTabParamList>;

type GenderFilter = 'all' | 'male' | 'female' | 'both';
type StatusFilter = 'all' | 'active' | 'inactive';

const GENDER_FILTERS: Array<{ value: GenderFilter; label: string; icon?: keyof typeof Ionicons.glyphMap }> = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Men', icon: 'male-outline' },
  { value: 'female', label: 'Women', icon: 'female-outline' },
  { value: 'both', label: 'Unisex', icon: 'people-outline' },
];

const GENDER_TAG: Record<'male' | 'female' | 'both', { label: string; color: string }> = {
  male: { label: 'For men', color: '#0655ff' },
  female: { label: 'For women', color: '#cc4e95' },
  both: { label: 'Unisex', color: palette.primary },
};

function animateNext() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export function VendorServicesScreen() {
  const navigation = useNavigation<Navigation>();
  const stackNavigation = navigation.getParent<NativeStackNavigationProp<VendorStackParamList>>();

  const { salon, isPaymentPending } = useVendorPaymentGate();
  const { data: services, isLoading } = useVendorServices();
  const { data: categories } = useServiceCategories();
  const updateService = useUpdateVendorService();
  const deleteService = useDeleteVendorService();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => new Set());

  const taxonomyIndex = useMemo(() => buildTaxonomyIndex(categories ?? []), [categories]);

  const entries = useMemo<TaxonomyEntry[]>(
    () => (services ?? []).map((service) => ({ service, taxonomy: resolveServiceTaxonomy(service, taxonomyIndex) })),
    [services, taxonomyIndex],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter(({ service, taxonomy }) => {
      if (genderFilter !== 'all' && (service.gender_category ?? 'both') !== genderFilter) return false;
      if (statusFilter === 'active' && !service.is_active) return false;
      if (statusFilter === 'inactive' && service.is_active) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${service.name} ${service.description ?? ''} ${taxonomySearchText(taxonomy)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, genderFilter, statusFilter, search]);

  const groups = useMemo(
    () => groupServicesByTaxonomy(filteredEntries, taxonomyIndex),
    [filteredEntries, taxonomyIndex],
  );

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  function toggleCategory(categoryId: string) {
    animateNext();
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  async function handleToggleActive(service: VendorService) {
    try {
      await updateService.mutateAsync({
        serviceId: service.id,
        update: { is_active: !service.is_active },
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update service');
    }
  }

  function handleDelete(service: VendorService) {
    Alert.alert('Delete service', `Delete "${service.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteService.mutateAsync(service.id);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to delete service');
          }
        },
      },
    ]);
  }

  function handleEdit(service: VendorService) {
    stackNavigation?.navigate('ServiceConfigure', { serviceId: service.id });
  }

  return (
    <Screen scrollable>
      <Text style={styles.title}>Services Management</Text>
      <Text style={styles.subtitle}>Manage your salon services and pricing</Text>

      <Pressable onPress={() => stackNavigation?.navigate('ServiceAddWizard')}>
        <LinearGradient colors={['#f8ae3a', '#f89e07']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonLabel}>Add Service</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.filtersCard}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={palette.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Search services..."
            placeholderTextColor={palette.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {GENDER_FILTERS.map((filter) => {
            const active = genderFilter === filter.value;
            return (
              <Pressable
                key={filter.value}
                style={[styles.genderChip, active && styles.genderChipActive]}
                onPress={() => setGenderFilter(filter.value)}
              >
                {filter.icon ? (
                  <Ionicons name={filter.icon} size={14} color={active ? '#fff' : '#534433'} />
                ) : null}
                <Text style={[styles.genderChipLabel, active && styles.genderChipLabelActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {(['active', 'inactive'] as StatusFilter[]).map((filter) => (
            <Pressable
              key={filter}
              style={[styles.statusChip, statusFilter === filter && styles.statusChipActive]}
              onPress={() => setStatusFilter(statusFilter === filter ? 'all' : filter)}
            >
              <Text style={[styles.statusChipLabel, statusFilter === filter && styles.statusChipLabelActive]}>
                {filter[0].toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.count}>
        Showing {filteredEntries.length} of {services?.length ?? 0} services
      </Text>

      {isLoading && !services ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : filteredEntries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {services?.length ? 'No services match these filters' : 'No services yet — add your first one'}
          </Text>
        </View>
      ) : (
        groups.map((group) => {
          const collapsed = collapsedCategories.has(group.categoryId);
          return (
            <View key={group.categoryId} style={styles.categorySection}>
              <Pressable
                onPress={() => toggleCategory(group.categoryId)}
                style={styles.categoryHeader}
                hitSlop={4}
              >
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color="#867461"
                  style={collapsed ? styles.chevronCollapsed : undefined}
                />
                <Text style={styles.categoryHeading}>{group.categoryName.toUpperCase()}</Text>
                <Text style={styles.categoryCount}>
                  {group.count} {group.count === 1 ? 'service' : 'services'}
                </Text>
              </Pressable>

              {!collapsed && (
                <View style={styles.list}>
                  {group.subgroups.map((subgroup) => {
                    const showSubHeading = !(
                      group.subgroups.length === 1 && subgroup.subcategoryId === '__none__'
                    );
                    return (
                      <View key={subgroup.subcategoryId} style={styles.subgroup}>
                        {showSubHeading ? (
                          <View style={styles.subHeadingRow}>
                            <Text style={styles.subHeadingName}>{subgroup.subcategoryName}</Text>
                            <View style={styles.subCountBadge}>
                              <Text style={styles.subCountBadgeLabel}>{subgroup.services.length}</Text>
                            </View>
                            <View style={styles.subDivider} />
                          </View>
                        ) : null}
                        <View style={styles.list}>
                          {subgroup.services.map(({ service, taxonomy }) => {
                            const tag = GENDER_TAG[service.gender_category ?? 'both'];
                            const subType = taxonomy.subSubcategoryName;
                            const hasDiscount =
                              service.discounted_price != null && !!service.discount_percentage;
                            const displayPrice = hasDiscount ? service.discounted_price! : service.price;

                            return (
                              <View key={service.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                  <View style={styles.titleRow}>
                                    <Text style={styles.serviceName} numberOfLines={1}>
                                      {service.name}
                                    </Text>
                                    <Pressable onPress={() => handleEdit(service)} hitSlop={8}>
                                      <Ionicons name="pencil-outline" size={16} color="#636363" />
                                    </Pressable>
                                  </View>
                                  <Switch
                                    value={service.is_active}
                                    onValueChange={() => handleToggleActive(service)}
                                    trackColor={{ true: palette.primary, false: '#D1D5DB' }}
                                  />
                                </View>

                                {subType ? (
                                  <View style={styles.subTypeChip}>
                                    <Text style={styles.subTypeChipLabel}>{subType}</Text>
                                  </View>
                                ) : null}

                                {service.description ? (
                                  <Text style={styles.serviceDescription} numberOfLines={2}>
                                    {service.description}
                                  </Text>
                                ) : null}

                                <View style={styles.priceRow}>
                                  {hasDiscount ? (
                                    <>
                                      <Text style={styles.price}>₹{displayPrice}</Text>
                                      <Text style={styles.priceStrike}>₹{service.price}</Text>
                                      <View style={styles.discountBadge}>
                                        <Text style={styles.discountBadgeLabel}>
                                          {service.discount_percentage}% OFF
                                        </Text>
                                      </View>
                                    </>
                                  ) : (
                                    <Text style={styles.price}>
                                      {service.price === 0 ? 'FREE' : `₹${service.price}`}
                                    </Text>
                                  )}
                                  <View style={styles.durationWrap}>
                                    <Ionicons name="time-outline" size={14} color="#867461" />
                                    <Text style={styles.duration}>{service.duration_minutes} min</Text>
                                  </View>
                                </View>

                                <Text style={[styles.genderTag, { color: tag.color }]}>{tag.label}</Text>

                                <View style={styles.cardFooter}>
                                  <Pressable style={styles.editButton} onPress={() => handleEdit(service)}>
                                    <Ionicons name="pencil-outline" size={14} color={palette.primary} />
                                    <Text style={styles.editButtonLabel}>Edit</Text>
                                  </Pressable>
                                  <Pressable style={styles.deleteButton} onPress={() => handleDelete(service)}>
                                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                                  </Pressable>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 20,
    marginTop: 4,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 14,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: typography.weight.semibold,
  },
  filtersCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchWrap: {
    justifyContent: 'center',
  },
  searchIcon: {
    left: 12,
    position: 'absolute',
    zIndex: 1,
  },
  search: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    color: palette.text,
    fontSize: 14,
    paddingLeft: 41,
    paddingRight: 13,
    paddingVertical: 13,
  },
  chipRow: {
    flexGrow: 0,
  },
  genderChip: {
    alignItems: 'center',
    backgroundColor: '#eae0d3',
    borderColor: '#d5c6b6',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  genderChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  genderChipLabel: {
    color: '#534433',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
  genderChipLabelActive: {
    color: '#fff',
  },
  statusChip: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  statusChipLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  statusChipLabelActive: {
    color: '#fff',
  },
  count: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 24,
  },
  emptyCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  chevronCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },
  categoryHeading: {
    color: '#524533',
    fontSize: 12,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.2,
  },
  categoryCount: {
    color: '#867461',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  list: {
    gap: 16,
  },
  subgroup: {
    gap: 12,
  },
  subHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginLeft: 4,
  },
  subHeadingName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },
  subCountBadge: {
    backgroundColor: '#eae0d3',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  subCountBadgeLabel: {
    color: '#6b5844',
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
  subDivider: {
    backgroundColor: '#f0e0d1',
    flex: 1,
    height: 1,
  },
  card: {
    backgroundColor: '#fffdfc',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#543e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  serviceName: {
    color: '#111827',
    flexShrink: 1,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  subTypeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff1e6',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subTypeChipLabel: {
    color: '#865300',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  serviceDescription: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 8,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  price: {
    color: palette.primary,
    fontSize: 18,
    fontWeight: typography.weight.bold,
  },
  priceStrike: {
    color: '#9ca3af',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountBadgeLabel: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  durationWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginLeft: 'auto',
  },
  duration: {
    color: palette.muted,
    fontSize: 12,
  },
  genderTag: {
    fontSize: 12,
    fontWeight: typography.weight.medium,
    marginTop: 10,
  },
  cardFooter: {
    borderTopColor: '#f0e0d1',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
  },
  editButton: {
    alignItems: 'center',
    borderColor: palette.primary,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  editButtonLabel: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#fecaca',
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
