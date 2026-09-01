import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

const LOCKED_FEATURES = ['Manage Services & Pricing', 'Accept Customer Bookings', 'Update Salon Profile'];

/**
 * Blocking interstitial shown in place of a screen's body while the vendor's
 * registration fee is unpaid — mirrors the web app's PaymentProtectionWrapper.
 * Registration/payment onboarding is out of scope for the mobile app, so this
 * is informational only (no working "Complete Payment" action here).
 */
export function PaymentLockedNotice({ feeAmount }: { feeAmount?: number | null }) {
  return (
    <Screen scrollable>
      <View style={styles.card}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Payment Required</Text>
        <Text style={styles.body}>
          This section unlocks once your salon's registration fee is paid.
          {feeAmount ? ` Outstanding amount: ₹${feeAmount}.` : ''}
        </Text>
        <View style={styles.list}>
          {LOCKED_FEATURES.map((feature) => (
            <Text key={feature} style={styles.listItem}>
              • {feature}
            </Text>
          ))}
        </View>
        <Text style={styles.hint}>Complete payment on the web vendor portal to unlock this section.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: typography.weight.bold,
  },
  body: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 6,
    marginTop: 8,
  },
  listItem: {
    color: palette.text,
    fontSize: 14,
  },
  hint: {
    color: palette.muted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
