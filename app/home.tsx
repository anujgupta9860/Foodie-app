import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, SectionTitle, Chip, FoodCard, TabBar, customerTabs } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { categories } from '../src/data';
import { useApp } from '../src/store';

export default function HomeScreen() {
  const router = useRouter();
  const { location, cartCount, cartSubtotal, foods, catalogLoading } = useApp();
  const [category, setCategory] = useState<string>('all');

  const visible = category === 'all' ? foods : foods.filter((f) => f.category === category);
  const specials = visible.filter((f) => f.active !== false);

  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.top}>
        <View>
          <Text style={styles.brand}>Foodie</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.locationText}>{location} · 5 mi</Text>
            <Ionicons name="chevron-down" size={14} color={colors.muted} />
          </View>
        </View>
        <TouchableOpacity style={styles.bell} activeOpacity={0.8} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Search */}
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => router.push('/search')}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <Text style={styles.searchPlaceholder}>Search homemade food...</Text>
          </TouchableOpacity>

          {/* Hero */}
          <View style={styles.hero}>
            <Image source={{ uri: foods[0].image }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Homemade food available today</Text>
              <Text style={styles.heroSub}>Fresh · Local · Delicious</Text>
            </View>
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
            {categories.map((c) => (
              <Chip key={c.id} label={c.label} icon={c.icon} selected={category === c.id} onPress={() => setCategory(c.id)} />
            ))}
          </ScrollView>

          <SectionTitle title="Today's Specials" action="See all" onActionPress={() => setCategory('all')} />

          {specials.map((f) => (
            <FoodCard key={f.id} food={f} onPress={() => router.push(`/food/${f.id}`)} />
          ))}
        </ScrollView>

        {/* Floating cart */}
        {cartCount > 0 ? (
          <TouchableOpacity style={styles.cartFab} activeOpacity={0.85} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.cartFabText}>
              View cart · {cartCount} item{cartCount === 1 ? '' : 's'} · ${cartSubtotal}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TabBar items={customerTabs} active="home" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brand: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: fontSize.sm, color: colors.muted, marginHorizontal: 3 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, position: 'relative' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.md,
  },
  searchPlaceholder: { fontSize: fontSize.md, color: colors.muted, marginLeft: spacing.sm },
  hero: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, height: 170 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  heroTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: '#fff' },
  heroSub: { fontSize: fontSize.sm, color: '#fff', marginTop: 2, opacity: 0.9 },
  chipsRow: { paddingVertical: spacing.sm },
  cartFab: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  cartFabText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
