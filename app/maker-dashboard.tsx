import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, AppButton, SectionTitle, TabBar, makerTabs } from '../src/components/ui';
import { useApp } from '../src/store';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { FoodItem } from '../src/data';

const money = (n: number) => `$${n.toFixed(2)}`;

function MenuRow({ item, onToggle }: { item: FoodItem; onToggle: () => void }) {
  const sold = item.portionsTotal - item.portionsLeft;
  const pct = item.portionsTotal > 0 ? sold / item.portionsTotal : 0;
  const active = item.active !== false;
  return (
    <View style={[styles.menuRow, !active && styles.menuRowDim]}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuBody}>
        <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.menuPrice}>{money(item.price)}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
        <Text style={styles.menuSold}>{sold}/{item.portionsTotal} sold</Text>
      </View>
      <Switch value={active} onValueChange={onToggle} trackColor={{ true: colors.primary }} />
    </View>
  );
}

export default function MakerDashboard() {
  const router = useRouter();
  const { makerMenu, toggleMakerFood, dashboard, refreshMakerStats, userName } = useApp();

  useEffect(() => {
    refreshMakerStats();
  }, [refreshMakerStats]);

  const stats = [
    { value: `$${((dashboard?.todaySalesCents ?? 0) / 100).toFixed(2)}`, label: "Today's sales" },
    { value: `${dashboard?.orderCount ?? 0}`, label: 'Orders' },
    { value: `${dashboard?.foodRemaining ?? 0}`, label: 'Food remaining' },
  ];

  return (
    <Screen>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.greeting}>Good morning, {userName.split(' ')[0]}!</Text>
          <Text style={styles.subGreeting}>Here's your today's overview</Text>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <SectionTitle title="Today's Menu" action="+ Add Food" onActionPress={() => router.push('/maker-add-food')} />
          {makerMenu.map((item) => (
            <MenuRow key={item.id} item={item} onToggle={() => toggleMakerFood(item.id)} />
          ))}
          <AppButton title="+ Add Food" onPress={() => router.push('/maker-add-food')} style={styles.addBtn} />
        </ScrollView>
      </View>
      <TabBar items={makerTabs} active="dashboard" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  subGreeting: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', marginHorizontal: -spacing.xs },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.muted, marginTop: 4, textAlign: 'center' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
  },
  menuRowDim: { opacity: 0.45 },
  menuImage: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surface },
  menuBody: { flex: 1, marginHorizontal: 12 },
  menuName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  menuPrice: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surface, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  menuSold: { fontSize: fontSize.xs, color: colors.muted, marginTop: 4 },
  addBtn: { marginTop: spacing.sm },
});
