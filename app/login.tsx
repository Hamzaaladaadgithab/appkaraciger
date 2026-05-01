import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { InputField } from '@/components/ui/InputField';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from '@/components/themed-view';
import { AuthManager } from '@/services/AuthManager';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await AuthManager.signIn(email, password);
      // Let the global Auth Guard handle routing after state updates
    } catch (error: any) {
      let errorMessage = 'Giriş başarısız oldu. Lütfen tekrar deneyin.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'E-posta adresi veya şifre hatalı. Hesabınız yoksa lütfen önce kayıt olun.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz bir e-posta formatı girdiniz.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Bu hesap sistem tarafından engellenmiş.';
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
            <ThemedText type="title" style={{ fontSize: 32, textAlign: 'center' }}>Karaciğer Nakli</ThemedText>
            <ThemedText type="subtitle" style={{ color: theme.primary, textAlign: 'center' }}>AR Eğitim Sistemi</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
            <GlassCard style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>Giriş Yap</ThemedText>
              <ThemedText style={styles.cardDesc}>Tekrar hoş geldiniz! Lütfen bilgilerinizi girin.</ThemedText>
              
              <InputField 
                label="E-posta" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <InputField 
                label="Şifre" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <PrimaryButton 
                title={loading ? "Giriş yapılıyor..." : "Giriş Yap"} 
                onPress={handleLogin} 
                disabled={loading}
                style={{ marginTop: Spacing.md }}
              />

              <View style={styles.footer}>
                <ThemedText style={{ opacity: 0.8 }}>Hesabınız yok mu?</ThemedText>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.primary, marginLeft: 4 }}>
                    Hesap Oluştur
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  card: {
    padding: Spacing.sm,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
});
