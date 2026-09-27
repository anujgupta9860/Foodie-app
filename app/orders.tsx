import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, AppButton, StatusPill, TabBar, customerTabs } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { CustomerOrder } from '../src/data';
import { useApp } from '../src/store';

type Tab = 'active' | 'past';

const toneFor = (status: CustomerOrder['status']) =>
  status === 'Preparing' ? 'green' : status === 'Delivered' ? 'green' : status === 'On the way' ? 'blue' : 'gray';

const isActive = (o: CustomerOrder) => o.status === 'Preparing' || o.status === 'On the way';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders } = useApp();
  const [tab, setTab] = useState<Tab>('active');
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = orders.filter((o) => (tab === 'active' ? isActive(o) : !isActive(o)));

  return (
    <Screen>
      <Header title="My Orders" />
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['active', 'past'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'active' ? 'Active' : 'Past'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {list.length === 0 ? (
            <Text style={styles.empty}>No {tab} orders.</Text>
          ) : (
            list.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.orderId}>#{o.id}</Text>
                  <StatusPill label={o.status} tone={toneFor(o.status)} />
                </View>
                {o.items.map((it) => (
                  <Text key={it.foodId} style={styles.itemLine}>
                    {it.name} ({it.qty})
                  </Text>
                ))}
                <Text style={styles.total}>Total: ${o.total}</Text>
                <Text style={styles.meta}>
                  {o.status === 'Delivered' ? o.date : `Pickup: ${o.pickupWindow}`}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => setExpanded(expanded === o.id ? null : o.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetails}>
                      {expanded === o.id ? 'Hide Details' : 'View Details'}
                    </Text>
                  </TouchableOpacity>
                  {o.status === 'Delivered' ? (
                    <AppButton
                      title="Rate"
                      variant="outline"
                      onPress={() => router.push({ pathname: '/review/[orderId]', params: { orderId: o.id } })}
                      style={styles.rateBtn}
                    />
                  ) : null}
                </View>
                {expanded === o.id ? (
                  <View style={styles.expanded}>
                    {o.items.map((it) => (
                      <Text key={it.foodId} style={styles.itemLine}>
                        {it.qty} × {it.name} — ${it.price * it.qty}
                      </Text>
                    ))}
                    <Text style={styles.itemLine}>Cook: {o.cookName}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <TabBar items={customerTabs} active="orders" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primaryLight },
  tabText: { fontSize: fontSize.md, color: colors.muted, fontWeight: fontWeight.medium },
  tabTextActive: { color: colors.primaryDark, fontWeight: fontWeight.bold },
  body: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  empty: { textAlign: 'center', color: colors.muted, fontSize: fontSize.md, marginTop: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderId: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  itemLine: { fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  total: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text, marginTop: spacing.sm },
  meta: { fontSize: fontSize.sm, color: colors.muted, marginTop: 4 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  viewDetails: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  rateBtn: { paddingVertical: 8, paddingHorizontal: 20 },
  expanded: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
