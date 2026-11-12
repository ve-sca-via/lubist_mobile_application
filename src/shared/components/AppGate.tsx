import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_DISPLAY_NAME, OTHER_APP, WRONG_APP_COPY } from '@/app/config/clientApp';
import { env } from '@/app/config/env';
import { startAppConfigChecks } from '@/services/appGate/appConfig';
import { appGate, useAppGate } from '@/services/appGate/appGateStore';

// Same scheme as the auth screens (EmailLoginScreen etc.).
const colors = {
  bgTop: '#FFF8F4',
  bgMid: '#F0E0D1',
  bgBottom: '#FFFFFF',
  heading: '#221A11',
  text: '#534433',
  muted: 'rgba(83, 68, 51, 0.7)',
  iconBg: '#FFF1E6',
  icon: '#F89E07',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  link: '#865300',
  bannerBg: '#221A11',
  bannerText: '#FFFFFF',
  bannerMuted: 'rgba(255, 255, 255, 0.75)',
};

function openUrl(url: string | null | undefined) {
  if (!url) return;
  Linking.openURL(url).catch(() => {});
}

/**
 * Wraps the app and overlays the app-wide gates (see services/appGate):
 *  - "Update required" (blocking, from app-config or any 426),
 *  - "Use the other app / website" (wrong account type; dismissible),
 *  - "Update available" (one-time, dismissible banner).
 * Also starts the app-config check (launch + foreground, throttled).
 */
export function AppGate({ children }: PropsWithChildren) {
  const { updateRequired, wrongApp, updateAvailable } = useAppGate();

  useEffect(() => startAppConfigChecks(), []);

  // The update screen is a dead end on purpose: swallow Android back so it
  // can't be used to reach the screens underneath.
  useEffect(() => {
    if (!updateRequired) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [updateRequired]);

  let overlay: ReactNode = null;
  if (updateRequired) {
    overlay = (
      <GateScreen
        body={
          updateRequired.message ||
          `This version of ${APP_DISPLAY_NAME} is no longer supported. Please update to keep using the app.`
        }
        icon="cloud-download-outline"
        primary={
          updateRequired.storeUrl
            ? { label: 'UPDATE NOW', onPress: () => openUrl(updateRequired.storeUrl) }
            : undefined
        }
        footnote={updateRequired.storeUrl ? undefined : 'Please update the app from your app store.'}
        title="Update required"
      />
    );
  } else if (wrongApp) {
    const isWeb = wrongApp.kind === 'web_portal';
    const portal = env.webBaseUrl.replace(/^https?:\/\//, '');
    overlay = (
      <GateScreen
        body={
          isWeb
            ? wrongApp.message || `This account is managed on the Lubist website (${portal}).`
            : wrongApp.message && wrongApp.message !== WRONG_APP_COPY.serverMessage
              ? wrongApp.message
              : WRONG_APP_COPY.body
        }
        icon={isWeb ? 'globe-outline' : 'swap-horizontal-outline'}
        primary={
          isWeb
            ? { label: `OPEN ${portal.toUpperCase()}`, onPress: () => openUrl(env.webBaseUrl) }
            : { label: WRONG_APP_COPY.button, onPress: () => openUrl(OTHER_APP.storeUrl) }
        }
        secondary={{ label: 'Back to sign in', onPress: () => appGate.dismissWrongApp() }}
        title={isWeb ? 'Use the Lubist website' : WRONG_APP_COPY.title}
      />
    );
  }

  return (
    <View style={styles.root}>
      {children}
      {!overlay && updateAvailable ? (
        <UpdateBanner
          message={updateAvailable.message}
          onClose={() => appGate.dismissUpdateOffer()}
          onUpdate={() => {
            openUrl(updateAvailable.storeUrl);
            appGate.dismissUpdateOffer();
          }}
          showUpdate={!!updateAvailable.storeUrl}
        />
      ) : null}
      {overlay}
    </View>
  );
}

type Action = { label: string; onPress: () => void };

function GateScreen({
  icon,
  title,
  body,
  primary,
  secondary,
  footnote,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  primary?: Action;
  secondary?: Action;
  footnote?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        style={[styles.gate, { paddingBottom: insets.bottom + 32, paddingTop: insets.top + 32 }]}
      >
        <View style={styles.gateBody}>
          <View style={styles.iconWrap}>
            <Ionicons color={colors.icon} name={icon} size={40} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>

        <View style={styles.actions}>
          {primary ? (
            <Pressable
              accessibilityRole="button"
              onPress={primary.onPress}
              style={({ pressed }) => [styles.ctaShadow, pressed && styles.ctaPressed]}
            >
              <LinearGradient
                colors={[colors.ctaStart, colors.ctaEnd]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.cta}
              >
                <Text style={styles.ctaText}>{primary.label}</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
          {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
          {secondary ? (
            <Pressable accessibilityRole="button" onPress={secondary.onPress} style={styles.secondary}>
              <Text style={styles.secondaryText}>{secondary.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

function UpdateBanner({
  message,
  showUpdate,
  onUpdate,
  onClose,
}: {
  message: string | null;
  showUpdate: boolean;
  onUpdate: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.bannerWrap, { top: insets.top + 8 }]}>
      <View style={styles.banner}>
        <Ionicons color={colors.icon} name="sparkles-outline" size={20} />
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>A new version is available</Text>
          <Text numberOfLines={2} style={styles.bannerBody}>
            {message || 'Update for the latest features and fixes.'}
          </Text>
        </View>
        {showUpdate ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onUpdate} style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Update</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityLabel="Dismiss" accessibilityRole="button" hitSlop={10} onPress={onClose}>
          <Ionicons color={colors.bannerMuted} name="close" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gate: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  gateBody: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.iconBg,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    marginBottom: 24,
    width: 88,
  },
  title: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 340,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  ctaShadow: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.ctaShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
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
  footnote: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryText: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  bannerWrap: {
    left: 12,
    position: 'absolute',
    right: 12,
  },
  banner: {
    alignItems: 'center',
    backgroundColor: colors.bannerBg,
    borderRadius: 16,
    elevation: 10,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.bannerText,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  bannerBody: {
    color: colors.bannerMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: colors.ctaStart,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bannerBtnText: {
    color: colors.ctaText,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
