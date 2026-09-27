import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen, Header, AppButton, TabBar, makerTabs } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp } from '../src/store';
import { makerEarnings as seedEarnings } from '../src/data';

const money = (n: number) => `$${n.toFixed(2)}`;

export default function MakerEarnings() {
  const { earnings, refreshMakerStats } = useApp();

  useEffect(() => {
    refreshMakerStats();
  }, [refreshMakerStats]);

  const weekly = earnings?.weekly.map((w) => w.grossCents / 100) ?? seedEarnings.weekly;
  const gross = (earnings?.summary.grossCents ?? 0) / 100;
  const commission = (earnings?.summary.commissionCents ?? 0) / 100;
  const commissionRate = Math.round((earnings?.summary.commissionRate ?? 0.1) * 100);
  const tips = (earnings?.summary.tipsCents ?? 0) / 100;
  const net = (earnings?.summary.netCents ?? 0) / 100;

  const max = Math.max(...weekly, 1);
  const rows = [
    { label: 'Orders', value: money(gross) },
    { label: `Commission (${commissionRate}%)`, value: `-${money(commission)}` },
    { label: 'Tips', value: `+${money(tips)}` },
  ];

  return (
    <Screen>
      <Header title="Earnings" />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalValue}>{money(net)}</Text>
            <Text style={styles.totalSub}>This Month</Text>
          </View>
          <View style={styles.rowsCard}>
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartTitle}>Weekly Earnings</Text>
          <View style={styles.chart}>
            {weekly.map((v, i) => (
              <View key={i} style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(8, Math.round((v / max) * 120)) },
                  ]}
                />
              </View>
            ))}
          </View>
          <AppButton title="View Payout Details" onPress={() => {}} style={styles.payoutBtn} />
        </ScrollView>
      </View>
      <TabBar items={makerTabs} active="earnings" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  totalCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: { fontSize: fontSize.sm, color: colors.muted, fontWeight: fontWeight.medium },
  totalValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.primaryDark, marginVertical: 4 },
  totalSub: { fontSize: fontSize.xs, color: colors.muted },
  rowsCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: fontSize.sm, color: colors.muted },
  rowValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  chartTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '55%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  payoutBtn: { marginTop: spacing.sm },
});
