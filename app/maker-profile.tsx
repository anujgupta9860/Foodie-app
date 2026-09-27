import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen, AppButton, Stars, FoodCard, TabBar, makerTabs } from '../src/components/ui';
import { useApp } from '../src/store';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';

export default function MakerProfile() {
  const router = useRouter();
  const { makerMenu, myKitchen, cooks, signOut, userName } = useApp();
  const cook = (myKitchen ? cooks.find((c) => c.id === myKitchen.id) : undefined) ?? cooks[0];
  const [liked, setLiked] = useState(false);

  return (
    <Screen>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.bannerWrap}>
            <Image source={{ uri: cook.banner }} style={styles.banner} />
            <SafeAreaView edges={['top']} style={styles.overlay}>
              <TouchableOpacity onPress={() => setLiked((v) => !v)} hitSlop={12} style={styles.heartBtn}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          <View style={styles.body}>
            <Image source={{ uri: cook.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{cook.name}</Text>
            <View style={styles.ratingRow}>
              <Stars value={cook.rating} />
              <Text style={styles.ratingText}>
                {cook.rating} ({cook.reviewCount} reviews) · {cook.distanceMi} mi away
              </Text>
            </View>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified Food Maker</Text>
            </View>
            <Text style={styles.sectionLabel}>About me</Text>
            <Text style={styles.about}>{cook.about}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{cook.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{cook.reviewCount}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{cook.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <Text style={styles.sectionLabel}>Today's Menu</Text>
            {makerMenu.map((item) => (
              <FoodCard key={item.id} food={item} onPress={() => {}} />
            ))}
            <AppButton title="Edit Profile" onPress={() => router.push('/maker-create-profile')} style={styles.editBtn} />
            <AppButton
              title="Sign Out"
              variant="outline"
              onPress={async () => {
                await signOut();
                router.replace('/');
              }}
              style={styles.editBtn}
            />
          </View>
        </ScrollView>
      </View>
      <TabBar items={makerTabs} active="profile" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 200, backgroundColor: colors.surface },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'flex-end', padding: spacing.md },
  heartBtn: { padding: 6 },
  body: { padding: spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: -60,
    backgroundColor: colors.surface,
  },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: fontSize.sm, color: colors.muted, marginLeft: 6 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  verifiedText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold, marginLeft: 4 },
  sectionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  about: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginTop: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.muted, marginTop: 2 },
  editBtn: { marginTop: spacing.md, marginBottom: spacing.md },
});
