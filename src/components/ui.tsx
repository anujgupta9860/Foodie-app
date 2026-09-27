import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import { FoodItem, cookById } from '../data';

/* ---------- Screen wrapper ---------- */

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

export function ScrollScreen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Header with back ---------- */

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack ?? (() => router.back())} style={styles.headerBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerBack} />
    </View>
  );
}

/* ---------- Buttons ---------- */

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'dark';
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.btn, variant === 'primary' && styles.btnPrimary, variant === 'dark' && styles.btnDark, variant === 'outline' && styles.btnOutline, style]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'outline' ? { color: colors.primary } : { color: '#fff' },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- Stars ---------- */

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={colors.star}
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );
}

export function StarInput({ value, onChange, size = 30 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} hitSlop={8}>
          <Ionicons name={i <= value ? 'star' : 'star-outline'} size={size} color={colors.star} style={{ marginRight: 6 }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ---------- Chips ---------- */

export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Form field ---------- */

export function Field({ label, ...props }: { label?: string } & TextInputProps) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.fieldInput}
        {...props}
      />
    </View>
  );
}

/* ---------- Section title ---------- */

export function SectionTitle({ title, action, onActionPress }: { title: string; action?: string; onActionPress?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/* ---------- Food card (list row) ---------- */

export function FoodCard({ food, onPress }: { food: FoodItem; onPress: () => void }) {
  const cook = cookById(food.cookId);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.foodCard}>
      <Image source={{ uri: food.image }} style={styles.foodCardImage} />
      <View style={styles.foodCardBody}>
        <Text style={styles.foodCardName} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.foodCardCook} numberOfLines={1}>
          {cook.name}
        </Text>
        <View style={styles.foodCardMeta}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={styles.foodCardMetaText}>
            {cook.rating} ({cook.reviewCount}) · {food.distanceMi} mi
          </Text>
        </View>
        {food.portionsLeft <= 6 ? (
          <Text style={styles.foodCardLow}>{food.portionsLeft} portions left</Text>
        ) : null}
      </View>
      <Text style={styles.foodCardPrice}>${food.price}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Bottom tab bar ---------- */

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  route: string;
}

export function TabBar({ items, active }: { items: TabItem[]; active: string }) {
  const router = useRouter();
  return (
    <View style={styles.tabBar}>
      {items.map((t) => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => router.replace(t.route as never)}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Ionicons
              name={(isActive ? t.icon : `${t.icon}-outline`) as never}
              size={24}
              color={isActive ? colors.primary : colors.muted}
            />
            <Text style={[styles.tabLabel, isActive && { color: colors.primary }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const customerTabs: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/home' },
  { key: 'search', label: 'Search', icon: 'search', route: '/search' },
  { key: 'orders', label: 'Orders', icon: 'receipt', route: '/orders' },
  { key: 'profile', label: 'Profile', icon: 'person', route: '/profile' },
];

export const makerTabs: TabItem[] = [
  { key: 'dashboard', label: 'Home', icon: 'home', route: '/maker-dashboard' },
  { key: 'orders', label: 'Orders', icon: 'receipt', route: '/maker-orders' },
  { key: 'earnings', label: 'Earnings', icon: 'wallet', route: '/maker-earnings' },
  { key: 'profile', label: 'Profile', icon: 'person', route: '/maker-profile' },
];

/* ---------- Quantity stepper ---------- */

export function QtyStepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity onPress={() => onChange(qty - 1)} style={styles.stepperBtn} hitSlop={8}>
        <Ionicons name="remove" size={16} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.stepperQty}>{qty}</Text>
      <TouchableOpacity onPress={() => onChange(qty + 1)} style={styles.stepperBtn} hitSlop={8}>
        <Ionicons name="add" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Status pill ---------- */

export function StatusPill({ label, tone }: { label: string; tone: 'green' | 'orange' | 'gray' | 'blue' }) {
  const bg =
    tone === 'green' ? colors.primaryLight : tone === 'orange' ? '#FDF1E2' : tone === 'blue' ? '#E7F0FD' : colors.surface;
  const fg =
    tone === 'green' ? colors.primary : tone === 'orange' ? colors.warning : tone === 'blue' ? colors.info : colors.muted;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  headerBack: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  btn: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnDark: { backgroundColor: '#111' },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipIcon: { fontSize: 16, marginRight: 6 },
  chipText: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium },
  chipTextSelected: { color: colors.primaryDark },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: '#fff',
  },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  sectionAction: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  foodCardImage: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surface },
  foodCardBody: { flex: 1, marginLeft: 12 },
  foodCardName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  foodCardCook: { fontSize: fontSize.sm, color: colors.muted, marginTop: 2 },
  foodCardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  foodCardMetaText: { fontSize: fontSize.xs, color: colors.muted, marginLeft: 4 },
  foodCardLow: { fontSize: fontSize.xs, color: colors.warning, fontWeight: fontWeight.medium, marginTop: 3 },
  foodCardPrice: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginLeft: 8 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: fontSize.xs, color: colors.muted, marginTop: 3, fontWeight: fontWeight.medium },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.full, padding: 4 },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperQty: { minWidth: 28, textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  pillText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
});
