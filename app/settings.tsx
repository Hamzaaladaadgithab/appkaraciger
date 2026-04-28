import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
            <ThemedText style={{ fontSize: 17, color: theme.text, marginLeft: 2 }}>Geri</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Page Title */}
        <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.titleContainer}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(156, 163, 175, 0.15)' }]}>
            <Ionicons name="settings-outline" size={32} color={theme.textMuted} />
          </View>
          <ThemedText style={[styles.pageTitle, { color: theme.text }]}>Ayarlar</ThemedText>
        </Animated.View>

        {/* Glass Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.cardContainer}>
          <GlassCard style={styles.card} intensity={90}>
            <Ionicons name="construct-outline" size={36} color={theme.textMuted} style={{ marginBottom: Spacing.md }} />
            <ThemedText style={[styles.cardText, { color: theme.textMuted }]}>
              Bu sayfa yapım aşamasındadır.
            </ThemedText>
          </GlassCard>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  cardContainer: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
