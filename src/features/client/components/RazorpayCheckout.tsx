import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import type { RazorpayOrder } from '@/services/api/hooks/useBookingAPI';

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Props {
  visible: boolean;
  order: RazorpayOrder | null;
  prefill?: { name?: string; email?: string; contact?: string };
  description?: string;
  onSuccess: (result: RazorpaySuccess) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
}

/** How long the Razorpay SDK gets to load before we give the customer an error. */
const SDK_LOAD_TIMEOUT_MS = 20000;

/**
 * Serialize a value for embedding inside the `<script>` block below.
 *
 * This used to be a `replace(/["\\]/g, '')` on each value, interpolated into a
 * `"..."` literal. That is not enough: `prefill` carries the signed-in user's own
 * profile name/email/phone, and a name containing `</script>` closes the script
 * element during HTML parsing regardless of the JS quoting — so a profile field
 * could execute chosen JS inside the page that renders the payment form. A
 * newline did not need to be malicious to break it either; it just made the
 * literal a syntax error. `JSON.stringify` quotes correctly, and escaping `<`
 * means no value can terminate the element. See docs/PAYMENT_FLOW_AUDIT.md C-6.
 */
const js = (value: unknown) =>
  JSON.stringify(value ?? '')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

function buildHtml(order: RazorpayOrder, prefill: Props['prefill'], description: string) {
  const options = {
    key: order.key_id,
    order_id: order.order_id,
    amount: order.amount_paise,
    currency: order.currency,
    name: 'Lubist',
    description,
    prefill: {
      name: prefill?.name ?? '',
      email: prefill?.email ?? '',
      contact: prefill?.contact ?? '',
    },
    theme: { color: '#F89E07' },
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    function post(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
    }
    // Watchdog, declared BEFORE the blocking <script> below so the timer is
    // already running while it downloads. A *failed* SDK load throws in the try
    // block further down and reports itself; a load that merely HANGS never runs
    // that code at all, which used to leave the customer on a spinner with no
    // way out but the close button (audit M-12).
    window.__rzpOpened = false;
    setTimeout(function () {
      if (!window.__rzpOpened) {
        post("error", { description: "Couldn't reach the payment provider. Please check your connection and try again." });
      }
    }, ${SDK_LOAD_TIMEOUT_MS});
  </script>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="background:#FFFAF5">
  <script>
    var options = ${js(options)};
    options.handler = function (response) { post("success", response); };
    options.modal = { ondismiss: function () { post("dismiss", {}); }, escape: true };
    try {
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function (resp) { post("error", resp.error || {}); });
      rzp.open();
      window.__rzpOpened = true;
    } catch (e) {
      post("error", { description: String(e) });
    }
  </script>
</body>
</html>`;
}

export function RazorpayCheckout({ visible, order, prefill, description = 'Salon booking', onSuccess, onDismiss, onError }: Props) {
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'success') {
        onSuccess({
          razorpay_payment_id: msg.payload?.razorpay_payment_id,
          razorpay_order_id: msg.payload?.razorpay_order_id,
          razorpay_signature: msg.payload?.razorpay_signature,
        });
      } else if (msg.type === 'dismiss') {
        onDismiss();
      } else if (msg.type === 'error') {
        onError(msg.payload?.description || 'Payment failed. Please try again.');
      }
    } catch {
      onError('Unexpected payment response.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onDismiss}>
            <Ionicons color="#221A11" name="close" size={24} />
          </Pressable>
          <Text style={styles.title}>Secure Payment</Text>
          <View style={{ width: 24 }} />
        </View>
        {order ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: buildHtml(order, prefill, description), baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
            // Without these, a WebView that fails to render leaves the spinner
            // below on screen with no explanation (audit M-12).
            onError={() => onError("Couldn't open the payment screen. Please try again.")}
            onHttpError={() => onError("Couldn't open the payment screen. Please try again.")}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color="#F89E07" size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color="#F89E07" size="large" />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#FFFAF5', flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: { color: '#221A11', fontFamily: 'Montserrat_600SemiBold', fontSize: 16 },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
