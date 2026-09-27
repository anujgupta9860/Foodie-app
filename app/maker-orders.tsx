import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen, Header, AppButton, StatusPill, TabBar, makerTabs } from '../src/components/ui';
import { useApp } from '../src/store';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { MakerOrder, MakerOrderStatus } from '../src/data';

const money = (n: number) => `$${n.toFixed(2)}`;
const TABS: MakerOrderStatus[] = ['New', 'Active', 'Completed'];

function OrderCard({ order }: { order: MakerOrder }) {
  const { acceptMakerOrder, rejectMakerOrder } = useApp();

  const onAccept = async () => {
    try {
      await acceptMakerOrder(order.id);
    } catch (e) {
      Alert.alert('Could not accept', e instanceof Error ? e.message : 'Please try again.');
    }
  };
  const onReject = async () => {
    try {
      await rejectMakerOrder(order.id);
    } catch (e) {
      Alert.alert('Could not reject', e instanceof Error ? e.message : 'Please try again.');
    }
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.customer}>{order.customer}</Text>
        </View>
        <Text style={styles.total}>{money(order.total)}</Text>
      </View>
      {order.items.map((i, idx) => (
        <Text key={idx} style={styles.itemLine}>
          {i.name} x{i.qty}
        </Text>
      ))}
      <Text style={styles.pickup}>Pickup: {order.pickupTime}</Text>
      {order.status === 'New' ? (
        <View style={styles.actionRow}>
          <AppButton title="Accept" onPress={onAccept} style={styles.acceptBtn} />
          <AppButton
            title="Reject"
            variant="outline"
            onPress={onReject}
            style={styles.rejectBtn}
          />
        </View>
      ) : (
        <View style={styles.pillWrap}>
          <StatusPill label={order.status} tone={order.status === 'Active' ? 'blue' : 'green'} />
        </View>
      )}
    </View>
  );
}

export default function MakerOrders() {
  const { makerOrders, refreshMakerOrders } = useApp();
  const [tab, setTab] = useState<MakerOrderStatus>('New');

  useEffect(() => {
    refreshMakerOrders();
  }, [refreshMakerOrders]);

  const counts: Record<MakerOrderStatus, number> = {
    New: makerOrders.filter((o) => o.status === 'New').length,
    Active: makerOrders.filter((o) => o.status === 'Active').length,
    Completed: makerOrders.filter((o) => o.status === 'Completed').length,
  };

  return (
    <Screen>
      <Header title="Orders" />
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t} ({counts[t]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {makerOrders
            .filter((o) => o.status === tab)
            .map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          {counts[tab] === 0 ? <Text style={styles.empty}>No {tab.toLowerCase()} orders</Text> : null}
        </ScrollView>
      </View>
      <TabBar items={makerTabs} active="orders" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingVertical: 12, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, color: colors.muted, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  orderId: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  customer: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  total: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  itemLine: { fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  pickup: { fontSize: fontSize.sm, color: colors.muted, marginTop: 6 },
  actionRow: { flexDirection: 'row', marginTop: spacing.md, marginHorizontal: -spacing.xs },
  acceptBtn: { flex: 1, marginHorizontal: spacing.xs },
  rejectBtn: { flex: 1, marginHorizontal: spacing.xs },
  pillWrap: { marginTop: spacing.sm, alignItems: 'flex-start' },
  empty: { textAlign: 'center', color: colors.muted, fontSize: fontSize.sm, marginTop: spacing.xl },
});
