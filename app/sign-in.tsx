import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, AppButton, Field } from '../src/components/ui';
import { colors, fontSize, fontWeight, spacing } from '../src/theme';
import { useApp } from '../src/store';
import { ApiError } from '../src/api';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signUp, role, user } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const next = () => {
    const r = user?.role === 'MAKER' || role === 'maker' ? '/maker-dashboard' : '/location';
    router.replace(r as never);
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Missing info', 'Please enter your name to create an account.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(name, email, password);
      next();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Something went wrong. Is the API running?';
      Alert.alert(mode === 'signin' ? 'Sign in failed' : 'Sign up failed', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.brand}>Foodie</Text>
        <Text style={styles.heading}>{mode === 'signin' ? 'Welcome back!' : 'Create your account'}</Text>
        <Text style={styles.sub}>
          {mode === 'signin' ? 'Sign in to continue' : `Join as a ${role === 'maker' ? 'food maker' : 'customer'}`}
        </Text>
      </View>

      <View style={styles.form}>
        {mode === 'signup' ? (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <AppButton
          title={busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          onPress={submit}
        />
      </View>

      <TouchableOpacity
        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        style={styles.switchRow}
      >
        <Text style={styles.switchText}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <Text style={styles.switchLink}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
        </Text>
      </TouchableOpacity>

      {!__DEV__ ? null : (
        <Text style={styles.hint}>Demo logins — customer@foodie.demo / maker@foodie.demo (password123)</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, justifyContent: 'center' },
  top: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.sm },
  heading: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.muted, marginTop: 4 },
  form: { gap: spacing.md },
  switchRow: { marginTop: spacing.lg, alignItems: 'center' },
  switchText: { fontSize: fontSize.sm, color: colors.muted },
  switchLink: { color: colors.primary, fontWeight: fontWeight.bold },
  hint: { marginTop: spacing.xl, fontSize: fontSize.xs, color: colors.muted, textAlign: 'center' },
});
