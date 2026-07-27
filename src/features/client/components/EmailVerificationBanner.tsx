import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGetUserProfile, useResendVerification } from '@/services/api/hooks/useAuthAPI';
import { useAuth } from '@/store/AuthContext';

// Dismissal lives at module scope so it survives screen remounts (tab switches,
// navigation) but resets when the app restarts — the same "hide it for this
// session" behaviour the web banner gets from sessionStorage.
let dismissedForSession = false;

const colors = {
  bg: '#FFF4E0',
  border: '#F5C97A',
  icon: '#865300',
  title: '#5C3A00',
  body: 'rgba(92, 58, 0, 0.78)',
  action: '#865300',
};

/**
 * Nudges signed-in users whose email address is still unconfirmed.
 *
 * Shown only when the backend explicitly reports `email_verified === false`.
 * The flag is `null` when the server could not determine it, and undefined on
 * older cached sessions — in both cases stay silent rather than warn wrongly.
 */
export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(dismissedForSession);

  const isGuest = !!user?.guest;
  const { data } = useGetUserProfile();
  const { mutate: resend, isPending } = useResendVerification();

  // Prefer the freshly fetched profile so the banner disappears on its own once
  // the user clicks the link and the next /auth/me comes back verified.
  const emailVerified = data?.user?.email_verified ?? user?.email_verified;

  if (isGuest || hidden || emailVerified !== false) {
    return null;
  }

  const handleResend = () => {
    resend(undefined, {
      onSuccess: (response: any) => {
        Alert.alert(
          response?.already_verified ? 'Already verified' : 'Email sent',
          response?.message || 'Check your inbox for the confirmation link.',
        );
      },
      onError: (error: any) => {
        Alert.alert('Could not send', error.message || 'Please try again in a few minutes.');
      },
    });
  };

  const handleDismiss = () => {
    dismissedForSession = true;
    setHidden(true);
  };

  return (
    <View style={styles.banner}>
      <Ionicons color={colors.icon} name="mail-unread-outline" size={20} style={styles.icon} />

      <View style={styles.content}>
        <Text style={styles.title}>Please confirm your email</Text>
        <Text style={styles.body}>
          You won&apos;t be able to log back in with your email until you do.
        </Text>

        <Pressable disabled={isPending} onPress={handleResend} style={styles.actionRow}>
          {isPending ? (
            <ActivityIndicator color={colors.action} size="small" />
          ) : (
            <Text style={styles.action}>Resend confirmation email</Text>
          )}
        </Pressable>
      </View>

      <Pressable hitSlop={10} onPress={handleDismiss}>
        <Ionicons color={colors.icon} name="close" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  icon: {
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.title,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  body: {
    color: colors.body,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    alignSelf: 'flex-start',
    marginTop: 8,
    minHeight: 20,
  },
  action: {
    color: colors.action,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
