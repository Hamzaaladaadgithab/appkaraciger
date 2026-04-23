import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, value, onChangeText, onFocus, onBlur, ...rest }: InputFieldProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (value && value.length > 0);

  const labelStyle = useAnimatedStyle(() => {
    const scale = isActive ? 0.8 : 1;
    return {
      transform: [
        { translateY: withTiming(isActive ? -12 : 0, { duration: 200, easing: Easing.out(Easing.ease) }) },
        { translateX: withTiming(isActive ? -4 : 0, { duration: 200 }) },
        { scale: withTiming(scale, { duration: 200 }) },
      ],
    };
  }, [isActive]);

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = error ? '#ef4444' : isFocused ? theme.primary : theme.border;
    return {
      borderColor: withTiming(borderColor, { duration: 200 }),
      borderWidth: isFocused ? 2 : 1,
    };
  }, [isFocused, error, theme]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, borderStyle, { backgroundColor: theme.surface }]}>
        <Animated.Text 
          style={[
            styles.label, 
            labelStyle, 
            { left: Spacing.md, color: error ? '#ef4444' : isFocused ? theme.primary : theme.textMuted }
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor="transparent"
          {...rest}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    borderRadius: BorderRadius.md,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  label: {
    position: 'absolute',
    top: 18,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    height: '100%',
    paddingTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
