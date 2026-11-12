import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { env } from '@/app/config/env';
import type { ClientStackParamList } from '@/navigation/navigation.types';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  heading: '#221A11',
  text: '#534433',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'WebPage'>;
type WebPageRoute = RouteProp<ClientStackParamList, 'WebPage'>;

// Resolve a route param (a "/path" on the web app, or an absolute URL) to a
// full URL against the configured web base URL.
function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.webBaseUrl}/${path.replace(/^\//, '')}`;
}

export function WebPageScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<WebPageRoute>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const url = resolveUrl(params.path);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons color={colors.heading} name="arrow-back" size={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {params.title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        {failed ? (
          <View style={styles.center}>
            <Ionicons color={colors.gold} name="cloud-offline-outline" size={40} />
            <Text style={styles.errorText}>Couldn't load this page. Check your connection and try again.</Text>
            <Pressable
              onPress={() => {
                setFailed(false);
                setLoading(true);
              }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            source={{ uri: url }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
            onHttpError={() => {
              setLoading(false);
              setFailed(true);
            }}
          />
        )}
        {loading && !failed ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
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
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  body: { flex: 1 },
  webview: { backgroundColor: colors.bg, flex: 1 },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  center: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 32 },
  errorText: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
