import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { AuthManager } from '@/services/AuthManager';
import { DatabaseManager } from '@/services/DatabaseManager';
import { User } from '@/types';

export default function AdminDashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const data = await DatabaseManager.getPatients();
    setPatients(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AuthManager.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ThemedView style={styles.container}>
        
        {/* Header with Title and Logout */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={{ fontSize: 28, color: theme.primary }}>Admin Panel</ThemedText>
            <ThemedText style={{ color: theme.textMuted, marginTop: 4 }}>
              Managing patient records
            </ThemedText>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Patients List */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : patients.length === 0 ? (
            <ThemedText style={{ textAlign: 'center', marginTop: 40, opacity: 0.7 }}>
              No patients found.
            </ThemedText>
          ) : (
            patients.map((patient, index) => (
              <Animated.View key={patient.uid} entering={FadeInUp.duration(500).delay(index * 100).springify()}>
                <GlassCard style={styles.patientCard}>
                  <View style={styles.patientHeader}>
                    <View style={styles.avatarCircle}>
                      <ThemedText style={styles.avatarText}>
                        {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : '?'}
                      </ThemedText>
                    </View>
                    <View style={styles.patientInfo}>
                      <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>{patient.fullName}</ThemedText>
                      <ThemedText style={{ color: theme.textMuted, fontSize: 14 }}>{patient.email}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.scoreContainer}>
                    <ThemedText style={{ fontSize: 14, opacity: 0.8 }}>Total Score</ThemedText>
                    <ThemedText type="subtitle" style={{ color: theme.primary }}>{patient.totalScore || 0} pts</ThemedText>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </ScrollView>
        
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // subtle red bg
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  patientCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.2)', // soft green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  patientInfo: {
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)', // very subtle bg
    padding: Spacing.sm,
    borderRadius: 8,
  },
});
