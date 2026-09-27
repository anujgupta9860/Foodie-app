import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, AppButton, TabBar, customerTabs } from '../src/components/ui';
import { colors, fontSize, fontWeight, spacing } from '../src/theme';
import { useApp } from '../src/store';

export default function ProfileScreen() {
  const router = useRouter();
  const { userName, location, user, signOut } = useApp();

  const rows = [
    { label: 'My Addresses', icon: 'location-outline', value: location, route: null as string | null },
    { label: 'Payment Methods', icon: 'card-outline', value: 'Apple Pay', route: null as string | null },
    { label: 'Order History', icon: 'receipt-outline', value: null, route: '/orders' },
    { label: 'Favorites', icon: 'heart-outline', value: null, route: null as string | null },
    { label: 'Notifications', icon: 'notifications-outline', value: null, route: null as string | null },
    { label: 'Settings', icon: 'settings-outline', value: null, route: null as string | null },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <Image
            source={{ uri: user?.avatarUrl ?? 'https://picsum.photos/seed/foodie-user/200/200' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userName}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.edit}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {rows.map((r) => (
            <TouchableOpacity
              key={r.label}
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => {
                if (r.route) router.push(r.route as never);
              }}
            >
              <Ionicons name={r.icon as never} size={22} color={colors.text} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                {r.value ? <Text style={styles.rowValue}>{r.value}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <AppButton
          title="Log Out"
          variant="outline"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
          style={styles.logout}
        />
      </ScrollView>
      <TabBar items={customerTabs} active="profile" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  head: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  edit: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium, marginTop: 4 },
  menu: { borderTopWidth: 1, borderTopColor: colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, marginLeft: spacing.md },
  rowLabel: { fontSize: fontSize.md, color: colors.text },
  rowValue: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  logout: { marginTop: spacing.lg },
});
