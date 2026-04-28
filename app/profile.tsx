import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { AuthManager } from '@/services/AuthManager';
import { User } from '@/types';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        } else {
          console.warn('Profile doc not found in users collection.');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await AuthManager.signOut();
      // Auth Guard centrally handles routing
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const avatarLetter = userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : '?';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        {/* Minimalist Top Header (just back button) */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
            <ThemedText style={{ fontSize: 17, color: theme.text, marginLeft: 2 }}>Geri</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Section: Avatar & Info */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.topSection}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.surface }]}>
              <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
                {avatarLetter}
              </ThemedText>
            </View>
            <ThemedText style={[styles.fullName, { color: theme.text }]}>
              {userData?.fullName || 'User'}
            </ThemedText>
            <ThemedText style={[styles.emailText, { color: theme.textMuted }]}>
              {userData?.email || 'No email available'}
            </ThemedText>
          </Animated.View>

          {/* Score Card */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.scoreSection}>
            <GlassCard style={styles.scoreCard} intensity={90}>
              <View style={styles.scoreCardContent}>
                <Ionicons name="star" size={24} color={theme.primary} />
                <ThemedText style={[styles.scoreLabel, { color: theme.text }]}>Toplam Puan</ThemedText>
                <ThemedText style={[styles.scoreValue, { color: theme.primary }]}>
                  {userData?.totalScore || 0}
                </ThemedText>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Menu List */}
          <Animated.View entering={FadeInUp.duration(700).delay(300)} style={styles.menuSection}>
            <View style={[styles.menuListContainer, { backgroundColor: theme.surface }]}>
              <MenuItem icon="person-outline" title="Kişisel Bilgiler" theme={theme} isLast={false} />
              <MenuItem icon="stats-chart-outline" title="İstatistiklerim" theme={theme} isLast={false} />
              <MenuItem icon="settings-outline" title="Ayarlar" theme={theme} isLast={true} />
            </View>
          </Animated.View>

          {/* Bottom Section: Logout */}
          <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                  <ThemedText style={styles.logoutText}>Çıkış Yap</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// Helper component for menu items
function MenuItem({ icon, title, theme, isLast }: { icon: keyof typeof Ionicons.glyphMap, title: string, theme: any, isLast: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150, 150, 150, 0.2)' }]}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(150, 150, 150, 0.1)' }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <ThemedText style={{ fontSize: 17, marginLeft: Spacing.md, color: theme.text }}>{title}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    padding: Spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  topSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
  },
  scoreSection: {
    marginBottom: Spacing.xl,
  },
  scoreCard: {
    padding: Spacing.lg,
    borderRadius: 20,
  },
  scoreCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuListContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: Spacing.xs,
  },
});
