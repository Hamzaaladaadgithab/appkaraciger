import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Shadows, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 50 }: GlassCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.shadowContainer, Shadows[colorScheme], style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}>
        <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)' }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  overlay: {
    padding: Spacing.lg,
  },
});
