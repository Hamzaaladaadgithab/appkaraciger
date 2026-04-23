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

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
            <ThemedText type="title" style={{ fontSize: 32, textAlign: 'center' }}>Create Account</ThemedText>
            <ThemedText type="subtitle" style={{ color: theme.primary, textAlign: 'center' }}>Join our AR Platform</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
            <GlassCard style={styles.card}>
              <InputField 
                label="Full Name" 
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <InputField 
                label="Age" 
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              
              <InputField 
                label="Email" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <InputField 
                label="Password" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <PrimaryButton 
                title="Register" 
                onPress={() => alert('Account created successfully!')} 
                style={{ marginTop: Spacing.md }}
              />

              <View style={styles.footer}>
                <ThemedText style={{ opacity: 0.8 }}>Already have an account?</ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                  <ThemedText type="defaultSemiBold" style={{ color: theme.primary, marginLeft: 4 }}>
                    Login
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
