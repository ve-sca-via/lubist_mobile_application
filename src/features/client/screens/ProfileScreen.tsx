import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { EmailVerificationBanner } from '@/features/client/components/EmailVerificationBanner';
import {
  useGetUserProfile,
  useUpdateUserProfile,
  useLogout,
  useLogoutAll,
  useDeleteAccount,
} from '@/services/api/hooks/useAuthAPI';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
  muted: '#867461',
  border: '#E7D7C9',
  inputBg: '#F6E5D7',
  cardBorder: 'rgba(217, 195, 173, 0.4)',
  danger: '#C0392B',
  verified: '#1E8E3E',
  chipActive: '#F89E07',
};

type Gender = 'male' | 'female' | 'other';
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'Profile'>;

// Informational pages, opened in an in-app WebView against the public web app.
const INFO_LINKS: { icon: keyof typeof Ionicons.glyphMap; label: string; path: string }[] = [
  { icon: 'information-circle-outline', label: 'About Us', path: '/about' },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy', path: '/privacy-policy' },
  { icon: 'document-text-outline', label: 'Terms & Conditions', path: '/terms-of-service' },
  { icon: 'help-circle-outline', label: 'FAQ / Help', path: '/faq' },
];

// Typed exactly (case-insensitively) to confirm account deletion.
const DELETE_CONFIRMATION = 'DELETE';

