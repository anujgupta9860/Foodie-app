import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, AppButton, Stars, SectionTitle, FoodCard } from '../../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../../src/theme';
import { useApp } from '../../src/store';

export default function CookProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { followed, toggleFollow, cookById, foodsByCook } = useApp();

  const cook = cookById(id ?? '');
  const menu = foodsByCook(cook.id);
  const isFollowing = followed.includes(cook.id);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner + back */}
        <View style={styles.bannerWrap}>
          <Image source={{ uri: cook.banner }} style={styles.banner} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={styles.profileHead}>
          <Image source={{ uri: cook.avatar }} style={styles.avatar} />
          <View style={styles.headInfo}>
            <Text style={styles.name}>{cook.name}</Text>
            <View style={styles.ratingRow}>
              <Stars value={cook.rating} size={14} />
              <Text style={styles.ratingText}>
                {cook.rating} ({cook.reviewCount} reviews) · {cook.distanceMi} mi
              </Text>
            </View>
          </View>
          <AppButton
            title={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'outline' : 'primary'}
            onPress={() => toggleFollow(cook.id)}
            style={styles.followBtn}
          />
        </View>

        {/* Verified */}
        {cook.verified ? (
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={styles.verifiedText}>Verified Food Maker</Text>
          </View>
        ) : null}

        {/* About */}
        <Text style={styles.aboutTitle}>About me</Text>
        <Text style={styles.aboutText}>{cook.about}</Text>

        {/* Menu */}
        <View style={styles.menu}>
          <SectionTitle title="Today's Menu" />
          {menu.map((f) => (
            <FoodCard key={f.id} food={f} onPress={() => router.push(`/food/${f.id}`)} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 190, backgroundColor: colors.surface },
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
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: -spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: colors.surface,
  },
  headInfo: { flex: 1, marginLeft: spacing.sm, marginTop: spacing.xl },
  name: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: fontSize.sm, color: colors.muted, marginLeft: 6 },
  followBtn: { paddingVertical: 10, paddingHorizontal: 18, marginTop: spacing.xl },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  verifiedText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.primary },
  aboutTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  aboutText: {
    fontSize: fontSize.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  followWrap: { paddingHorizontal: spacing.md },
  menu: { paddingHorizontal: spacing.md },
});
