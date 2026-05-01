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

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !age) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber)) {
      alert('Lütfen geçerli bir yaş girin.');
      return;
    }
    setLoading(true);
    try {
      await AuthManager.signUp(email, password, fullName, ageNumber);
      alert('Hesap başarıyla oluşturuldu!');
      // Let the global Auth Guard handle routing after state updates
    } catch (error: any) {
      let errorMessage = 'Kayıt başarısız oldu. Lütfen tekrar deneyin.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda. Lütfen giriş yapmayı deneyin.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifreniz çok zayıf. Lütfen en az 6 karakterli daha güçlü bir şifre belirleyin.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz bir e-posta formatı girdiniz.';
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
            <ThemedText type="title" style={{ fontSize: 32, textAlign: 'center' }}>Hesap Oluştur</ThemedText>
            <ThemedText type="subtitle" style={{ color: theme.primary, textAlign: 'center' }}>AR Platformumuza Katılın</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
            <GlassCard style={styles.card}>
              <InputField 
                label="Ad Soyad" 
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <InputField 
                label="Yaş" 
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              
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
                title={loading ? "Kaydediliyor..." : "Kayıt Ol"} 
                onPress={handleRegister} 
                disabled={loading}
                style={{ marginTop: Spacing.md }}
              />

              <View style={styles.footer}>
                <ThemedText style={{ opacity: 0.8 }}>Zaten hesabınız var mı?</ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.primary, marginLeft: 4 }}>
                    Giriş Yap
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
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  card: {
    padding: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
});
