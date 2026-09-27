import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, AppButton, Field } from '../src/components/ui';
import { useApp } from '../src/store';
import { colors, radius, spacing } from '../src/theme';
import { ApiError } from '../src/api';

export default function MakerCreateProfile() {
  const router = useRouter();
  const { location, createMyKitchen, myKitchen } = useApp();
  const [kitchenName, setKitchenName] = useState(myKitchen?.name ?? "Priya's Kitchen");
  const [about, setAbout] = useState(myKitchen?.about ?? 'I love cooking traditional Indian food for my local community');
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    if (!kitchenName.trim()) {
      Alert.alert('Missing info', 'Please give your kitchen a name.');
      return;
    }
    if (myKitchen) {
      router.push('/maker-verification');
      return;
    }
    setBusy(true);
    try {
      await createMyKitchen(kitchenName.trim(), about.trim(), location);
      router.push('/maker-verification');
    } catch (e) {
      Alert.alert(
        'Could not create kitchen',
        e instanceof ApiError && e.status === 409 ? 'You already have a kitchen.' : 'Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Create Your Profile" />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.muted} />
            </View>
          </TouchableOpacity>
          <Field label="Kitchen Name" value={kitchenName} onChangeText={setKitchenName} placeholder="Your kitchen name" />
          <Field
            label="About You"
            value={about}
            onChangeText={setAbout}
            placeholder="Tell customers about your cooking"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.aboutInput}
          />
          <Field label="Location" value={location} editable={false} />
          <AppButton title={busy ? 'Creating…' : 'Continue'} onPress={onContinue} style={styles.cta} />
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutInput: { minHeight: 100 },
  cta: { marginTop: spacing.sm },
});
