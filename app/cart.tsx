import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, AppButton, QtyStepper } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp } from '../src/store';

const fmt = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

export default function CartScreen() {
  const router = useRouter();
  const { cart, setQty, cartCount, cartSubtotal } = useApp();

  if (cart.length === 0) {
    return (
      <Screen>
        <Header title="Your Cart" />
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={64} color={colors.muted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <AppButton title="Browse food" onPress={() => router.push('/home')} style={styles.emptyBtn} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={`Your Cart (${cartCount})`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {cart.map((line) => (
          <View key={line.food.id} style={styles.line}>
            <Image source={{ uri: line.food.image }} style={styles.lineImage} />
            <View style={styles.lineBody}>
              <Text style={styles.lineName} numberOfLines={1}>
                {line.food.name}
              </Text>
              <Text style={styles.linePrice}>{fmt(line.food.price)}</Text>
              <QtyStepper qty={line.qty} onChange={(q) => setQty(line.food.id, q)} />
            </View>
            <Text style={styles.lineTotal}>{fmt(line.food.price * line.qty)}</Text>
          </View>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(cartSubtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery/Service</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(cartSubtotal)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title="Proceed to Checkout" onPress={() => router.push('/checkout')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: 12,
  },
  lineImage: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surface },
  lineBody: { flex: 1, marginLeft: spacing.sm },
  lineName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  linePrice: { fontSize: fontSize.sm, color: colors.muted, marginVertical: 4 },
  lineTotal: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginLeft: spacing.sm },
  summary: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSize.md, color: colors.muted },
  summaryValue: { fontSize: fontSize.md, color: colors.text },
  totalRow: { marginTop: spacing.sm, marginBottom: 0 },
  totalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.text },
  emptyBtn: { marginTop: spacing.sm, minWidth: 180 },
});