function initialsOf(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const { signOut, updateUser } = useAuth();

  const { data, isLoading, isError, error, refetch } = useGetUserProfile();
  const user = data?.user;

  const { mutate: saveProfile, isPending: isSaving } = useUpdateUserProfile();
  const { mutate: logoutUser } = useLogout();
  const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const [showLogoutAll, setShowLogoutAll] = useState(false);
  const [logoutAllPassword, setLogoutAllPassword] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Sync form state whenever the fetched profile changes.
  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? '');
    setPhone(user.phone ?? '');
    setAge(user.age != null ? String(user.age) : '');
    setGender((user.gender as Gender) ?? null);
  }, [user]);

  const ageNum = Number(age);
  const isValid =
    fullName.trim().length >= 2 &&
    (age === '' || (ageNum >= 13 && ageNum <= 120)) &&
    (gender === null || GENDERS.some((g) => g.value === gender));

  const addressLine = useMemo(() => {
    if (!user) return '';
    return [user.city, user.state, user.pincode].filter(Boolean).join(', ');
  }, [user]);

  const handleSave = () => {
    saveProfile(
      {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        age: age === '' ? undefined : ageNum,
        gender: gender ?? undefined,
      },
      {
        onSuccess: (res: any) => {
          const updated = res?.user;
          if (updated) {
            updateUser(updated);
            queryClient.setQueryData(['userProfile'], { success: true, user: updated });
          }
          queryClient.invalidateQueries({ queryKey: ['userProfile'] });
          setEditing(false);
          Alert.alert('Saved', 'Your profile has been updated.');
        },
        onError: (err: any) => {
          Alert.alert('Update failed', err.message || 'Could not update your profile.');
        },
      },
    );
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.full_name ?? '');
      setPhone(user.phone ?? '');
      setAge(user.age != null ? String(user.age) : '');
      setGender((user.gender as Gender) ?? null);
    }
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => logoutUser(undefined, { onSettled: () => signOut() }),
      },
    ]);
  };

  const handleLogoutAll = () => {
    if (!logoutAllPassword) return;
    logoutAll(
      { password: logoutAllPassword },
      {
        onSettled: () => {
          setShowLogoutAll(false);
          setLogoutAllPassword('');
        },
        onSuccess: () => signOut(),
        onError: (err: any) => {
          Alert.alert('Failed', err.message || 'Could not log out of all devices.');
        },
      },
    );
  };

  const closeDelete = () => {
    setShowDelete(false);
    setDeletePassword('');
    setDeleteConfirm('');
  };

  const canDelete =
    !!deletePassword &&
    deleteConfirm.trim().toUpperCase() === DELETE_CONFIRMATION &&
    !isDeleting;

  const handleDeleteAccount = () => {
    if (!canDelete) return;
    deleteAccount(
      { password: deletePassword, confirmation: DELETE_CONFIRMATION },
      {
        onSuccess: (res) => {
          closeDelete();
          // Sign out first: the account is gone, so every further request 401s.
          signOut();
          queryClient.clear();
          Alert.alert('Account deleted', res.message);
        },
        onError: (err: any) => {
          Alert.alert('Could not delete account', err.message || 'Please try again.');
        },
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons color={colors.heading} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        {user && !editing ? (
          <Pressable onPress={() => setEditing(true)} style={styles.editBtn}>
            <Ionicons color={colors.gold} name="create-outline" size={18} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.editBtn} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{(error as any)?.message || 'Failed to load profile.'}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <EmailVerificationBanner />
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(user?.full_name)}</Text>
            </View>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.card}>
            <Field label="Full Name">
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                />
              ) : (
                <Text style={styles.value}>{user?.full_name || '—'}</Text>
              )}
            </Field>

            <Field label="Phone">
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+919876543210"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                />
              ) : (
                <View style={styles.valueRow}>
                  <Text style={styles.value}>{user?.phone || '—'}</Text>
                  {user?.phone ? (
                    <View style={[styles.badge, user?.phone_verified ? styles.badgeOk : styles.badgeWarn]}>
                      <Ionicons
                        color={user?.phone_verified ? colors.verified : colors.muted}
                        name={user?.phone_verified ? 'checkmark-circle' : 'alert-circle-outline'}
                        size={13}
                      />
                      <Text style={[styles.badgeText, { color: user?.phone_verified ? colors.verified : colors.muted }]}>
                        {user?.phone_verified ? 'Verified' : 'Unverified'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </Field>

            <View style={styles.rowFields}>
              <View style={styles.flex1}>
                <Field label="Age">
                  {editing ? (
                    <TextInput
                      style={styles.input}
                      value={age}
                      onChangeText={(v) => setAge(v.replace(/[^\d]/g, ''))}
                      placeholder="25"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  ) : (
                    <Text style={styles.value}>{user?.age ?? '—'}</Text>
                  )}
                </Field>
              </View>
            </View>

            <Field label="Gender">
              {editing ? (
                <View style={styles.genderRow}>
                  {GENDERS.map((g) => (
                    <Pressable
                      key={g.value}
                      onPress={() => setGender(g.value)}
                      style={[styles.chip, gender === g.value && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>
                        {g.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={[styles.value, styles.capitalize]}>{user?.gender || '—'}</Text>
              )}
            </Field>

            {!editing && addressLine ? (
              <Field label="Location">
                <View style={styles.valueRow}>
                  <Ionicons color={colors.muted} name="location-outline" size={15} />
                  <Text style={styles.value}>{addressLine}</Text>
                </View>
              </Field>
            ) : null}
          </View>

          {editing ? (
            <View style={styles.editActions}>
              <Pressable onPress={handleCancel} style={styles.cancelBtn} disabled={isSaving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.saveBtn, (!isValid || isSaving) && styles.saveDisabled]}
                disabled={!isValid || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveText}>Save changes</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.dangerZone}>
              <Pressable onPress={() => navigation.navigate('MyReviews')} style={styles.linkRow}>
                <View style={styles.linkLeft}>
                  <Ionicons color={colors.gold} name="star-outline" size={18} />
                  <Text style={styles.linkText}>My Reviews</Text>
                </View>
                <Ionicons color={colors.muted} name="chevron-forward" size={18} />
              </Pressable>

              <Text style={styles.sectionLabel}>Other Information</Text>
              {INFO_LINKS.map((link) => (
                <Pressable
                  key={link.path}
                  onPress={() => navigation.navigate('WebPage', { title: link.label, path: link.path })}
                  style={styles.linkRow}
                >
                  <View style={styles.linkLeft}>
                    <Ionicons color={colors.gold} name={link.icon} size={18} />
                    <Text style={styles.linkText}>{link.label}</Text>
                  </View>
                  <Ionicons color={colors.muted} name="chevron-forward" size={18} />
                </Pressable>
              ))}

              <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons color={colors.text} name="log-out-outline" size={18} />
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
              <Pressable onPress={() => setShowLogoutAll(true)} style={styles.logoutAllBtn}>
                <Ionicons color={colors.danger} name="shield-outline" size={18} />
                <Text style={styles.logoutAllText}>Log out of all devices</Text>
              </Pressable>

              <Pressable onPress={() => setShowDelete(true)} style={styles.deleteBtn}>
                <Ionicons color={colors.danger} name="trash-outline" size={18} />
                <Text style={styles.deleteText}>Delete Account</Text>
              </Pressable>
              <Text style={styles.deleteHint}>
                Permanently deletes your account and personal data. This cannot be undone.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal transparent visible={showLogoutAll} animationType="fade" onRequestClose={() => setShowLogoutAll(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log out everywhere</Text>
            <Text style={styles.modalSubtitle}>
              Confirm your password to sign out of all devices.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={logoutAllPassword}
              onChangeText={setLogoutAllPassword}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setShowLogoutAll(false);
                  setLogoutAllPassword('');
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogoutAll}
                style={[styles.saveBtn, (!logoutAllPassword || isLoggingOutAll) && styles.saveDisabled]}
                disabled={!logoutAllPassword || isLoggingOutAll}
              >
                {isLoggingOutAll ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={showDelete} animationType="fade" onRequestClose={closeDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete your account?</Text>
            <Text style={styles.modalSubtitle}>
              This permanently erases your profile, saved salons, cart and reviews. Booking and
              payment records are kept in anonymous form only where the law requires it. This cannot
              be undone.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              value={deleteConfirm}
              onChangeText={setDeleteConfirm}
              placeholder={`Type ${DELETE_CONFIRMATION} to confirm`}
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeDelete} style={styles.cancelBtn} disabled={isDeleting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                style={[styles.destructiveBtn, !canDelete && styles.saveDisabled]}
                disabled={!canDelete}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveText}>Delete Account</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  backBtn: { height: 28, justifyContent: 'center', width: 44 },
  headerTitle: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  editBtn: { alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'flex-end', width: 44 },
  editText: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  center: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  errorText: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  scroll: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 20 },
  avatarBlock: { alignItems: 'center', gap: 6, marginBottom: 24 },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarText: { color: colors.white, fontFamily: 'Montserrat_600SemiBold', fontSize: 28 },
  name: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 22, marginTop: 8 },
  email: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 14 },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    padding: 18,
    shadowColor: 'rgba(44, 44, 44, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  field: { gap: 6, marginBottom: 16 },
  fieldLabel: { color: colors.muted, fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.3 },
  value: { color: colors.heading, fontFamily: 'Inter_500Medium', fontSize: 16 },
  capitalize: { textTransform: 'capitalize' },
  valueRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: 52,
    paddingHorizontal: 14,
  },
  rowFields: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  badge: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeOk: { backgroundColor: 'rgba(30, 142, 62, 0.1)' },
  badgeWarn: { backgroundColor: 'rgba(134, 116, 97, 0.12)' },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  genderRow: { flexDirection: 'row', gap: 10 },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  chipActive: { backgroundColor: colors.chipActive, borderColor: colors.chipActive },
  chipText: { color: colors.text, fontFamily: 'Inter_500Medium', fontSize: 14 },
  chipTextActive: { color: colors.white, fontFamily: 'Inter_600SemiBold' },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  cancelText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveDisabled: { opacity: 0.55 },
  saveText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  dangerZone: { gap: 12, marginTop: 32 },
  sectionLabel: {
    color: colors.muted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  linkRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  linkLeft: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  linkText: { color: colors.heading, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  logoutAllBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutAllText: { color: colors.danger, fontFamily: 'Inter_500Medium', fontSize: 14 },
  deleteBtn: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  deleteText: { color: colors.danger, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  deleteHint: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  destructiveBtn: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    gap: 12,
    padding: 22,
    width: '100%',
  },
  modalTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
  modalSubtitle: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: 52,
    marginTop: 4,
    paddingHorizontal: 14,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
