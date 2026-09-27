import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, AppButton, Stars, Chip, QtyStepper } from '../../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../../src/theme';
import { useApp } from '../../src/store';

export default function FoodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, foodById, cookById } = useApp();
  const [qty, setQtyLocal] = useState(1);

  const food = id ? foodById(id) : undefined;

  if (!food) {
    return (
      <Screen>
        <Header title="Dish" />
        <View style={styles.center}>
          <Text style={styles.notFound}>Dish not found</Text>
          <AppButton title="Back to Home" onPress={() => router.replace('/home')} variant="outline" />
        </View>
      </Screen>
    );
  }

  const cook = cookById(food.cookId);

  const onAdd = () => {
    addToCart(food.id, qty);
    router.push('/cart');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image with back overlay */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: food.image }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Name + price */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{food.name}</Text>
          <Text style={styles.price}>${food.price}</Text>
        </View>

        {/* Cook row */}
        <TouchableOpacity style={styles.cookRow} activeOpacity={0.8} onPress={() => router.push(`/cook/${cook.id}`)}>
          <Image source={{ uri: cook.avatar }} style={styles.avatar} />
          <View style={styles.cookInfo}>
            <Text style={styles.cookName}>{cook.name}</Text>
            <View style={styles.ratingRow}>
              <Stars value={cook.rating} size={13} />
              <Text style={styles.ratingText}>
                {cook.rating} ({cook.reviewCount} reviews)
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>

        {/* Meta rows */}
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.metaText}>{food.distanceMi} miles away</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.metaText}>
              Pickup {food.pickupStart} - {food.pickupEnd}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
            <Text style={styles.metaText}>{food.portionsLeft} portions left</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.desc}>{food.description}</Text>

        {/* Tags */}
        <View style={styles.tags}>
          {food.tags.map((t) => (
            <Chip key={t} label={t} />
          ))}
        </View>

        <Text style={styles.portion}>{food.portion}</Text>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <QtyStepper qty={qty} onChange={(q) => setQtyLocal(Math.max(1, q))} />
        <AppButton title={`Add to Cart · $${food.price * qty}`} onPress={onAdd} style={styles.addBtn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 260, backgroundColor: colors.surface },
  backBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, flex: 1 },
  price: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  cookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface },
  cookInfo: { flex: 1, marginLeft: spacing.sm },
  cookName: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingText: { fontSize: fontSize.sm, color: colors.muted, marginLeft: 6 },
  meta: { paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: fontSize.md, color: colors.text, marginLeft: spacing.sm },
  desc: { fontSize: fontSize.md, color: colors.text, paddingHorizontal: spacing.md, marginTop: spacing.md, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  portion: { fontSize: fontSize.sm, color: colors.muted, paddingHorizontal: spacing.md, marginTop: spacing.md },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  addBtn: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  notFound: { fontSize: fontSize.lg, color: colors.text, fontWeight: fontWeight.medium },
});
