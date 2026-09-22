import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { WebView } from 'react-native-webview';
import { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import { checkoutApi } from '@/api/checkout';
import { useCart } from '@/context/CartContext';
import { CheckoutResponse } from '@/types';
import MarqueeLoader from '@/components/MarqueeLoader';

type Phase = 'preparing' | 'paying' | 'error';
type LoadEvent = { nativeEvent: { url?: string } };

export default function CheckoutScreen() {
  const router = useRouter();
  const { reset } = useCart();

  const [idempotencyKey] = useState(() => Crypto.randomUUID());
  const [phase, setPhase] = useState<Phase>('preparing');
  const [session, setSession] = useState<CheckoutResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WebView loading progress: 0–100
  const [progress, setProgress] = useState(0);

  const webViewRef = useRef<WebView>(null);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    let cancelled = false;

    async function prepare() {
      try {
        const data = await checkoutApi.create(idempotencyKey);
        if (cancelled) return;
        reset();
        setSession(data);
        setPhase('paying');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage((err as Error).message);
        setPhase('error');
      }
    }

    prepare();
    return () => {
      cancelled = true;
    };
  }, [idempotencyKey, reset]);

  function handleLoadEnd(event: LoadEvent) {
    const url = event?.nativeEvent?.url;
    if (!url) return;
    if (!url.includes('/payment/return')) {
      return;
    }

    setTimeout(() => {
      webViewRef.current?.injectJavaScript(`
        (function() {
          try {
            var meta = document.querySelector('meta[name="payment-status"]');
            var status = meta ? meta.getAttribute('content') : 'META_NOT_FOUND';
            var hasMeta = !!meta;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_status',
              status: status,
              debug: { hasMeta: hasMeta, title: document.title, url: window.location.href }
            }));
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_status',
              status: 'JS_ERROR',
              debug: { error: String(e) }
            }));
          }
        })();
        true;
      `);
    }, 300);
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'payment_status') return;

      const status = String(data.status).toUpperCase();

      if (status === 'SUCCESS' && session) {
        router.replace(
          `/checkout-success?orderId=${session.order_id}&amount=${session.amount}`
        );
      } else if (status === 'FAILED') {
        Alert.alert(
          'Payment failed',
          'Your payment was not completed. You can try again from the cart.',
          [{ text: 'OK', onPress: () => router.replace('/products') }]
        );
      } else if (status === 'PENDING') {
        Alert.alert(
          'Payment pending',
          'We could not confirm the payment yet. Please check your cart or orders later.',
          [{ text: 'OK', onPress: () => router.replace('/products') }]
        );
      } else {
        Alert.alert(
          'Payment status unknown',
          `Server returned: ${status}. ${
            data.debug?.hasMeta === false
              ? 'The return page did not load correctly.'
              : ''
          }`,
          [{ text: 'OK', onPress: () => router.replace('/products') }]
        );
      }
    } catch {
      //console.log('[CHECKOUT] malformed message:', event.nativeEvent.data);
    }
  }

  if (phase === 'preparing') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.preparingText}>Preparing your checkout…</Text>
      </View>
    );
  }

  if (phase === 'error' || !session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {errorMessage ?? 'Something went wrong.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace('/cart')}
        >
          <Text style={styles.retryText}>Back to cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPageLoading = progress < 95;

  return (
    <View style={styles.flex}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.replace('/products')}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checkout</Text>
        <View style={styles.topBarSpacer} />
      </View>

      {/* Marquee — visible while the WebView is loading.
          Uses a fixed-height wrapper so layout doesn't jump. */}
      <View style={styles.marqueeWrap}>
        {isPageLoading ? <MarqueeLoader /> : null}
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: session.checkout_url }}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        onLoadProgress={(e) => {
          const p = e.nativeEvent.progress * 100;
          setProgress(p);
        }}
        onLoadStart={() => setProgress(0)}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  preparingText: { marginTop: 16, fontSize: 15, color: '#6b7280' },
  errorText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  closeButton: { padding: 6 },
  closeText: { fontSize: 15, color: '#DC2626', fontWeight: '600' },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  topBarSpacer: { width: 56 },
  marqueeWrap: { height: 3 },
});