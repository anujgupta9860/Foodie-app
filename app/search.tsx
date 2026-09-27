import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Chip, FoodCard, TabBar, customerTabs } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { categories } from '../src/data';
import { useApp } from '../src/store';

export default function SearchScreen() {
  const router = useRouter();
  const { foods } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const q = query.trim().toLowerCase();
  const results = foods.filter((f) => {
    const matchQ =
      q.length === 0 ||
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q));
    const matchC = category === 'all' || f.category === category;
    return matchQ && matchC;
  });

  return (
    <Screen>
      <Text style={styles.title}>Search</Text>
      <View style={styles.body}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.inputWrap}>
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search homemade food..."
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <Text style={styles.clear} onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Text>
            ) : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
            {categories.map((c) => (
              <Chip key={c.id} label={c.label} icon={c.icon} selected={category === c.id} onPress={() => setCategory(c.id)} />
            ))}
          </ScrollView>

          {results.length === 0 ? (
            <Text style={styles.empty}>No dishes match your search.</Text>
          ) : (
            results.map((f) => (
              <FoodCard key={f.id} food={f} onPress={() => router.push(`/food/${f.id}`)} />
            ))
          )}
        </ScrollView>
      </View>
      <TabBar items={customerTabs} active="search" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text, marginLeft: spacing.sm },
  clear: { marginLeft: spacing.sm },
  chipsRow: { paddingVertical: spacing.sm },
  empty: { textAlign: 'center', color: colors.muted, fontSize: fontSize.md, marginTop: spacing.xl },
});
