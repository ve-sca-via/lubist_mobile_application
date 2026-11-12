import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParamList } from '@/navigation/navigation.types';
import { usePasswordReset } from '@/services/api/hooks/useAuthAPI';

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
  placeholder: 'rgba(83, 68, 51, 0.5)',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  link: '#865300',
  backBtn: '#FFF1E6',
  green: '#2E7D32',
  greenBg: '#F0FDF4',
};

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Navigation>();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const { mutate: resetPassword, isPending } = usePasswordReset();
  const isValid = /^\S+@\S+\.\S+$/.test(email) && !isPending;

  const handleSubmit = () => {
    resetPassword(
      { email },
      {
        onSuccess: () => {
          setSent(true);
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to send reset link.');
        }
      }
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

            {sent ? (
              <View style={styles.card}>
                <View style={styles.successCircle}>
                  <Ionicons color={colors.green} name="mail-open-outline" size={30} />
                </View>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.subtitleCenter}>
                  If an account exists for{'\n'}
                  <Text style={styles.email}>{email}</Text>
                  {'\n'}we've sent a password reset link.
                </Text>

                <Pressable
                  onPress={() => navigation.navigate('EmailLogin')}
                  style={styles.ctaShadow}
                >
                  <LinearGradient
                    colors={[colors.ctaStart, colors.ctaEnd]}
                    end={{ x: 1, y: 0 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.cta}
                  >
                    <Text style={styles.ctaText}>BACK TO LOGIN</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setSent(false)} style={styles.resendWrap}>
                  <Text style={styles.resendText}>Use a different email</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.heading}>
                  <Text style={styles.title}>Forgot password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your email and we'll send you a link to reset it.
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons color={colors.muted} name="mail-outline" size={18} />
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.placeholder}
                        style={styles.input}
                        value={email}
                      />
                    </View>
                  </View>

                  <Pressable
                    disabled={!isValid}
                    onPress={handleSubmit}
                    style={({ pressed }) => [
                      styles.ctaShadow,
                      !isValid && styles.ctaDisabled,
                      pressed && isValid && styles.ctaPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.ctaStart, colors.ctaEnd]}
                      end={{ x: 1, y: 0 }}
                      start={{ x: 0, y: 0 }}
                      style={styles.cta}
                    >
                      <Text style={styles.ctaText}>{isPending ? 'SENDING...' : 'SEND RESET LINK'}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
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
    flexGrow: 1,
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
    marginTop: 24,
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
  subtitleCenter: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  email: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    elevation: 8,
    marginTop: 24,
    padding: 24,
    shadowColor: 'rgba(134, 83, 0, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  successCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.greenBg,
    borderRadius: 28,
    height: 72,
    justifyContent: 'center',
    marginBottom: 20,
    width: 72,
  },
  field: {
    gap: 8,
    marginBottom: 20,
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
  resendWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
