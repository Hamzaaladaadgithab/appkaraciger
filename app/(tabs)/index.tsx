import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { InputField } from '@/components/ui/InputField';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [text, setText] = useState('');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: theme.primary, dark: theme.surface }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Liver Transplant</ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.primary }}>AR Education System</ThemedText>
        </View>

        <GlassCard style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Giriş Yap</ThemedText>
          <ThemedText style={styles.cardDesc}>Devam etmek için bilgilerinizi giriniz.</ThemedText>
          
          <InputField 
            label="Kullanıcı Adı veya E-posta" 
            value={text}
            onChangeText={setText}
            placeholder=""
          />
          
          <InputField 
            label="Şifre" 
            secureTextEntry
            placeholder=""
          />
          
          <PrimaryButton 
            title="Giriş Yap" 
            onPress={() => alert('Giriş başarılı!')} 
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  card: {
    marginTop: Spacing.sm,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.5,
  },
});

