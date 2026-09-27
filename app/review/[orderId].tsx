import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Header, AppButton, StarInput, Field } from '../../src/components/ui';
import { colors, fontSize, fontWeight, spacing } from '../../src/theme';
import { useApp } from '../../src/store';
import { ApiError } from '../../src/api';

const ROWS = ['Food Quality', 'Packaging', 'Accuracy'];

export default function ReviewScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { submitReview } = useApp();
  const [overall, setOverall] = useState(0);
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    'Food Quality': 0,
    Packaging: 0,
    Accuracy: 0,
  });
  const [comment, setComment] = useState('');

  const onSubmit = async () => {
    if (overall < 1) {
      Alert.alert('Almost there', 'Please give an overall star rating.');
      return;
    }
    if (!orderId || busy) return;
    setBusy(true);
    try {
      await submitReview(orderId, {
        overall,
        quality: scores['Food Quality'] || overall,
        packaging: scores['Packaging'] || overall,
        accuracy: scores['Accuracy'] || overall,
        comment: comment.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Review failed', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Rate Your Experience" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>How was your food and service?</Text>

        <View style={styles.overall}>
          <StarInput value={overall} onChange={setOverall} size={38} />
        </View>

        {ROWS.map((row) => (
          <View key={row} style={styles.row}>
            <Text style={styles.rowLabel}>{row}</Text>
            <StarInput
              value={scores[row]}
              onChange={(v) => setScores((s) => ({ ...s, [row]: v }))}
              size={26}
            />
          </View>
        ))}

        <View style={styles.comment}>
          <Field
            placeholder="Add a comment (optional)"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title={busy ? 'Submitting…' : 'Submit Review'} onPress={onSubmit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  sub: { fontSize: fontSize.md, color: colors.muted, marginBottom: spacing.md },
  overall: { marginBottom: spacing.lg },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rowLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium },
  comment: { width: '100%', marginTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
