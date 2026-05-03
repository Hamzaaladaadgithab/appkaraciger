import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiverModelViewer } from '@/components/ar/LiverModelViewer';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { BorderRadius, Spacing } from '@/constants/theme';
import { DatabaseManager } from '@/services/DatabaseManager';
import { useAuthStore } from '@/store/authStore';

export default function ScenarioPsikolojiScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [modelColor, setModelColor] = useState<'default' | 'correct' | 'wrong'>('default');

  const handleDecision = async (isCorrect: boolean) => {
    if (!user) return;

    if (isCorrect) {
      setModelColor('correct');
      setLoading(true);

      await DatabaseManager.saveSessionLog({
        userId: user.uid,
        scenarioId: 'psychological_support_01',
        action: 'correct',
        timestamp: new Date().toISOString()
      });

      const newScore = (user.totalScore || 0) + 10;
      const success = await DatabaseManager.updateUserScore(user.uid, newScore);
      setLoading(false);

      if (success) {
        setUser({ ...user, totalScore: newScore });
        Alert.alert(
          'Doğru Karar! 🟢',
          'Harika! Nakil sonrası psikolojik destek almak iyileşme sürecinin önemli bir parçasıdır. Destek grupları ve uzmanlar bu süreçte yanınızda. +10 Puan kazandınız!',
          [{ text: 'Devam Et', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Hata', 'Puan kaydedilemedi.');
      }
    } else {
      setModelColor('wrong');
      setLoading(true);

      await DatabaseManager.saveSessionLog({
        userId: user.uid,
        scenarioId: 'psychological_support_01',
        action: 'wrong',
        timestamp: new Date().toISOString()
      });

      // 5 Puan sil (0'ın altına düşmesin)
      const currentScore = user.totalScore || 0;
      const newScore = Math.max(0, currentScore - 5);
      const success = await DatabaseManager.updateUserScore(user.uid, newScore);
      
      setLoading(false);

      if (success) {
        setUser({ ...user, totalScore: newScore });
        Alert.alert(
          'Unutmayın ⚠️',
          'Nakil sonrası endişe ve yalnızlık hissi çok yaygındır. Duygularınızı içinde tutmak iyileşmeyi yavaşlatabilir. Bir uzmandan veya destek grubundan yardım almaktan çekinmeyin. (-5 Puan)',
          [{ text: 'Anladım', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Hata', 'Puan kaydedilemedi.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

        {/* Üst bar */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.scorePill}>
            <Ionicons name="star" size={16} color="#FBBF24" style={{ marginRight: 4 }} />
            <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>{user?.totalScore || 0}</ThemedText>
          </View>
        </Animated.View>

        {/* 3D Model */}
        <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.modelContainer}>
          <LiverModelViewer colorState={modelColor} style={styles.modelViewer} />
          <View style={styles.scenarioBadge}>
            <Ionicons name="heart" size={14} color="#ec4899" style={{ marginRight: 4 }} />
            <ThemedText style={[styles.scenarioBadgeText, { color: '#ec4899' }]}>
              Psikolojik Destek
            </ThemedText>
          </View>
        </Animated.View>

        {/* Alt Panel */}
        <Animated.View
          entering={SlideInDown.duration(600).springify().damping(16)}
          style={styles.panelContainer}
        >
          <BlurView intensity={80} tint="dark" style={styles.panel}>
            <View style={styles.handle} />

            <ThemedText type="title" style={styles.questionText}>
              Nakil sonrası kendinizi yalnız ve endişeli hissediyorsunuz. Ne yapmalısınız?
            </ThemedText>

            <View style={styles.buttonGroup}>
              <PrimaryButton
                title={loading ? 'Kaydediliyor...' : 'Destek Grubuna Katılırım'}
                onPress={() => handleDecision(true)}
                disabled={loading}
                style={styles.buttonSpacing}
              />
              <SecondaryButton
                title="Kimseye Söylemem"
                disabled={loading}
                onPress={() => handleDecision(false)}
              />
            </View>
          </BlurView>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0a0a' },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  modelContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modelViewer: { width: '100%', height: 280 },
  scenarioBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  scenarioBadgeText: { fontSize: 13, fontWeight: '600' },
  panelContainer: { marginHorizontal: Spacing.sm, marginBottom: Spacing.lg },
  panel: {
    borderRadius: BorderRadius.lg, padding: Spacing.xl,
    overflow: 'hidden', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  questionText: {
    color: '#FFF', fontSize: 20, lineHeight: 28,
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  buttonGroup: { gap: Spacing.xs },
  buttonSpacing: { marginBottom: Spacing.sm },
});
