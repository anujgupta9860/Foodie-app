import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, AppButton } from '../src/components/ui';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';

export default function SplashScreen() {
  const router = useRouter();
  return (
    <Screen style={styles.bg}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>👨‍🍳</Text>
        </View>
        <Text style={styles.title}>Foodie</Text>
        <Text style={styles.tagline}>Homemade food{'\n'}from people near you</Text>
      </View>
      <View style={styles.footer}>
        <AppButton title="Get Started" onPress={() => router.replace('/role')} />
        <TouchableOpacity onPress={() => router.push('/sign-in')} style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: colors.primaryDark, padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 56 },
  title: { fontSize: 44, fontWeight: fontWeight.bold, color: '#fff' },
  tagline: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: spacing.sm, lineHeight: 24 },
  footer: { paddingBottom: spacing.md },
  loginRow: { marginTop: spacing.md, alignItems: 'center' },
  loginText: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm },
  loginLink: { fontWeight: fontWeight.bold, color: '#fff' },
});
