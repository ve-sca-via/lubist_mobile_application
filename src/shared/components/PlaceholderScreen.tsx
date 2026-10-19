import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';

type PlaceholderScreenProps = PropsWithChildren<{
  title: string;
}>;

// Used by the admin/RM stacks, which have no tab bar - so this inlines the
// top-edge safe area wrapper the shared `Screen` component used to provide.
export function PlaceholderScreen({ children, title }: PlaceholderScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  content: {
    backgroundColor: palette.background,
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: typography.weight.bold,
  },
  body: {
    gap: 8,
  },
});
