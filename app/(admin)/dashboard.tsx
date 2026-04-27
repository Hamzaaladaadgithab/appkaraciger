import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { InputField } from '@/components/ui/InputField';
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

  // Edit Score Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newScore, setNewScore] = useState('');
  const [savingScore, setSavingScore] = useState(false);

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

  const openEditModal = (patient: User) => {
    setSelectedUser(patient);
    setNewScore(patient.totalScore ? patient.totalScore.toString() : '0');
    setModalVisible(true);
  };

  const handleSaveScore = async () => {
    if (!selectedUser) return;
    const scoreNum = parseInt(newScore, 10);
    if (isNaN(scoreNum)) {
      Alert.alert('Hata', 'Lütfen geçerli bir sayı girin.');
      return;
    }

    setSavingScore(true);
    const success = await DatabaseManager.updateUserScore(selectedUser.uid, scoreNum);
    setSavingScore(false);

    if (success) {
      Alert.alert('Başarılı', 'Skor başarıyla güncellendi.');
      setModalVisible(false);
      fetchPatients(); // Refresh list
    } else {
      Alert.alert('Hata', 'Skor güncellenirken bir sorun oluştu.');
    }
  };

  const handleDeleteUser = (patient: User) => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `${patient.fullName} adlı hastayı kalıcı olarak silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await DatabaseManager.deleteUser(patient.uid);
            if (success) {
              Alert.alert('Başarılı', 'Hasta sistemden silindi.');
              fetchPatients();
            } else {
              setLoading(false);
              Alert.alert('Hata', 'Kullanıcı silinirken bir sorun oluştu.');
            }
          }
        }
      ]
    );
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

                  {/* Admin Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]} 
                      onPress={() => openEditModal(patient)}
                    >
                      <Ionicons name="pencil" size={16} color="#10b981" />
                      <ThemedText style={{ color: '#10b981', fontSize: 14, marginLeft: 6, fontWeight: '600' }}>Edit Score</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} 
                      onPress={() => handleDeleteUser(patient)}
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                      <ThemedText style={{ color: '#ef4444', fontSize: 14, marginLeft: 6, fontWeight: '600' }}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </ScrollView>

        {/* Edit Score Modal */}
        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>Edit Total Score</ThemedText>
              <ThemedText style={{ opacity: 0.7, marginBottom: Spacing.lg }}>
                Update score for {selectedUser?.fullName}
              </ThemedText>

              <InputField 
                label="New Score" 
                value={newScore}
                onChangeText={setNewScore}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <SecondaryButton 
                  title="Cancel" 
                  onPress={() => setModalVisible(false)} 
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <PrimaryButton 
                  title={savingScore ? "Saving..." : "Save"} 
                  onPress={handleSaveScore}
                  disabled={savingScore}
                  style={{ flex: 1, marginLeft: Spacing.sm }}
                />
              </View>
            </View>
          </View>
        </Modal>
        
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
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
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  }
});
