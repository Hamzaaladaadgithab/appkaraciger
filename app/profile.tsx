import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
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
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await AuthManager.signOut();
      // Let the global Auth Guard handle the redirect automatically.
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header / Back Button */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={{ fontSize: 24 }}>Profil</ThemedText>
          <View style={{ width: 28 }} /> {/* Spacer for centering */}
        </Animated.View>

        {/* Top Section: Avatar & Info */}
        <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.topSection}>
          <View style={[styles.avatarCircle, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
            <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
              {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : '?'}
            </ThemedText>
          </View>
          <ThemedText type="title" style={{ fontSize: 26, marginTop: Spacing.md }}>
            {userData?.fullName || 'User'}
          </ThemedText>
          <ThemedText style={{ color: theme.textMuted, fontSize: 16, marginTop: 4 }}>
            {userData?.email || 'No email available'}
          </ThemedText>
          
          <GlassCard style={styles.scoreBadge}>
            <Ionicons name="star" size={20} color={theme.primary} />
            <ThemedText style={{ marginLeft: 8, fontSize: 18, fontWeight: 'bold' }}>
              {userData?.totalScore || 0} Puan
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Middle Section: Menu Items */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.menuSection}>
          <MenuItem icon="person-outline" title="Kişisel Bilgiler" theme={theme} />
          <MenuItem icon="stats-chart-outline" title="İstatistiklerim" theme={theme} />
          <MenuItem icon="settings-outline" title="Ayarlar" theme={theme} />
        </Animated.View>

        {/* Bottom Section: Logout */}
        <Animated.View entering={FadeInUp.duration(700).delay(300)} style={styles.bottomSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} 
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                <ThemedText style={[styles.logoutText, { color: '#ef4444' }]}>Çıkış Yap</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for menu items
function MenuItem({ icon, title, theme }: { icon: keyof typeof Ionicons.glyphMap, title: string, theme: any }) {
  return (
    <GlassCard style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: theme.card }]}>
          <Ionicons name={icon} size={22} color={theme.primary} />
        </View>
        <ThemedText style={{ fontSize: 16, marginLeft: Spacing.md }}>{title}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </GlassCard>
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
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: 4,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: Spacing.lg,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
