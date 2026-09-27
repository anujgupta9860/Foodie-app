import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp, Role } from '../src/store';

export default function ChooseRoleScreen() {
  const router = useRouter();
  const { setRole } = useApp();
  const [selected, setSelected] = useState<Role>('customer');

  const go = () => {
    setRole(selected);
    router.push('/sign-in');
  };

  const cards: { key: Exclude<Role, null>; icon: string; title: string; subtitle: string }[] = [
    { key: 'customer', icon: 'person', title: "I'm a Customer", subtitle: 'I want to order food' },
    { key: 'maker', icon: 'restaurant', title: "I'm a Food Maker", subtitle: 'I want to sell my food' },
  ];

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.brand}>Foodie</Text>
      <Text style={styles.heading}>What brings you here?</Text>
      <View style={styles.cards}>
        {cards.map((c) => {
          const active = selected === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              onPress={() => setSelected(c.key)}
              activeOpacity={0.85}
              style={[styles.card, active && styles.cardActive]}
            >
              <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
                <Ionicons name={c.icon as never} size={30} color={active ? colors.primary : colors.muted} />
              </View>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSubtitle}>{c.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AppButton title="Continue" onPress={go} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, justifyContent: 'center' },
  brand: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
  heading: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  cards: { marginBottom: spacing.xl },
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#fff',
  },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconCircleActive: { backgroundColor: '#fff' },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.muted, marginTop: 4 },
});
