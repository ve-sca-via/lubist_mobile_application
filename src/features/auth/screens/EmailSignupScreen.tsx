import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { useSignup } from '@/services/api/hooks/useAuthAPI';

const colors = {
  bgTop: '#FFF8F4',
  bgMid: '#F0E0D1',
  bgBottom: '#FFFFFF',
  card: 'rgba(255, 248, 244, 0.95)',
  heading: '#221A11',
  text: '#534433',
  muted: 'rgba(83, 68, 51, 0.7)',
  label: '#534433',
  inputBg: '#F6E5D7',
  inputBorder: '#F0E0D1',
  divider: 'rgba(217, 195, 173, 0.5)',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  link: '#865300',
  backBtn: '#FFF1E6',
  chipActive: '#F89E07',
  chipText: '#534433',
};

type Gender = 'male' | 'female' | 'other';
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MIN_PASSWORD_LENGTH = 8;

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'EmailSignup'>;

export function EmailSignupScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<Navigation>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const { mutate: registerUser, isPending } = useSignup();

  const ageNum = Number(age);
  const isValid =
    fullName.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    ageNum >= 13 &&
    ageNum <= 120 &&
    gender !== null;

  const handleSignup = () => {
    registerUser(
      {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        // No phone here: this is the email-only track. Users add and verify a
        // phone later from Profile, which keeps `phone_verified` meaningful.
        age: ageNum,
        gender: gender ?? undefined,
        user_role: 'customer',
      },
      {
        onSuccess: (response: any) => {
          if (response?.access_token && response?.refresh_token) {
            signIn(response.user || { email, full_name: fullName, role: 'customer' }, {
              access_token: response.access_token,
              refresh_token: response.refresh_token,
            });
          } else {
            Alert.alert('Account created', 'Your account is ready. Please log in.', [
              { text: 'OK', onPress: () => navigation.navigate('EmailLogin') },
            ]);
          }
        },
        onError: (error: any) => {
          Alert.alert('Signup Failed', error.message || 'Could not create account.');
        },
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons color={colors.heading} name="arrow-back" size={22} />
            </Pressable>

            <View style={styles.heading}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Sign up with your email and password.</Text>
            </View>

            <View style={styles.card}>
              <Field label="Full Name">
                <View style={styles.inputWrap}>
                  <Ionicons color={colors.muted} name="person-outline" size={18} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setFullName}
                    placeholder="Your full name"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    value={fullName}
                  />
                </View>
              </Field>

              <Field label="Email">
                <View style={styles.inputWrap}>
                  <Ionicons color={colors.muted} name="mail-outline" size={18} />
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    value={email}
                  />
                </View>
              </Field>

              <Field label="Password">
                <View style={styles.inputWrap}>
                  <Ionicons color={colors.muted} name="lock-closed-outline" size={18} />
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable onPress={() => setShowPassword((s) => !s)}>
                    <Ionicons
                      color={colors.muted}
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                    />
                  </Pressable>
                </View>
              </Field>

              <View style={styles.row}>
                <View style={styles.ageCol}>
                  <Field label="Age">
                    <View style={styles.inputWrap}>
                      <TextInput
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={(v) => setAge(v.replace(/[^\d]/g, ''))}
                        placeholder="25"
                        placeholderTextColor={colors.placeholder}
                        style={styles.input}
                        value={age}
                      />
                    </View>
                  </Field>
                </View>
              </View>

              <Field label="Gender">
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
              </Field>

              <Pressable
                disabled={!isValid || isPending}
                onPress={handleSignup}
                style={({ pressed }) => [
                  styles.ctaShadow,
                  (!isValid || isPending) && styles.ctaDisabled,
                  pressed && isValid && !isPending && styles.ctaPressed,
                ]}
              >
                <LinearGradient
                  colors={[colors.ctaStart, colors.ctaEnd]}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>
                    {isPending ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate('EmailLogin')}>
                  <Text style={styles.loginLink}>Log in</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
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
  safeArea: {
    backgroundColor: colors.bgTop,
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heading: {
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    elevation: 8,
    padding: 20,
    shadowColor: 'rgba(134, 83, 0, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.label,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
  },
  input: {
    color: colors.heading,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  ageCol: {
    width: '40%',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActive,
  },
  chipText: {
    color: colors.chipText,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.ctaText,
    fontFamily: 'Inter_600SemiBold',
  },
  ctaShadow: {
    borderRadius: 12,
    elevation: 8,
    marginTop: 8,
    shadowColor: colors.ctaShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.ctaText,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.7,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  loginLink: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
