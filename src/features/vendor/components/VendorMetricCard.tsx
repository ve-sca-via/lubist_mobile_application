import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type VendorMetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  badge?: string;
  badgeTone?: 'positive' | 'neutral';
};

/** Matches the Figma "Overall Performance" metric cards: icon + optional trend pill, big value, label. */
export function VendorMetricCard({ icon, value, label, badge, badgeTone = 'positive' }: VendorMetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Ionicons name={icon} size={20} color={palette.primary} />
        {badge ? (
          <View style={[styles.badge, badgeTone === 'positive' ? styles.badgePositive : styles.badgeNeutral]}>
            <Text style={[styles.badgeLabel, badgeTone === 'positive' ? styles.badgeLabelPositive : styles.badgeLabelNeutral]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: 'rgba(255,247,237,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: 112,
    padding: 17,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePositive: {
    backgroundColor: '#e6f4ea',
  },
  badgeNeutral: {
    backgroundColor: '#f3f4f6',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },
  badgeLabelPositive: {
    color: '#1e8e3e',
  },
  badgeLabelNeutral: {
    color: '#4b5563',
  },
  value: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  label: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 2,
  },
});
