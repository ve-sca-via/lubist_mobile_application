import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PaymentLockedNotice } from '@/features/vendor/components/PaymentLockedNotice';
import { useVendorPaymentGate } from '@/features/vendor/hooks/useVendorPaymentGate';
import { useUpdateVendorSalon, VendorSalon, VendorSalonUpdate } from '@/services/api/hooks/useVendorAPI';
import {
  getAgreementDocumentSignedUrl,
  pickDocument,
  pickImage,
  uploadAgreementDocument,
  uploadSalonImage,
} from '@/services/upload/uploadService';
import { useAuth } from '@/store/AuthContext';
import { Screen } from '@/shared/components/Screen';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const FACILITIES: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'free_wifi', label: 'Free Wi-Fi', icon: 'wifi-outline' },
  { key: 'car_parking', label: 'Parking', icon: 'car-outline' },
  { key: 'air_conditioner', label: 'Air Conditioning', icon: 'snow-outline' },
  { key: 'shower_facility', label: 'Shower', icon: 'water-outline' },
  { key: 'steam_room', label: 'Steam', icon: 'cloud-outline' },
  { key: 'hygienic_environment', label: 'Hygienic', icon: 'shield-checkmark-outline' },
  { key: 'comfortable_seating', label: 'Seating', icon: 'body-outline' },
  { key: 'sanitized_tools', label: 'Sanitized Tools', icon: 'construct-outline' },
];

function facilityKey(key: string): string {
  return `facility_${key}`;
}

function buildFormData(salon: VendorSalon): VendorSalonUpdate {
  return {
    business_name: salon.business_name ?? '',
    phone: salon.phone ?? '',
    address: salon.address ?? '',
    city: salon.city ?? '',
    state: salon.state ?? '',
    pincode: salon.pincode ?? '',
    description: salon.description ?? '',
    outlet: salon.outlet ?? null,
    is_gst: salon.is_gst ?? false,
    gst_number: salon.gst_number ?? '',
    business_hours: salon.business_hours ?? {},
    logo_url: salon.logo_url ?? null,
    cover_images: salon.cover_images ?? [],
    agreement_document_url: salon.agreement_document_url ?? null,
    facilities: salon.facilities ?? {},
  };
}

