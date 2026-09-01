import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ServiceCategoryNode,
  ServiceSubcategoryNode,
  useServiceCategories,
  useUpdateVendorService,
  useVendorServices,
  VendorServiceUpdate,
} from '@/services/api/hooks/useVendorAPI';
import { pickImage, uploadSalonImage } from '@/services/upload/uploadService';
import { Screen } from '@/shared/components/Screen';
import { VendorStackParamList } from '@/navigation/navigation.types';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type Navigation = NativeStackNavigationProp<VendorStackParamList>;
type Route = RouteProp<VendorStackParamList, 'ServiceConfigure'>;

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
const GENDER_OPTIONS: Array<{ value: 'male' | 'female' | 'both'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'male', label: 'Male', icon: 'male-outline' },
  { value: 'female', label: 'Female', icon: 'female-outline' },
  { value: 'both', label: 'Unisex', icon: 'people-outline' },
];

export function VendorServiceConfigureScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();

  const { data: services, isLoading: servicesLoading } = useVendorServices();
  const { data: categories } = useServiceCategories();
  const updateService = useUpdateVendorService();

  const service = useMemo(
    () => services?.find((s) => s.id === route.params.serviceId),
    [services, route.params.serviceId],
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [genderCategory, setGenderCategory] = useState<'male' | 'female' | 'both'>('both');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!service) return;
    setName(service.name);
    setDescription(service.description ?? '');
    setPrice(String(service.price));
    setDiscountPercentage(service.discount_percentage != null ? String(service.discount_percentage) : '');
    setDurationMinutes(service.duration_minutes);
    setGenderCategory(service.gender_category ?? 'both');
    setCategoryId(service.category_id ?? undefined);
    setSubcategoryId(service.subcategory_id ?? undefined);
    setIsActive(service.is_active);
    setImageUrl(service.image_url ?? undefined);
  }, [service]);

  if (servicesLoading && !services) {
    return (
      <View style={styles.screen}>
        <Header onBack={() => navigation.goBack()} />
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.screen}>
        <Header onBack={() => navigation.goBack()} />
        <Text style={styles.emptyText}>Service not found.</Text>
      </View>
    );
  }

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  async function handleUploadImage() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading(true);
      const result = await uploadSalonImage(asset, 'gallery');
      setImageUrl(result.url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const priceValue = Number(price);
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Invalid name', 'Service name must be at least 2 characters.');
      return;
    }
    if (Number.isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Invalid price', 'Enter a valid price (0 or more).');
      return;
    }
    const discountValue = discountPercentage.trim() ? Number(discountPercentage) : null;
    if (discountValue != null && (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100)) {
      Alert.alert('Invalid discount', 'Discount must be between 0 and 100.');
      return;
    }
    if (discountValue && priceValue <= 0) {
      Alert.alert('Invalid discount', 'Discount can only be applied to services with a price greater than 0.');
      return;
    }

    const update: VendorServiceUpdate = {
      name: name.trim(),
      description: description.trim() || null,
      duration_minutes: durationMinutes,
      price: priceValue,
      discount_percentage: discountValue,
      gender_category: genderCategory,
      category_id: categoryId ?? null,
      subcategory_id: subcategoryId ?? null,
      is_active: isActive,
      image_url: imageUrl ?? null,
    };

    try {
      await updateService.mutateAsync({ serviceId: service!.id, update });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save service');
    }
  }

  return (
    <View style={styles.screen}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <FieldLabel>Service Name</FieldLabel>
          <View style={styles.fieldBox}>
            <TextInput style={styles.fieldInput} value={name} onChangeText={setName} />
          </View>

          <FieldLabel spaced>Category</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(categories ?? []).map((cat: ServiceCategoryNode) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setSubcategoryId(undefined);
                }}
              >
                <Text style={[styles.chipLabel, categoryId === cat.id && styles.chipLabelActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {subcategories.length > 0 ? (
            <>
              <FieldLabel spaced>Subcategory</FieldLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {subcategories.map((sub: ServiceSubcategoryNode) => (
                  <Pressable
                    key={sub.id}
                    style={[styles.chip, subcategoryId === sub.id && styles.chipActive]}
                    onPress={() => setSubcategoryId(sub.id)}
                  >
                    <Text style={[styles.chipLabel, subcategoryId === sub.id && styles.chipLabelActive]}>
                      {sub.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

          <FieldLabel spaced>Duration</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DURATION_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                style={[styles.chip, durationMinutes === minutes && styles.chipActive]}
                onPress={() => setDurationMinutes(minutes)}
              >
                <Text style={[styles.chipLabel, durationMinutes === minutes && styles.chipLabelActive]}>
                  {minutes} min
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <FieldLabel spaced>Gender</FieldLabel>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => {
              const active = genderCategory === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.genderButton, active && styles.genderButtonActive]}
                  onPress={() => setGenderCategory(opt.value)}
                >
                  <Ionicons name={opt.icon} size={16} color={active ? palette.primary : '#241b14'} />
                  <Text style={[styles.genderLabel, active && styles.genderLabelActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel spaced>Description</FieldLabel>
          <View style={[styles.fieldBox, styles.fieldBoxMultiline]}>
            <TextInput
              style={[styles.fieldInput, styles.multiline]}
              value={description}
              onChangeText={(v) => setDescription(v.slice(0, 250))}
              placeholder="Provide a detailed description of the service..."
              placeholderTextColor="#6b7280"
              multiline
            />
          </View>
          <Text style={styles.charCount}>{description.length} / 250 characters</Text>

          <FieldLabel spaced>Base Price (₹)</FieldLabel>
          <View style={styles.fieldBox}>
            <TextInput style={styles.fieldInput} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>

          <FieldLabel spaced>Discount % (optional)</FieldLabel>
          <View style={styles.fieldBox}>
            <TextInput
              style={styles.fieldInput}
              value={discountPercentage}
              onChangeText={setDiscountPercentage}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.activeRow}>
            <Text style={styles.activeLabel}>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: palette.primary }} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeadingRow}>
            <Ionicons name="images-outline" size={18} color="#1a1c1c" />
            <Text style={styles.cardHeading}>Images</Text>
          </View>
          <Pressable style={styles.uploadZone} disabled={uploading} onPress={handleUploadImage}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name="cloud-upload-outline" size={16} color="#524533" />
            </View>
            <Text style={styles.uploadZoneLabel}>{uploading ? 'Uploading…' : 'Click to upload'}</Text>
          </Pressable>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.imageThumb} /> : null}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonLabel}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveButton} disabled={updateService.isPending} onPress={handleSave}>
            <Text style={styles.saveButtonLabel}>{updateService.isPending ? 'Saving…' : 'Save Service'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color="#1a1c1c" />
      </Pressable>
      <Text style={styles.headerTitle}>Configure Service</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

function FieldLabel({ children, spaced }: { children: React.ReactNode; spaced?: boolean }) {
  return <Text style={[styles.fieldLabel, spaced && styles.fieldLabelSpaced]}>{String(children).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#f89e07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  headerTitle: {
    color: '#1a1c1c',
    fontSize: 17,
    fontWeight: typography.weight.semibold,
  },
  loader: { marginTop: 40 },
  emptyText: { color: palette.muted, fontSize: 14, padding: 20 },
  body: {
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
  },
  cardHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  cardHeading: {
    color: '#1a1c1c',
    fontSize: 20,
    fontWeight: typography.weight.medium,
  },
  fieldLabel: {
    color: '#524533',
    fontSize: 11,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  fieldBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fieldBoxMultiline: {
    minHeight: 80,
  },
  fieldInput: {
    color: '#1a1c1c',
    fontSize: 15,
    padding: 0,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#524533',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  chip: {
    backgroundColor: '#f3f3f3',
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: palette.primary,
  },
  chipLabel: {
    color: '#1a1c1c',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  chipLabelActive: {
    color: '#fff',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    alignItems: 'center',
    borderColor: '#e8e4df',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingVertical: 14,
  },
  genderButtonActive: {
    backgroundColor: 'rgba(159,79,45,0.08)',
    borderColor: palette.primary,
    borderWidth: 2,
  },
  genderLabel: {
    color: '#241b14',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  genderLabelActive: {
    color: palette.primary,
  },
  activeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  activeLabel: {
    color: '#524533',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  uploadZone: {
    alignItems: 'center',
    borderColor: 'rgba(215,195,172,0.5)',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 8,
    paddingVertical: 18,
  },
  uploadIconWrap: {
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  uploadZoneLabel: {
    color: '#1a1c1c',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  imageThumb: {
    borderRadius: 6,
    height: 48,
    marginTop: 12,
    width: 48,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    flex: 2,
    paddingVertical: 14,
  },
  saveButtonLabel: {
    color: palette.surface,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
});
