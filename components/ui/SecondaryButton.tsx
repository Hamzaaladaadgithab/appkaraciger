import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function SecondaryButton({ title, onPress, style, textStyle, disabled }: SecondaryButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.95, { damping: 10, stiffness: 400 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 10, stiffness: 400 }))}
      disabled={disabled}
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#3A3F42' : '#E5E7EB' },
        animatedStyle,
        style,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.text, { color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C' }, textStyle]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.6,
  },
});
