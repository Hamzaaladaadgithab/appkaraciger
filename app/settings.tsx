import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Platform,
  ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { AuthManager } from '@/services/AuthManager';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Sub-components ────────────────────────────────────────────────────────────

/** A toggle row: icon + label + Switch */
function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
  theme,
  isLast = false,
  tintColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  theme: any;
  isLast?: boolean;
  tintColor?: string;
}) {
  return (
    <View style={[
      rowStyles.row,
      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.15)' },
    ]}>
      <View style={[rowStyles.iconBox, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
        <Ionicons name={icon} size={20} color={tintColor ?? theme.primary} />
      </View>
      <ThemedText style={[rowStyles.label, { color: theme.text }]}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(150,150,150,0.3)', true: tintColor ?? theme.primary }}
        thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        ios_backgroundColor="rgba(150,150,150,0.3)"
      />
    </View>
  );
}

/** A pressable row: icon + label + optional right value + chevron */
function PressableRow({
  icon,
  label,
  rightText,
  onPress,
  theme,
  iconColor,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  rightText?: string;
  onPress: () => void;
  theme: any;
  iconColor?: string;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        rowStyles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.15)' },
      ]}
    >
      <View style={[rowStyles.iconBox, { backgroundColor: `${iconColor ?? theme.primary}18` }]}>
        <Ionicons name={icon} size={20} color={iconColor ?? theme.primary} />
      </View>
      <ThemedText style={[rowStyles.label, { color: iconColor ?? theme.text }]}>{label}</ThemedText>
      {rightText ? (
        <ThemedText style={{ color: theme.textMuted, fontSize: 14, marginRight: 4 }}>{rightText}</ThemedText>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={iconColor ?? theme.textMuted} />
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

/** Section header */
function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <ThemedText style={[sectionStyles.header, { color: theme.textMuted }]}>
      {title.toUpperCase()}
    </ThemedText>
  );
}
const sectionStyles = StyleSheet.create({
  header: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const {
    themeMode,
    notificationsEnabled,
    soundEnabled,
    language,
    setThemeMode,
    setNotificationsEnabled,
    setSoundEnabled,
    setLanguage,
    loadSettings,
  } = useSettingsStore();

  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await AuthManager.signOut();
              // Auth Guard handles redirect automatically
            } catch {
              setLoggingOut(false);
              Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
            }
          },
        },
      ]
    );
  };

  // ── Delete Account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz! Tüm verileriniz kalıcı olarak silinecek. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) throw new Error('No user');

              // 1. Delete Firestore document
              await deleteDoc(doc(db, 'users', currentUser.uid));

              // 2. Delete Firebase Auth account
              await deleteUser(currentUser);

              // Auth state change triggers Auth Guard → /login
            } catch (err: any) {
              setDeletingAccount(false);
              // Firebase requires recent login for deleteUser
              if (err?.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Yeniden Giriş Gerekli',
                  'Hesabınızı silmek için lütfen çıkış yapıp tekrar giriş yapın.'
                );
              } else {
                Alert.alert('Hata', 'Hesap silinirken bir sorun oluştu.');
                console.error('DeleteAccount error:', err);
              }
            }
          },
        },
      ]
    );
  };

  // ── Language Toggle ────────────────────────────────────────────────────────
  const handleLanguage = () => {
    Alert.alert(
      'Dil Seçimi',
      'Uygulama dilini seçin:',
      [
        { text: '🇹🇷 Türkçe', onPress: () => setLanguage('tr') },
        { text: '🇬🇧 English', onPress: () => setLanguage('en') },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  // ── Theme Toggle ───────────────────────────────────────────────────────────
  const handleTheme = () => {
    Alert.alert(
      'Tema Seçimi',
      'Uygulama temasını seçin:',
      [
        { text: '🌙 Koyu (Dark)', onPress: () => setThemeMode('dark') },
        { text: '☀️ Açık (Light)', onPress: () => setThemeMode('light') },
        { text: '⚙️ Sistem', onPress: () => setThemeMode('system') },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const themeLabel = themeMode === 'dark' ? '🌙 Koyu' : themeMode === 'light' ? '☀️ Açık' : '⚙️ Sistem';
  const languageLabel = language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English';

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
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Ayarlar</ThemedText>
          <View style={{ width: 72 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Preferences */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)}>
            <SectionHeader title="Tercihler" theme={theme} />
            <GlassCard style={styles.card} intensity={90}>
              <ToggleRow
                icon="notifications-outline"
                label="Bildirimler"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                theme={theme}
                tintColor={theme.primary}
              />
              <ToggleRow
                icon="volume-high-outline"
                label="Ses Efektleri"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                theme={theme}
                tintColor="#3b82f6"
                isLast
              />
            </GlassCard>
          </Animated.View>

          {/* Appearance */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <SectionHeader title="Görünüm" theme={theme} />
            <GlassCard style={styles.card} intensity={90}>
              <PressableRow
                icon="moon-outline"
                label="Tema"
                rightText={themeLabel}
                onPress={handleTheme}
                theme={theme}
                iconColor={theme.primary}
              />
              <PressableRow
                icon="language-outline"
                label="Dil"
                rightText={languageLabel}
                onPress={handleLanguage}
                theme={theme}
                iconColor="#a78bfa"
                isLast
              />
            </GlassCard>
          </Animated.View>

          {/* Account */}
          <Animated.View entering={FadeInUp.duration(700).delay(300)}>
            <SectionHeader title="Hesap" theme={theme} />
            <GlassCard style={styles.card} intensity={90}>
              <PressableRow
                icon="log-out-outline"
                label={loggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                onPress={handleLogout}
                theme={theme}
                iconColor="#f59e0b"
                isLast
              />
            </GlassCard>
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInUp.duration(800).delay(400)}>
            <SectionHeader title="Uygulama Hakkında" theme={theme} />
            <GlassCard style={styles.card} intensity={90}>
              <View style={[rowStyles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.15)' }]}>
                <View style={[rowStyles.iconBox, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
                  <Ionicons name="heart-outline" size={20} color={theme.primary} />
                </View>
                <ThemedText style={[rowStyles.label, { color: theme.text }]}>Uygulama Adı</ThemedText>
                <ThemedText style={{ color: theme.textMuted, fontSize: 13 }}>Karaciğer Nakli AR</ThemedText>
              </View>
              <View style={[rowStyles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.15)' }]}>
                <View style={[rowStyles.iconBox, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
                  <Ionicons name="code-slash-outline" size={20} color={theme.primary} />
                </View>
                <ThemedText style={[rowStyles.label, { color: theme.text }]}>Versiyon</ThemedText>
                <ThemedText style={{ color: theme.textMuted, fontSize: 13 }}>1.0.0</ThemedText>
              </View>
              <View style={rowStyles.row}>
                <View style={[rowStyles.iconBox, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
                  <Ionicons name="school-outline" size={20} color={theme.primary} />
                </View>
                <ThemedText style={[rowStyles.label, { color: theme.text }]}>Amaç</ThemedText>
                <ThemedText style={{ color: theme.textMuted, fontSize: 13, flex: 0, maxWidth: 160, textAlign: 'right' }}>AR Tıp Eğitimi</ThemedText>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInUp.duration(900).delay(500)}>
            <SectionHeader title="⚠️ Tehlikeli Bölge" theme={theme} />
            <GlassCard style={[styles.card, styles.dangerCard]} intensity={90}>
              {deletingAccount ? (
                <View style={styles.deletingContainer}>
                  <ActivityIndicator color="#ef4444" />
                  <ThemedText style={{ color: '#ef4444', marginLeft: Spacing.md }}>Hesap siliniyor...</ThemedText>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                  <ThemedText style={styles.deleteText}>Hesabımı Kalıcı Olarak Sil</ThemedText>
                </TouchableOpacity>
              )}
              <ThemedText style={[styles.dangerHint, { color: theme.textMuted }]}>
                Bu işlem geri alınamaz. Tüm verileriniz ve geçmişiniz silinir.
              </ThemedText>
            </GlassCard>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    minWidth: 72,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: Spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.md,
  },
  deletingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dangerHint: {
    fontSize: 12,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
});
