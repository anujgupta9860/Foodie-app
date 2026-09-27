import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppButton, Header } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';
import { useApp } from '../src/store';

const RADII = ['1 mi', '3 mi', '5 mi', '10 mi', '20 mi'];

export default function SetLocationScreen() {
  const router = useRouter();
  const { role, location, setLocation } = useApp();
  const [radiusChoice, setRadiusChoice] = useState('5 mi');

  const done = () => {
    router.replace(role === 'maker' ? '/maker-onboarding' : '/home');
  };

  return (
    <Screen>
      <Header title="Your Location" />
      <View style={styles.body}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.mapPlaceholder}>
          <View style={styles.mapCircle} />
          <View style={styles.mapPin}>
            <Ionicons name="location" size={34} color={colors.primary} />
          </View>
          <Text style={styles.mapLabel}>{location}</Text>
        </View>

        <Text style={styles.radiusTitle}>Search radius</Text>
        <View style={styles.radiusRow}>
          {RADII.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRadiusChoice(r)}
              style={[styles.radiusChip, radiusChoice === r && styles.radiusChipActive]}
            >
              <Text style={[styles.radiusText, radiusChoice === r && styles.radiusTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <AppButton title="Continue" onPress={done} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: fontSize.md, color: colors.text, paddingVertical: 10 },
  mapPlaceholder: {
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    opacity: 0.7,
  },
  mapPin: { zIndex: 1 },
  mapLabel: { marginTop: 6, fontSize: fontSize.sm, color: colors.muted, fontWeight: fontWeight.medium, zIndex: 1 },
  radiusTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap' },
  radiusChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  radiusChipActive: { backgroundColor: colors.primary },
  radiusText: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  radiusTextActive: { color: '#fff' },
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.sm },
});
