import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, AppButton, Field, Chip } from '../src/components/ui';
import { useApp } from '../src/store';
import { categories } from '../src/data';
import { colors, fontSize, fontWeight, radius, spacing } from '../src/theme';

export default function MakerAddFood() {
  const router = useRouter();
  const { addMakerFood } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('indian');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [pickupStart, setPickupStart] = useState('5:00 PM');
  const [pickupEnd, setPickupEnd] = useState('7:00 PM');
  const [tags, setTags] = useState('');
  const [portion, setPortion] = useState('1 portion = 350g');
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (!name.trim() || !price) {
      Alert.alert('Missing info', 'Please add a name and price for your dish.');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await addMakerFood({
        name,
        description,
        category,
        price: Number(price),
        portionsTotal: Number(qty),
        pickupStart,
        pickupEnd,
        tags,
        portion,
      });
      router.back();
    } catch (e) {
      Alert.alert('Could not add dish', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Add Food" />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.photoBox} activeOpacity={0.7}>
            <Ionicons name="image-outline" size={36} color={colors.muted} />
            <Text style={styles.photoText}>Add photo</Text>
          </TouchableOpacity>
          <Field label="Food Name" value={name} onChangeText={setName} placeholder="e.g. Chicken Biryani" />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your dish"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.descInput}
          />
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {categories
              .filter((c) => c.id !== 'more')
              .map((c) => (
                <Chip key={c.id} label={c.label} icon={c.icon} selected={category === c.id} onPress={() => setCategory(c.id)} />
              ))}
          </ScrollView>
          <Field label="Price ($)" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />
          <Field label="Quantity Available" value={qty} onChangeText={setQty} placeholder="0" keyboardType="numeric" />
          <View style={styles.row2}>
            <View style={styles.half}>
              <Field label="Pickup Start" value={pickupStart} onChangeText={setPickupStart} />
            </View>
            <View style={styles.half}>
              <Field label="Pickup End" value={pickupEnd} onChangeText={setPickupEnd} />
            </View>
          </View>
          <Field label="Tags (comma separated)" value={tags} onChangeText={setTags} placeholder="Veg, Spicy" />
          <Field label="Portion" value={portion} onChangeText={setPortion} placeholder="1 portion = 350g" />
          <AppButton title={busy ? 'Saving…' : 'Save'} onPress={onSave} style={styles.saveBtn} />
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  photoBox: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoText: { fontSize: fontSize.sm, color: colors.muted, marginTop: 6, fontWeight: fontWeight.medium },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, marginBottom: 6 },
  chipRow: { marginBottom: spacing.md },
  row2: { flexDirection: 'row', marginHorizontal: -spacing.xs },
  half: { flex: 1, marginHorizontal: spacing.xs },
  descInput: { minHeight: 90 },
  saveBtn: { marginTop: spacing.sm },
});
