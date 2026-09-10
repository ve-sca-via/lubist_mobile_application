import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

type SectionKey = 'basic' | 'hours' | 'facilities' | 'images' | 'agreement';

const ALL_SECTIONS_OPEN: Record<SectionKey, boolean> = {
  basic: true,
  hours: true,
  facilities: true,
  images: true,
  agreement: true,
};

const DEFAULT_SECTIONS_OPEN: Record<SectionKey, boolean> = {
  basic: true,
  hours: false,
  facilities: false,
  images: false,
  agreement: false,
};

function facilityKey(key: string): string {
  return `facility_${key}`;
}

// Business hours are stored/sent as "9:00 AM - 6:00 PM" (or "Closed") strings —
// same format the salon-admin web app uses — so the native time picker just
// needs to convert to/from that string; no backend or schema change needed.
const DEFAULT_START_TIME = '9:00 AM';
const DEFAULT_END_TIME = '6:00 PM';

function parseTimeToDate(time12h: string): Date {
  const date = new Date();
  date.setSeconds(0, 0);
  const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    date.setHours(9, 0);
    return date;
  }
  const [, hourStr, minuteStr, period] = match;
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  date.setHours(hours, minutes);
  return date;
}

function formatTimeFromDate(date: Date): string {
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function splitDayHours(value: string): { start: string; end: string } {
  if (value && value.includes(' - ')) {
    const [start, end] = value.split(' - ');
    if (start && end) return { start, end };
  }
  return { start: DEFAULT_START_TIME, end: DEFAULT_END_TIME };
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
    gst_number: salon.gst_number ?? null,
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
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(DEFAULT_SECTIONS_OPEN);

  // iOS has no imperative time-dialog API like Android does, so a picked time
  // is only committed on "Done" — the spinner keeps firing onChange as the
  // user scrolls, which would otherwise write a half-scrolled value into form.
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [pickerDraftValue, setPickerDraftValue] = useState<Date>(new Date());
  const pickerOnPickRef = useRef<((date: Date) => void) | null>(null);

  useEffect(() => {
    if (salon) setForm(buildFormData(salon));
  }, [salon]);

  if (isLoading && !salon) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ActivityIndicator color={palette.primary} style={styles.loader} />
      </SafeAreaView>
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

  function openTimePicker(value: Date, onPick: (date: Date) => void) {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'time',
        is24Hour: false,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onPick(selected);
        },
      });
      return;
    }
    setPickerDraftValue(value);
    pickerOnPickRef.current = onPick;
    setIosPickerVisible(true);
  }

  function confirmIosPicker() {
    pickerOnPickRef.current?.(pickerDraftValue);
    setIosPickerVisible(false);
  }

  function setFacility(key: string, value: boolean) {
    setForm((prev) => ({ ...prev, facilities: { ...(prev.facilities ?? {}), [facilityKey(key)]: value } }));
  }

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleStartEdit() {
    setIsEditing(true);
    // Editing touches every section, so expand them all rather than making
    // the vendor hunt through collapsed cards to find what they meant to change.
    setOpenSections(ALL_SECTIONS_OPEN);
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
      setOpenSections(DEFAULT_SECTIONS_OPEN);
      Alert.alert('Saved', 'Salon profile updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save salon profile');
    }
  }

  function handleCancel() {
    // `salon` is guaranteed defined here — the component returns early above when it's not.
    setForm(buildFormData(salon!));
    setIsEditing(false);
    setOpenSections(DEFAULT_SECTIONS_OPEN);
  }

  const galleryImages = (form.cover_images ?? []).slice(1);
  const coverImage = form.cover_images?.[0];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isEditing && styles.scrollContentEditing]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Salon Profile</Text>
            <Text style={styles.subtitle}>Manage your business details and public presence.</Text>
          </View>
          {!isEditing ? (
            <Pressable style={styles.editFab} onPress={handleStartEdit} hitSlop={6}>
              <Ionicons name="pencil-outline" size={14} color="#fff" />
              <Text style={styles.editFabLabel}>Edit</Text>
            </Pressable>
          ) : null}
        </View>

        {isEditing ? (
          <View style={styles.editingBanner}>
            <Ionicons name="create-outline" size={16} color={palette.primary} />
            <Text style={styles.editingBannerText}>
              You're editing your salon profile. Update any section below, then tap Save.
            </Text>
          </View>
        ) : null}

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

        <Section
          title="Basic Information"
          icon="person-outline"
          open={openSections.basic}
          onToggle={() => toggleSection('basic')}
        >
          <FieldBox label="Business Name" value={form.business_name} editable={isEditing} onChangeText={(v) => set('business_name', v)} />
          <FieldBox label="Email Address" value={salon.email ?? ''} editable={false} />
          <FieldBox label="Phone Number" value={form.phone} editable={isEditing} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
          <FieldBox label="Street Address" value={form.address} editable={isEditing} onChangeText={(v) => set('address', v)} multiline />
          <FieldBox label="State" value={form.state} editable={isEditing} onChangeText={(v) => set('state', v)} />
          <FieldBox label="City" value={form.city} editable={isEditing} onChangeText={(v) => set('city', v)} />
          <FieldBox label="Pincode" value={form.pincode} editable={isEditing} onChangeText={(v) => set('pincode', v)} keyboardType="number-pad" />
          <FieldBox
            label="Shop Description"
            value={form.description ?? ''}
            editable={isEditing}
            onChangeText={(v) => set('description', v)}
            multiline
            isLast
          />
        </Section>

        <Section
          title="Business Hours"
          icon="time-outline"
          open={openSections.hours}
          onToggle={() => toggleSection('hours')}
        >
          {DAYS.map((day, idx) => {
            const value = form.business_hours?.[day] ?? 'Closed';
            const isClosed = value === 'Closed';
            const { start, end } = splitDayHours(value);

            function pickStart() {
              openTimePicker(parseTimeToDate(start), (date) => {
                setDayHours(day, `${formatTimeFromDate(date)} - ${end}`);
              });
            }
            function pickEnd() {
              openTimePicker(parseTimeToDate(end), (date) => {
                setDayHours(day, `${start} - ${formatTimeFromDate(date)}`);
              });
            }

            return (
              <View key={day} style={[styles.dayRow, idx === 0 && styles.dayRowFirst]}>
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
                  {isEditing ? (
                    <Pressable
                      onPress={() => setDayHours(day, isClosed ? `${DEFAULT_START_TIME} - ${DEFAULT_END_TIME}` : 'Closed')}
                      hitSlop={6}
                    >
                      <Text style={isClosed ? styles.dayActionLabelPrimary : styles.dayActionLabelClose}>
                        {isClosed ? 'Set Hours' : 'Mark Closed'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {!isEditing ? (
                  <Text style={isClosed ? styles.dayValueMuted : styles.dayValue}>{value}</Text>
                ) : isClosed ? (
                  <View style={styles.dayClosedPill}>
                    <Text style={styles.dayValueMuted}>Closed all day</Text>
                  </View>
                ) : (
                  <View style={styles.timePickerRow}>
                    <Pressable style={styles.timeChip} onPress={pickStart}>
                      <Ionicons name="time-outline" size={14} color={palette.primary} />
                      <Text style={styles.timeChipLabel}>{start}</Text>
                    </Pressable>
                    <Text style={styles.timeToLabel}>to</Text>
                    <Pressable style={styles.timeChip} onPress={pickEnd}>
                      <Ionicons name="time-outline" size={14} color={palette.primary} />
                      <Text style={styles.timeChipLabel}>{end}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </Section>

        <Section
          title="Facilities & Amenities"
          icon="options-outline"
          open={openSections.facilities}
          onToggle={() => toggleSection('facilities')}
        >
          <View style={styles.facilitiesGrid}>
            {FACILITIES.map((facility) => {
              const checked = !!form.facilities?.[facilityKey(facility.key)];
              return (
                <Pressable
                  key={facility.key}
                  style={[
                    styles.facilityChip,
                    checked && styles.facilityChipActive,
                    !isEditing && styles.facilityChipReadonly,
                  ]}
                  disabled={!isEditing}
                  onPress={() => setFacility(facility.key, !checked)}
                >
                  <Ionicons name={facility.icon} size={14} color={checked ? '#fff' : '#534433'} />
                  <Text style={[styles.facilityLabel, checked && styles.facilityLabelActive]}>{facility.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          title="Salon Images"
          icon="images-outline"
          open={openSections.images}
          onToggle={() => toggleSection('images')}
        >
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
                    {uploading === 'cover' ? (
                      <ActivityIndicator size="small" color={palette.text} />
                    ) : (
                      <Ionicons name="camera-outline" size={13} color={palette.text} />
                    )}
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
                    {uploading === 'logo' ? (
                      <ActivityIndicator size="small" color={palette.text} />
                    ) : (
                      <Ionicons name="camera-outline" size={11} color={palette.text} />
                    )}
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
                {uploading === 'gallery' ? (
                  <ActivityIndicator size="small" color="#7a7a7a" />
                ) : (
                  <>
                    <Ionicons name="add-outline" size={18} color="#7a7a7a" />
                    <Text style={styles.galleryAddLabel}>Upload</Text>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        </Section>

        <Section
          title="Agreement Document"
          icon="document-text-outline"
          open={openSections.agreement}
          onToggle={() => toggleSection('agreement')}
        >
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
        </Section>

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

        {!isEditing ? (
          <Pressable onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutLabel}>Sign out</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {isEditing ? (
        <View style={styles.stickyBar}>
          <Pressable style={styles.stickyCancelButton} disabled={updateSalon.isPending} onPress={handleCancel}>
            <Text style={styles.stickyCancelLabel}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.stickySaveButton} disabled={updateSalon.isPending} onPress={handleSave}>
            {updateSalon.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
            )}
            <Text style={styles.stickySaveLabel}>{updateSalon.isPending ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        </View>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={iosPickerVisible} onRequestClose={() => setIosPickerVisible(false)}>
          <View style={styles.pickerBackdrop}>
            <Pressable style={styles.pickerBackdropTouch} onPress={() => setIosPickerVisible(false)} />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerSheetHeader}>
                <Pressable onPress={() => setIosPickerVisible(false)} hitSlop={8}>
                  <Text style={styles.pickerCancelLabel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={confirmIosPicker} hitSlop={8}>
                  <Text style={styles.pickerDoneLabel}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDraftValue}
                mode="time"
                display="spinner"
                onChange={(_, date) => date && setPickerDraftValue(date)}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

function Section({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionWrap}>
      <Pressable style={styles.sectionHeaderRow} onPress={onToggle} hitSlop={4}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={17} color={palette.text} />
          <Text style={styles.sectionTitleInline}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#9a9a9a" />
      </Pressable>
      {open ? <View style={styles.card}>{children}</View> : null}
    </View>
  );
}

function FieldBox({
  label,
  value,
  editable,
  onChangeText,
  multiline,
  keyboardType,
  isLast,
}: {
  label: string;
  value?: string | null;
  editable: boolean;
  onChangeText?: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'phone-pad' | 'number-pad';
  isLast?: boolean;
}) {
  if (!editable) {
    return (
      <View style={[styles.fieldReadRow, isLast && styles.fieldReadRowLast]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || '—'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBoxEditing, multiline && styles.fieldBoxMultiline]}>
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value ?? ''}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholderTextColor="#9a9a9a"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  loader: { marginTop: 40 },
  scrollContent: {
    backgroundColor: palette.background,
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },
  scrollContentEditing: {
    // Extra clearance so the last section can scroll clear of the floating
    // sticky save bar, which itself floats above the floating pill tab bar.
    paddingBottom: 220,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerTextWrap: {
    flex: 1,
  },
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
  editFab: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editFabLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: typography.weight.semibold,
  },
  editingBanner: {
    alignItems: 'center',
    backgroundColor: '#fff3de',
    borderColor: 'rgba(248,158,7,0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    padding: 12,
  },
  editingBannerText: {
    color: '#8a5a00',
    flex: 1,
    fontSize: 12.5,
    fontWeight: typography.weight.medium,
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
  sectionWrap: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    color: '#2c2c2c',
    fontSize: 20,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleInline: {
    color: '#2c2c2c',
    fontSize: 16,
    fontWeight: typography.weight.semibold,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    padding: 18,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#7a7a7a',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
  fieldReadRow: {
    borderBottomColor: 'rgba(0,0,0,0.06)',
    borderBottomWidth: 1,
    gap: 4,
    paddingVertical: 10,
  },
  fieldReadRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  fieldBoxEditing: {
    backgroundColor: '#fff8ec',
    borderColor: palette.primary,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 6,
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
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderTopWidth: 1,
    gap: 8,
    paddingVertical: 10,
  },
  dayRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  dayHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    color: '#2c2c2c',
    fontSize: 14,
    fontWeight: typography.weight.semibold,
  },
  dayValue: {
    color: '#1a1c1c',
    fontSize: 13,
  },
  dayValueMuted: {
    color: '#9a9a9a',
    fontSize: 13,
  },
  dayActionLabelPrimary: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  dayActionLabelClose: {
    color: '#c2410c',
    fontSize: 12,
    fontWeight: typography.weight.semibold,
  },
  dayClosedPill: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timePickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderColor: palette.primary,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  timeChipLabel: {
    color: '#1a1c1c',
    fontSize: 13,
    fontWeight: typography.weight.medium,
  },
  timeToLabel: {
    color: '#9a9a9a',
    fontSize: 12,
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  pickerSheetHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0,0,0,0.06)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerCancelLabel: {
    color: '#7a7a7a',
    fontSize: 15,
  },
  pickerDoneLabel: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: typography.weight.semibold,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  facilityChipReadonly: {
    opacity: 0.75,
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
  stickyBar: {
    // The vendor tab bar (VendorNavigator) is a floating pill fixed at
    // bottom:16/height:76 that overlays screen content rather than docking
    // in normal layout flow, so this bar must float above it explicitly
    // (bottom:16+76+12 gap = 104) instead of sitting flush at the screen edge,
    // or it renders hidden underneath the tab bar.
    backgroundColor: '#fff',
    borderRadius: 20,
    bottom: 104,
    elevation: 14,
    flexDirection: 'row',
    gap: 10,
    left: 20,
    padding: 12,
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  stickyCancelButton: {
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 14,
    width: 90,
  },
  stickyCancelLabel: {
    color: '#534433',
    fontSize: 15,
    fontWeight: typography.weight.medium,
  },
  stickySaveButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  stickySaveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: typography.weight.medium,
  },
});
