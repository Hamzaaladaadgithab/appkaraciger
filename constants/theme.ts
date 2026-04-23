import { Platform } from 'react-native';

const tintColorLight = '#22c55e'; // Green tint
const tintColorDark = '#4ade80';

const softGreen = '#34d399';
const softBlue = '#3b82f6';
const softGradient = ['#34d399', '#3b82f6'] as const;

export const Colors = {
  light: {
    primary: softGreen,
    secondary: softBlue,
    gradient: softGradient,
    text: '#11181C',
    textMuted: '#687076',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    primary: softGreen,
    secondary: softBlue,
    gradient: softGradient,
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    background: '#151718',
    surface: '#202425',
    border: '#3A3F42',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
};

export const Shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
