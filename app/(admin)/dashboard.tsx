import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { AuthManager } from '@/services/AuthManager';

export default function AdminDashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { user } = useAuthStore();

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
        
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={64} color={theme.primary} />
          <ThemedText type="title" style={{ marginTop: Spacing.md, textAlign: 'center' }}>
            Admin Panel
          </ThemedText>
          <ThemedText style={{ color: theme.textMuted, marginTop: 4, textAlign: 'center' }}>
            Welcome back, {user?.fullName || 'Admin'}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginBottom: Spacing.xl }}>
            This is a secure area only accessible by users with the "admin" role.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <PrimaryButton 
            title="Log Out" 
            onPress={handleLogout}
            style={{ backgroundColor: '#ef4444' }} // red for logout
          />
        </View>
        
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: Spacing.xl,
  },
});
