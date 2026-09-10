import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

// Tab screens dock above the tab bar (it isn't absolutely positioned), so only
// the top edge needs guarding against the status bar / notch here.
export function Screen({ children, scrollable = false }: ScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
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
    paddingBottom: 120,
  },
  scrollContent: {
    backgroundColor: palette.background,
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },
});