export function VendorProfileScreen() {
  const { signOut } = useAuth();
  const { salon, isPaymentPending, isLoading } = useVendorPaymentGate();
  const updateSalon = useUpdateVendorSalon();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<VendorSalonUpdate>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (salon) setForm(buildFormData(salon));
  }, [salon]);

  if (isLoading && !salon) {
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (isPaymentPending) {
    return <PaymentLockedNotice feeAmount={salon?.registration_fee_amount} />;
  }

  if (!salon) return null;

  function set<K extends keyof VendorSalonUpdate>(key: K, value: VendorSalonUpdate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDayHours(day: string, value: string) {
    setForm((prev) => ({ ...prev, business_hours: { ...(prev.business_hours ?? {}), [day]: value } }));
  }

  function setFacility(key: string, value: boolean) {
    setForm((prev) => ({ ...prev, facilities: { ...(prev.facilities ?? {}), [facilityKey(key)]: value } }));
  }

  async function toggleAcceptingBookings(next: boolean) {
    try {
      await updateSalon.mutateAsync({ accepting_bookings: next });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update booking status');
    }
  }

  async function handleUploadLogo() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('logo');
      const result = await uploadSalonImage(asset, 'logos');
      set('logo_url', result.url);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload logo');
    } finally {
      setUploading(null);
    }
  }

  async function handleUploadCover() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('cover');
      const result = await uploadSalonImage(asset, 'covers');
      const gallery = (form.cover_images ?? []).slice(1);
      set('cover_images', [result.url, ...gallery]);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload cover image');
    } finally {
      setUploading(null);
    }
  }

  async function handleAddGalleryImage() {
    try {
      const asset = await pickImage();
      if (!asset) return;
      setUploading('gallery');
      const result = await uploadSalonImage(asset, 'gallery');
      const current = form.cover_images ?? [];
      const cover = current[0];
      const gallery = current.slice(1);
      set('cover_images', cover ? [cover, ...gallery, result.url] : [result.url, ...gallery]);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload gallery image');
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryImage(index: number) {
    const current = form.cover_images ?? [];
    const cover = current[0];
    const gallery = current.slice(1);
    gallery.splice(index, 1);
    set('cover_images', cover ? [cover, ...gallery] : gallery);
  }

  async function handleUploadAgreement() {
    try {
      const asset = await pickDocument();
      if (!asset) return;
      setUploading('agreement');
      const result = await uploadAgreementDocument(asset);
      set('agreement_document_url', result.path);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload document');
    } finally {
      setUploading(null);
    }
  }

  async function handleViewAgreement() {
    if (!form.agreement_document_url) return;
    try {
      const { signedUrl } = await getAgreementDocumentSignedUrl(form.agreement_document_url);
      await Linking.openURL(signedUrl);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not open document');
    }
  }

  async function handleSave() {
    try {
      await updateSalon.mutateAsync(form);
      setIsEditing(false);
      Alert.alert('Saved', 'Salon profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save salon profile');
    }
  }

  function handleCancel() {
    // `salon` is guaranteed defined here — the component returns early above when it's not.
    setForm(buildFormData(salon!));
    setIsEditing(false);
  }

  const galleryImages = (form.cover_images ?? []).slice(1);
  const coverImage = form.cover_images?.[0];

  return (
    <Screen scrollable>
      <Text style={styles.title}>Salon Profile</Text>
      <Text style={styles.subtitle}>Manage your business details and public presence.</Text>

      <View style={[styles.statusCard, !salon.is_active && styles.statusCardInactive]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIconWrap, !salon.is_active && styles.statusIconWrapInactive]}>
            <Ionicons
              name={salon.is_active ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={salon.is_active ? '#22c55e' : '#a3691a'}
            />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={[styles.statusTitle, !salon.is_active && styles.statusTitleInactive]}>
              Status: {salon.is_active ? 'Active' : 'Inactive'}
            </Text>
            <Text style={[styles.statusBody, !salon.is_active && styles.statusBodyInactive]}>
              {salon.is_active
                ? 'Your salon is visible to customers and accepting bookings.'
                : 'Complete payment to activate your salon and start accepting bookings.'}
            </Text>
          </View>
        </View>
        <View style={styles.acceptingRow}>
          <Text style={styles.acceptingLabel}>Accepting new bookings</Text>
          <Switch
            value={salon.accepting_bookings}
            onValueChange={toggleAcceptingBookings}
            trackColor={{ true: palette.primary }}
          />
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        {!isEditing ? (
          <Pressable style={styles.editRow} onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil-outline" size={13} color={palette.primary} />
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleCancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.card}>
        <FieldBox label="Business Name" value={form.business_name} editable={isEditing} onChangeText={(v) => set('business_name', v)} />
        <FieldBox label="Email Address" value={salon.email ?? ''} editable={false} />
        <FieldBox label="Phone Number" value={form.phone} editable={isEditing} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
        <FieldBox label="Street Address" value={form.address} editable={isEditing} onChangeText={(v) => set('address', v)} multiline />
        <FieldBox label="State" value={form.state} editable={isEditing} onChangeText={(v) => set('state', v)} />
        <FieldBox label="City" value={form.city} editable={isEditing} onChangeText={(v) => set('city', v)} />
        <FieldBox label="Pincode" value={form.pincode} editable={isEditing} onChangeText={(v) => set('pincode', v)} keyboardType="number-pad" />
        <FieldBox label="Shop Description" value={form.description ?? ''} editable={isEditing} onChangeText={(v) => set('description', v)} multiline />

        <Text style={[styles.fieldLabel, styles.spaced]}>Business Hours</Text>
        {DAYS.map((day) => {
          const value = form.business_hours?.[day] ?? 'Closed';
          const isClosed = value === 'Closed';
          return (
            <View key={day} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.dayInput}
                  value={value}
                  placeholder="9:00 AM - 6:00 PM"
                  placeholderTextColor="#9a9a9a"
                  onChangeText={(v) => setDayHours(day, v)}
                />
              ) : (
                <Text style={isClosed ? styles.dayValueMuted : styles.dayValue}>{value}</Text>
              )}
              {isEditing ? (
                <Pressable onPress={() => setDayHours(day, isClosed ? '9:00 AM - 6:00 PM' : 'Closed')}>
                  <Text style={styles.toggleDayLabel}>{isClosed ? 'Set Hours' : 'Closed'}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}

        {isEditing ? (
          <Pressable style={styles.saveButton} disabled={updateSalon.isPending} onPress={handleSave}>
            <Ionicons name="checkmark-outline" size={16} color="#fff" />
            <Text style={styles.saveButtonLabel}>{updateSalon.isPending ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
      <View style={styles.facilitiesGrid}>
        {FACILITIES.map((facility) => {
          const checked = !!form.facilities?.[facilityKey(facility.key)];
          return (
            <Pressable
              key={facility.key}
              style={[styles.facilityChip, checked && styles.facilityChipActive]}
              disabled={!isEditing}
              onPress={() => setFacility(facility.key, !checked)}
            >
              <Ionicons name={facility.icon} size={14} color={checked ? '#fff' : '#534433'} />
              <Text style={[styles.facilityLabel, checked && styles.facilityLabelActive]}>{facility.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Ionicons name="images-outline" size={18} color={palette.text} />
        <Text style={[styles.sectionTitle, styles.sectionTitleInline]}>Salon Images</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.imagesRow}>
          <View style={styles.imageColumn}>
            <Text style={styles.imageLabel}>Cover Image</Text>
            <View style={styles.coverImageWrap}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
              ) : (
                <View style={[styles.coverImage, styles.imagePlaceholder]} />
              )}
              {isEditing ? (
                <Pressable
                  style={styles.imageEditBadge}
                  disabled={uploading === 'cover'}
                  onPress={handleUploadCover}
                >
                  <Ionicons name="camera-outline" size={13} color={palette.text} />
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.imageColumn}>
            <Text style={styles.imageLabel}>Logo</Text>
            <View style={styles.logoWrap}>
              {form.logo_url ? (
                <Image source={{ uri: form.logo_url }} style={styles.logoImage} />
              ) : (
                <View style={[styles.logoImage, styles.imagePlaceholder]} />
              )}
              {isEditing ? (
                <Pressable style={styles.imageEditBadge} disabled={uploading === 'logo'} onPress={handleUploadLogo}>
                  <Ionicons name="camera-outline" size={11} color={palette.text} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <Text style={[styles.imageLabel, styles.spaced]}>Gallery ({galleryImages.length})</Text>
        <View style={styles.galleryGrid}>
          {galleryImages.map((url, idx) => (
            <View key={url + idx} style={styles.galleryItem}>
              <Image source={{ uri: url }} style={styles.galleryImage} />
              {isEditing ? (
                <Pressable style={styles.galleryRemoveBadge} onPress={() => removeGalleryImage(idx)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              ) : null}
            </View>
          ))}
          {isEditing ? (
            <Pressable
              style={styles.galleryAddTile}
              disabled={uploading === 'gallery'}
              onPress={handleAddGalleryImage}
            >
              <Ionicons name="add-outline" size={18} color="#7a7a7a" />
              <Text style={styles.galleryAddLabel}>
                {uploading === 'gallery' ? 'Uploading…' : 'Upload'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Agreement Document</Text>
      <View style={styles.card}>
        {form.agreement_document_url ? (
          <View style={styles.documentUploaded}>
            <View style={styles.documentIconWrap}>
              <Ionicons name="document-text-outline" size={16} color="#22c55e" />
            </View>
            <Text style={styles.documentUploadedLabel}>Document Uploaded</Text>
          </View>
        ) : (
          <Text style={styles.dayValueMuted}>No document uploaded</Text>
        )}
        <View style={styles.documentActions}>
          {form.agreement_document_url ? (
            <Pressable style={styles.outlinedButton} onPress={handleViewAgreement}>
              <Text style={styles.outlinedButtonLabel}>View Document</Text>
            </Pressable>
          ) : null}
          {isEditing ? (
            <Pressable
              style={styles.outlinedButton}
              disabled={uploading === 'agreement'}
              onPress={handleUploadAgreement}
            >
              <Text style={styles.outlinedButtonLabel}>
                {uploading === 'agreement'
                  ? 'Uploading…'
                  : form.agreement_document_url
                    ? 'Replace Document'
                    : 'Upload Document'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Registration Status</Text>
          <Text style={styles.statsValueGreen}>{salon.registration_fee_paid ? 'Paid' : 'Pending'}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Account Status</Text>
          <Text style={styles.statsValueGreen}>{salon.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
        <View style={[styles.statsRow, styles.statsRowLast]}>
          <Text style={styles.statsLabel}>Member Since</Text>
          <Text style={styles.statsValueDark}>{new Date(salon.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

function FieldBox({
  label,
  value,
  editable,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value?: string | null;
  editable: boolean;
  onChangeText?: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'phone-pad' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, multiline && styles.fieldBoxMultiline]}>
        {editable ? (
          <TextInput
            style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
            value={value ?? ''}
            onChangeText={onChangeText}
            multiline={multiline}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.fieldValue}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  title: {
    color: '#2c2c2c',
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: '#7a7a7a',
    fontSize: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#dcfce7',
    borderColor: 'rgba(34,197,94,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  statusCardInactive: {
    backgroundColor: '#fdf1de',
    borderColor: 'rgba(163,105,26,0.2)',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  statusIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  statusIconWrapInactive: {
    backgroundColor: 'rgba(163,105,26,0.1)',
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  statusTitleInactive: {
    color: '#a3691a',
  },
  statusBody: {
    color: 'rgba(34,197,94,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  statusBodyInactive: {
    color: '#a3691a',
  },
  acceptingRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
  },
  acceptingLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#2c2c2c',
    fontSize: 20,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleInline: {
    marginBottom: 0,
    marginTop: 0,
  },
  editRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  editLabel: {
    color: palette.primary,
    fontSize: 14,
  },
  cancelLabel: {
    color: '#7a7a7a',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    padding: 22,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#2c2c2c',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldBox: {
    backgroundColor: 'rgba(243,243,243,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldBoxMultiline: {
    minHeight: 60,
  },
  fieldValue: {
    color: '#1a1c1c',
    fontSize: 14,
  },
  fieldInput: {
    color: '#1a1c1c',
    fontSize: 14,
    padding: 0,
  },
  fieldInputMultiline: {
    minHeight: 40,
    textAlignVertical: 'top',
  },
  spaced: {
    marginTop: 8,
  },
  dayRow: {
    alignItems: 'center',
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayLabel: {
    color: '#2c2c2c',
    fontSize: 13,
    fontWeight: typography.weight.medium,
    width: 80,
  },
  dayValue: {
    color: '#1a1c1c',
    flex: 1,
    fontSize: 13,
  },
  dayValueMuted: {
    color: '#9a9a9a',
    flex: 1,
    fontSize: 13,
  },
  dayInput: {
    backgroundColor: 'rgba(243,243,243,0.7)',
    borderRadius: 8,
    color: '#1a1c1c',
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleDayLabel: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 16,
  },
  saveButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: typography.weight.medium,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  facilityChip: {
    alignItems: 'center',
    backgroundColor: '#eae0d3',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  facilityChipActive: {
    backgroundColor: palette.primary,
  },
  facilityLabel: {
    color: '#534433',
    fontSize: 13,
  },
  facilityLabelActive: {
    color: '#fff',
    fontWeight: typography.weight.medium,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 20,
  },
  imageColumn: {
    gap: 12,
  },
  imageLabel: {
    color: '#7a7a7a',
    fontSize: 13,
  },
  coverImageWrap: {
    position: 'relative',
    width: 142,
  },
  coverImage: {
    borderRadius: 16,
    height: 100,
    width: 142,
  },
  logoWrap: {
    position: 'relative',
    width: 96,
  },
  logoImage: {
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    height: 96,
    width: 96,
  },
  imagePlaceholder: {
    backgroundColor: '#f3f3f3',
  },
  imageEditBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    justifyContent: 'center',
    padding: 6,
    position: 'absolute',
    right: 6,
    top: 6,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryItem: {
    position: 'relative',
  },
  galleryImage: {
    borderRadius: 12,
    height: 72,
    width: 72,
  },
  galleryRemoveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    justifyContent: 'center',
    padding: 3,
    position: 'absolute',
    right: 4,
    top: 4,
  },
  galleryAddTile: {
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 6,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  galleryAddLabel: {
    color: '#7a7a7a',
    fontSize: 10,
  },
  documentUploaded: {
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: 'rgba(34,197,94,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  documentIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  documentUploadedLabel: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: typography.weight.medium,
  },
  documentActions: {
    gap: 10,
  },
  outlinedButton: {
    alignItems: 'center',
    borderColor: palette.primary,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
  },
  outlinedButtonLabel: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: typography.weight.medium,
  },
  statsCard: {
    backgroundColor: '#fff6ec',
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    padding: 22,
  },
  statsRow: {
    borderBottomColor: 'rgba(0,0,0,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statsRowLast: {
    borderBottomWidth: 0,
  },
  statsLabel: {
    color: '#7a7a7a',
    fontSize: 13,
  },
  statsValueGreen: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: typography.weight.bold,
  },
  statsValueDark: {
    color: '#2c2c2c',
    fontSize: 13,
    fontWeight: typography.weight.bold,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 14,
  },
  signOutLabel: {
    color: palette.surface,
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
});
