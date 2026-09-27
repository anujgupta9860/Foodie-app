import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';

interface CheckRow {
  label: string;
  done: boolean;
}

const CHECKS: CheckRow[] = [
  { label: 'ID Verification', done: true },
  { label: 'Phone Verification', done: true },
  { label: 'Kitchen Information', done: false },
  { label: 'Food Safety Agreement', done: false },
];

export default function MakerVerification() {
  const router = useRouter();
  return (
    <Screen>
      <Header title="Verification Required" />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>We need to verify your identity and food handling information</Text>
          <View style={styles.card}>
            {CHECKS.map((c, i) => (
              <TouchableOpacity key={c.label} style={[styles.row, i < CHECKS.length - 1 && styles.rowBorder]} activeOpacity={0.7}>
                <Ionicons
                  name={c.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={26}
                  color={c.done ? colors.primary : colors.muted}
                />
                <Text style={styles.rowLabel}>{c.label}</Text>
                {c.done ? (
                  <Text style={styles.doneText}>Done</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <AppButton title="Continue" onPress={() => router.replace('/maker-dashboard')} style={styles.cta} />
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  subtitle: { fontSize: fontSize.sm, color: colors.muted, textAlign: 'center', marginVertical: spacing.md, paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, marginLeft: spacing.md, fontWeight: fontWeight.medium },
  doneText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
  cta: { marginTop: spacing.xl },
});
