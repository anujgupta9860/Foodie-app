import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';

export default function MakerOnboarding() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.brand}>Foodie</Text>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Text style={styles.illustration}>👩‍🍳</Text>
          </View>
        </View>
        <Text style={styles.title}>Join as a Food Maker</Text>
        <Text style={styles.subtitle}>Share your home-cooked food with your community</Text>
        <AppButton title="Get Started" onPress={() => router.push('/maker-create-profile')} style={styles.cta} />
        <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.7}>
          <Text style={styles.login}>
            Already have an account? <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  illustrationWrap: { marginVertical: spacing.xxl },
  illustrationCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: { fontSize: 90 },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  cta: { width: '100%' },
  login: { fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.lg },
  loginLink: { color: colors.primary, fontWeight: fontWeight.bold },
});
