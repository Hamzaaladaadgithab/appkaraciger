import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScenarioCard } from '@/components/ui/ScenarioCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Section */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
          <View style={styles.greetingContainer}>
            <ThemedText type="title" style={{ fontSize: 28 }}>Welcome, Alex 👋</ThemedText>
            <ThemedText style={{ color: theme.textMuted, marginTop: 4 }}>Let's continue your health journey</ThemedText>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={56} color={theme.primary} />
          </View>
        </Animated.View>

        {/* Score Card */}
        <Animated.View entering={FadeInUp.duration(700).springify().delay(100)}>
          <GlassCard style={[styles.scoreCard, { backgroundColor: theme.primary }]} intensity={80}>
            <View style={styles.scoreContent}>
              <View>
                <ThemedText style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>Your Progress</ThemedText>
                <ThemedText type="title" style={{ color: '#fff', fontSize: 32, marginTop: 4 }}>150 Points</ThemedText>
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name="star" size={28} color={theme.primary} />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Scenarios */}
        <Animated.View entering={FadeInUp.duration(800).springify().delay(200)} style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Training Scenarios</ThemedText>
          
          <ScenarioCard 
            title="Medication Adherence" 
            iconName="medical" 
            onPress={() => router.push('/scenario')} 
          />
          <ScenarioCard 
            title="Complication Awareness" 
            iconName="warning" 
            onPress={() => alert('Bu senaryo yapım aşamasında!')} 
          />
          <ScenarioCard 
            title="Psychological Support" 
            iconName="heart" 
            onPress={() => alert('Bu senaryo yapım aşamasında!')} 
          />
        </Animated.View>

        {/* Bottom CTA */}
        <Animated.View entering={FadeInUp.duration(900).springify().delay(300)} style={styles.bottomSection}>
          <PrimaryButton 
            title="Start AR Training" 
            onPress={() => alert('Starting AR...')}
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

