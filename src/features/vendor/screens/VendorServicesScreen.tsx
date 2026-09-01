import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { buildTaxonomyIndex, resolveServiceTaxonomy } from '@/features/vendor/utils/serviceTaxonomy';
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

  const taxonomyIndex = useMemo(() => buildTaxonomyIndex(categories ?? []), [categories]);

  const filtered = useMemo(() => {
    return (services ?? []).filter((service) => {
      if (genderFilter !== 'all' && (service.gender_category ?? 'both') !== genderFilter) return false;
      if (statusFilter === 'active' && !service.is_active) return false;
      if (statusFilter === 'inactive' && service.is_active) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const resolved = resolveServiceTaxonomy(service, taxonomyIndex);
        const path = [resolved?.categoryName, resolved?.subcategoryName, resolved?.subSubcategoryName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const haystack = `${service.name} ${service.description ?? ''} ${path}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [services, genderFilter, statusFilter, search, taxonomyIndex]);

  const grouped = useMemo(() => {
    const groups = new Map<string, VendorService[]>();
    for (const service of filtered) {
      const resolved = resolveServiceTaxonomy(service, taxonomyIndex);
      const key = resolved?.categoryName ?? 'Other Services';
      const list = groups.get(key) ?? [];
      list.push(service);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filtered, taxonomyIndex]);

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
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
        Showing {filtered.length} of {services?.length ?? 0} services
      </Text>

      {isLoading && !services ? (
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {services?.length ? 'No services match these filters' : 'No services yet — add your first one'}
          </Text>
        </View>
      ) : (
        grouped.map(([categoryName, categoryServices]) => (
          <View key={categoryName} style={styles.categorySection}>
            <Text style={styles.categoryHeading}>{categoryName.toUpperCase()}</Text>
            <View style={styles.list}>
              {categoryServices.map((service) => {
                const tag = GENDER_TAG[service.gender_category ?? 'both'];
                return (
                  <View key={service.id} style={styles.card}>
                    <Text style={[styles.genderTag, { color: tag.color }]}>{tag.label}</Text>
                    <View style={styles.serviceHeader}>
                      <View style={styles.titleRow}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Pressable
                          onPress={() => stackNavigation?.navigate('ServiceConfigure', { serviceId: service.id })}
                        >
                          <Ionicons name="pencil-outline" size={16} color={palette.muted} />
                        </Pressable>
                      </View>
                      <View style={styles.headerActions}>
                        <Pressable onPress={() => handleDelete(service)}>
                          <Ionicons name="trash-outline" size={18} color="#c5221f" />
                        </Pressable>
                        <Switch
                          value={service.is_active}
                          onValueChange={() => handleToggleActive(service)}
                          trackColor={{ true: palette.primary }}
                        />
                      </View>
                    </View>
                    {service.description ? (
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                      </Text>
                    ) : null}
                    <View style={styles.priceRow}>
                      {service.discounted_price != null && service.discount_percentage ? (
                        <>
                          <Text style={styles.price}>₹{service.discounted_price}</Text>
                          <Text style={styles.priceStrike}>₹{service.price}</Text>
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeLabel}>{service.discount_percentage}% OFF</Text>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.price}>{service.price === 0 ? 'FREE' : `₹${service.price}`}</Text>
                      )}
                      <Text style={styles.duration}>{service.duration_minutes} min</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))
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
    marginBottom: 24,
  },
  categoryHeading: {
    color: '#524533',
    fontSize: 12,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  list: {
    gap: 12,
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
  genderTag: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    marginBottom: 4,
  },
  serviceHeader: {
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
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  serviceDescription: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 8,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
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
  duration: {
    color: palette.muted,
    fontSize: 12,
    marginLeft: 'auto',
  },
});
