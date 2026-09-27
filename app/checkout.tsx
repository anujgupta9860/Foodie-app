import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp } from '../src/store';

const fmt = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

const PAYMENTS = [
  { key: 'Apple Pay', icon: 'logo-apple' },
  { key: 'Card', icon: 'card' },
  { key: 'Google Pay', icon: 'logo-google' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartSubtotal, placeOrder } = useApp();
  const [payment, setPayment] = useState('Apple Pay');
  const [busy, setBusy] = useState(false);

  const onPay = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await placeOrder(payment);
      router.push('/confirmation');
    } catch (e) {
      Alert.alert('Order failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Checkout" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Delivery method */}
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        <View style={[styles.card, styles.selectedCard]}>
          <View style={styles.radioOuter}>
            <View style={styles.radioInner} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Pickup (at cook's location)</Text>
            <Text style={styles.cardSub}>Pickup time: 5:00 PM - 7:00 PM</Text>
          </View>
        </View>

        {/* Payment method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENTS.map((p) => {
          const selected = payment === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.8}
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => setPayment(p.key)}
            >
              <View style={[styles.radioOuter, !selected && styles.radioOuterOff]}>
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <Ionicons name={p.icon as never} size={22} color={colors.text} style={styles.payIcon} />
              <Text style={styles.cardTitle}>{p.key}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Order summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(cartSubtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(cartSubtotal)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title={busy ? 'Placing order…' : 'Pay Now'} onPress={onPay} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#fff',
  },
  selectedCard: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOff: { borderColor: colors.border },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  cardBody: { marginLeft: spacing.sm },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  cardSub: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  payIcon: { marginLeft: spacing.sm },
  summary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSize.md, color: colors.muted },
  summaryValue: { fontSize: fontSize.md, color: colors.text },
  totalRow: { marginBottom: 0, marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
