import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'tr' | 'en';
type ThemeMode = 'system' | 'dark' | 'light';

interface SettingsState {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  setLanguage: (lang: Language) => void;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEY = '@appkaraciger_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeMode: 'dark',
  notificationsEnabled: true,
  soundEnabled: true,
  language: 'tr',

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await _persist(get());
  },
  setNotificationsEnabled: async (value) => {
    set({ notificationsEnabled: value });
    await _persist(get());
  },
  setSoundEnabled: async (value) => {
    set({ soundEnabled: value });
    await _persist(get());
  },
  setLanguage: async (lang) => {
    set({ language: lang });
    await _persist(get());
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set(saved);
      }
    } catch (err) {
      console.warn('Settings: Failed to load from storage:', err);
    }
  },
}));

async function _persist(state: SettingsState) {
  try {
    const { themeMode, notificationsEnabled, soundEnabled, language } = state;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ themeMode, notificationsEnabled, soundEnabled, language }));
  } catch (err) {
    console.warn('Settings: Failed to save to storage:', err);
  }
}
