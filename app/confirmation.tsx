import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp } from '../src/store';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { lastOrder, orders } = useApp();
  const order = lastOrder ?? orders[0] ?? null;

  if (!order) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.message}>No recent order found.</Text>
          <AppButton title="Back to Home" onPress={() => router.replace('/home')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </View>
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.sub}>Your order has been placed successfully</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order</Text>
            <Text style={styles.cardValue}>#{order.id}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Pickup</Text>
            <Text style={styles.cardValue}>{order.pickupWindow}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Cook</Text>
            <Text style={styles.cardValue}>{order.cookName}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Distance</Text>
            <Text style={styles.cardValue}>1.4 miles away</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title="View Order Details" onPress={() => router.push('/orders')} />
        <AppButton title="Back to Home" variant="outline" onPress={() => router.replace('/home')} style={styles.homeBtn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, alignItems: 'center', paddingTop: spacing.xxl },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  sub: { fontSize: fontSize.md, color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: '#fff',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardLabel: { fontSize: fontSize.md, color: colors.muted },
  cardValue: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  homeBtn: {},
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  message: { fontSize: fontSize.lg, color: colors.text, fontWeight: fontWeight.medium },
});
