import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { useAuthStore } from '@/store/authStore';
import { SessionLog } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalScore: number;
  correct: number;
  wrong: number;
  total: number;
  successRate: number; // 0-100
}

// ─── Level System ─────────────────────────────────────────────────────────────

function getLevel(score: number): { label: string; color: string; nextThreshold: number } {
  if (score >= 150) return { label: 'Advanced',     color: '#f59e0b', nextThreshold: 150 };
  if (score >= 50)  return { label: 'Intermediate', color: '#3b82f6', nextThreshold: 150 };
  return               { label: 'Beginner',      color: '#34d399', nextThreshold: 50  };
}

function getLevelProgress(score: number): number {
  if (score >= 150) return 1;
  if (score >= 50)  return (score - 50) / 100;
  return score / 50;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated horizontal progress bar */
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(progress, 1), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as any,
  }));

  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(150,150,150,0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

/** Stat tile — icon, big number, label */
function StatTile({ icon, value, label, color, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
  theme: any;
}) {
  return (
    <View style={[tileStyles.tile, { backgroundColor: theme.surface }]}>
      <View style={[tileStyles.iconBox, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <ThemedText style={[tileStyles.value, { color }]}>{value}</ThemedText>
      <ThemedText style={[tileStyles.label, { color: theme.textMuted }]}>{label}</ThemedText>
    </View>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});

/** Simple custom bar chart — no external library */
function MiniBarChart({ correct, wrong, theme }: { correct: number; wrong: number; theme: any }) {
  const maxVal = Math.max(correct, wrong, 1);
  const correctH = useSharedValue(0);
  const wrongH   = useSharedValue(0);
  const MAX_HEIGHT = 100;

  useEffect(() => {
    correctH.value = withTiming((correct / maxVal) * MAX_HEIGHT, { duration: 900, easing: Easing.out(Easing.cubic) });
    wrongH.value   = withTiming((wrong   / maxVal) * MAX_HEIGHT, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [correct, wrong]);

  const correctStyle = useAnimatedStyle(() => ({ height: correctH.value }));
  const wrongStyle   = useAnimatedStyle(() => ({ height: wrongH.value }));

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.barsRow}>
        {/* Correct bar */}
        <View style={chartStyles.barGroup}>
          <View style={[chartStyles.barTrack, { height: MAX_HEIGHT }]}>
            <Animated.View style={[chartStyles.bar, { backgroundColor: '#34d399' }, correctStyle]} />
          </View>
          <ThemedText style={[chartStyles.barLabel, { color: theme.textMuted }]}>{correct}</ThemedText>
          <ThemedText style={[chartStyles.barSubLabel, { color: '#34d399' }]}>Doğru</ThemedText>
        </View>

        {/* Wrong bar */}
        <View style={chartStyles.barGroup}>
          <View style={[chartStyles.barTrack, { height: MAX_HEIGHT }]}>
            <Animated.View style={[chartStyles.bar, { backgroundColor: '#ef4444' }, wrongStyle]} />
          </View>
          <ThemedText style={[chartStyles.barLabel, { color: theme.textMuted }]}>{wrong}</ThemedText>
          <ThemedText style={[chartStyles.barSubLabel, { color: '#ef4444' }]}>Yanlış</ThemedText>
        </View>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xl,
  },
  barGroup: {
    alignItems: 'center',
    width: 64,
  },
  barTrack: {
    width: 40,
    justifyContent: 'flex-end',
    borderRadius: 8,
    backgroundColor: 'rgba(150,150,150,0.1)',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
  },
  barSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Fallback: use Zustand store data if no Firebase user
        setStats({
          totalScore: user?.totalScore ?? 0,
          correct: 0, wrong: 0, total: 0, successRate: 0,
        });
        return;
      }

      // Query session logs for this user
      const logsRef = collection(db, 'sessionLogs');
      const q = query(logsRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);

      let correct = 0;
      let wrong = 0;

      snapshot.forEach((docSnap) => {
        const log = docSnap.data() as SessionLog;
        if (log.action === 'correct') correct++;
        else if (log.action === 'wrong') wrong++;
      });

      const total = correct + wrong;
      const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

      setStats({
        totalScore: user?.totalScore ?? 0,
        correct,
        wrong,
        total,
        successRate,
      });
    } catch (err) {
      console.error('Statistics: Firebase fetch error:', err);
      // Graceful fallback — show score from store, zeroed counters
      setStats({
        totalScore: user?.totalScore ?? 0,
        correct: 0, wrong: 0, total: 0, successRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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

  // ── Main UI ────────────────────────────────────────────────────────────────
  const level = getLevel(stats!.totalScore);
  const levelProgress = getLevelProgress(stats!.totalScore);

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
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>İstatistiklerim</ThemedText>
          <View style={{ width: 72 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Level Card */}
          <Animated.View entering={FadeInUp.duration(500).delay(100)}>
            <GlassCard style={styles.levelCard} intensity={90}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelBadge, { backgroundColor: `${level.color}20` }]}>
                  <ThemedText style={[styles.levelLabel, { color: level.color }]}>{level.label}</ThemedText>
                </View>
                <ThemedText style={[styles.levelScore, { color: level.color }]}>
                  {stats!.totalScore} pts
                </ThemedText>
              </View>
              <ThemedText style={[styles.levelSub, { color: theme.textMuted }]}>
                {stats!.totalScore >= 150
                  ? 'En üst seviyedesiniz! 🏆'
                  : `Sonraki seviye: ${level.nextThreshold} puan`}
              </ThemedText>
              <View style={{ marginTop: Spacing.md }}>
                <ProgressBar progress={levelProgress} color={level.color} />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Stat Tiles Row */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.tilesRow}>
            <StatTile icon="star"         value={stats!.totalScore}   label="Toplam Puan"    color="#3b82f6" theme={theme} />
            <StatTile icon="checkmark"    value={stats!.correct}      label="Doğru"          color="#34d399" theme={theme} />
            <StatTile icon="close"        value={stats!.wrong}        label="Yanlış"         color="#ef4444" theme={theme} />
            <StatTile icon="list-outline" value={stats!.total}        label="Toplam Quiz"    color="#a78bfa" theme={theme} />
          </Animated.View>

          {/* Success Rate Card */}
          <Animated.View entering={FadeInUp.duration(700).delay(300)}>
            <GlassCard style={styles.card} intensity={90}>
              <View style={styles.successRateHeader}>
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Başarı Oranı</ThemedText>
                <ThemedText style={[styles.successPercent, { color: '#34d399' }]}>
                  %{stats!.successRate}
                </ThemedText>
              </View>
              <ProgressBar progress={stats!.successRate / 100} color="#34d399" />
              <ThemedText style={[styles.successHint, { color: theme.textMuted }]}>
                {stats!.total === 0
                  ? 'Henüz hiç senaryo tamamlanmadı.'
                  : `${stats!.total} senaryodan ${stats!.correct} tanesi doğru.`}
              </ThemedText>
            </GlassCard>
          </Animated.View>

          {/* Bar Chart Card */}
          <Animated.View entering={FadeInUp.duration(800).delay(400)}>
            <GlassCard style={styles.card} intensity={90}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text, marginBottom: Spacing.md }]}>
                Cevap Dağılımı
              </ThemedText>
              <MiniBarChart correct={stats!.correct} wrong={stats!.wrong} theme={theme} />
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: Spacing.md,
  },
  // Level card
  levelCard: {
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: 0,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  levelScore: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  levelSub: {
    fontSize: 13,
    marginBottom: 4,
  },
  // Tiles row
  tilesRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  // Generic card
  card: {
    padding: Spacing.lg,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Success rate
  successRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  successPercent: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  successHint: {
    fontSize: 13,
    marginTop: Spacing.sm,
  },
});
