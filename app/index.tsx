import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScenarioCard } from '@/components/ui/ScenarioCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { auth } from '@/services/firebaseConfig';
import { useAuthStore } from '@/store/authStore';
import { DatabaseManager } from '@/services/DatabaseManager';
import { AuthManager } from '@/services/AuthManager';
import { useCallback, useState } from 'react';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await AuthManager.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        if (user?.uid) {
          const updatedUser = await DatabaseManager.getUser(user.uid);
          if (updatedUser) {
            setUser(updatedUser);
          }
        }
        setLoading(false);
      };
      
      fetchUserData();
    }, [user?.uid])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Section */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={styles.greetingContainer}>
            <ThemedText style={{ color: theme.textMuted, marginTop: 4, fontSize: 16 }}>Tekrar hoş geldiniz,</ThemedText>
            <ThemedText type="title" style={{ fontSize: 28, color: theme.primary }}>{user?.fullName || 'Hasta'}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/profile' as any)}
            >
              <Ionicons name="person-circle" size={56} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Score Card */}
        <Animated.View entering={FadeInUp.duration(700).springify().delay(100)}>
          <GlassCard style={[styles.scoreCard, { backgroundColor: theme.primary }]} intensity={80}>
            <View style={styles.scoreContent}>
              <View>
                <ThemedText style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>İlerlemeniz</ThemedText>
                <ThemedText type="title" style={{ color: '#fff', fontSize: 32, marginTop: 4 }}>{user?.totalScore || 0} Puan</ThemedText>
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name="star" size={28} color={theme.primary} />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Scenarios */}
        <Animated.View entering={FadeInUp.duration(800).springify().delay(200)} style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Eğitim Senaryoları</ThemedText>
          
          <ScenarioCard 
            title="İlaç Uyumu" 
            iconName="medical" 
            onPress={() => router.push('/scenario')} 
          />
          <ScenarioCard 
            title="Komplikasyon Farkındalığı" 
            iconName="warning" 
            onPress={() => router.push('/scenario-komplikasyon' as any)} 
          />
          <ScenarioCard 
            title="Psikolojik Destek" 
            iconName="heart" 
            onPress={() => router.push('/scenario-psikoloji' as any)} 
          />
        </Animated.View>

        {/* Bottom CTA */}
        <Animated.View entering={FadeInUp.duration(900).springify().delay(300)} style={styles.bottomSection}>
          <PrimaryButton 
            title="AR Eğitimini Başlat" 
            onPress={() => router.push('/scenario')}
            style={styles.ctaButton}
          />
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  scoreCard: {
    marginBottom: Spacing.xl,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: 18,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  ctaButton: {
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});

