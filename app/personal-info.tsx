import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { User } from '@/types';

// ─── Sub-components ────────────────────────────────────────────────────────────

/** A single labeled info row inside a card */
function InfoRow({
  icon,
  label,
  value,
  theme,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,150,0.15)' }]}>
      <View style={[styles.infoIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <View style={styles.infoTextGroup}>
        <ThemedText style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</ThemedText>
        <ThemedText style={[styles.infoValue, { color: theme.text }]}>{value}</ThemedText>
      </View>
    </View>
  );
}

/** Section header above a card group */
function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <ThemedText style={[styles.sectionHeader, { color: theme.textMuted }]}>{title.toUpperCase()}</ThemedText>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoDate?: string): string {
  if (!isoDate) return 'Belirtilmemiş';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PersonalInfoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('PersonalInfo: No authenticated user found.');
        setError(true);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
      } else {
        console.warn('PersonalInfo: User document not found in Firestore.');
        setError(true);
      }
    } catch (err) {
      console.error('PersonalInfo: Firebase fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centeredContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </>
    );
  }

  // ── Error / Not Found State ────────────────────────────────────────────────
  if (error || !userData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { paddingHorizontal: Spacing.md }]}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
            <ThemedText style={{ fontSize: 17, color: theme.text, marginLeft: 2 }}>Geri</ThemedText>
          </TouchableOpacity>
          <View style={styles.centeredContainer}>
            <Ionicons name="alert-circle-outline" size={52} color={theme.textMuted} />
            <ThemedText style={[styles.errorText, { color: theme.textMuted }]}>
              Bilgi bulunamadı.
            </ThemedText>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  const avatarLetter = userData.fullName?.charAt(0).toUpperCase() ?? '?';

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
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Kişisel Bilgiler</ThemedText>
          <View style={{ width: 72 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.avatarSection}>
            {userData.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                <ThemedText style={[styles.avatarLetter, { color: theme.primary }]}>{avatarLetter}</ThemedText>
              </View>
            )}
            <ThemedText style={[styles.avatarName, { color: theme.text }]}>{userData.fullName}</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
              <ThemedText style={[styles.roleText, { color: theme.primary }]}>
                {userData.role === 'patient' ? 'Hasta' : 'Admin'}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Personal Information Card */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <SectionHeader title="Kişisel Bilgiler" theme={theme} />
            <GlassCard style={styles.card} intensity={90}>
              <InfoRow icon="person-outline"       label="Ad Soyad"     value={userData.fullName}                        theme={theme} />
              <InfoRow icon="mail-outline"         label="E-posta"      value={userData.email}                           theme={theme} />
              <InfoRow icon="calendar-outline"     label="Yaş"          value={`${userData.age} yaşında`}                theme={theme} />
              <InfoRow icon="time-outline"         label="Kayıt Tarihi" value={formatDate(userData.createdAt)}           theme={theme} isLast />
            </GlassCard>
          </Animated.View>

          {/* Medical Information Card (patients only) */}
          {userData.role === 'patient' && (
            <Animated.View entering={FadeInUp.duration(700).delay(300)}>
              <SectionHeader title="Tıbbi Bilgiler" theme={theme} />
              <GlassCard style={styles.card} intensity={90}>
                <InfoRow icon="medical-outline"     label="Hastalık Durumu"   value={userData.diseaseStatus  ?? 'Belirtilmemiş'} theme={theme} />
                <InfoRow icon="calendar-number-outline" label="Transplant Tarihi" value={formatDate(userData.transplantDate)}       theme={theme} />
                <InfoRow icon="business-outline"    label="Hastane"          value={userData.hospitalName   ?? 'Belirtilmemiş'} theme={theme} />
                <InfoRow icon="person-add-outline"  label="Doktor"           value={userData.doctorName     ?? 'Belirtilmemiş'} theme={theme} isLast />
              </GlassCard>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },
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
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: Spacing.md,
  },
  avatarLetter: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  avatarName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Section header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  // Info card
  card: {
    borderRadius: 16,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
