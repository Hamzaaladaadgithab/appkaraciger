import React from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScenarioScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Dark Blurred Background to simulate AR Camera Feed */}
      <ImageBackground 
        source={require('@/assets/images/partial-react-logo.png')} 
        style={StyleSheet.absoluteFillObject}
        blurRadius={20}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Top Section */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.topSection}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.scorePill}>
            <Ionicons name="star" size={16} color="#FBBF24" style={{ marginRight: 4 }} />
            <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>150</ThemedText>
          </View>
        </Animated.View>

        {/* Bottom Floating Panel */}
        <Animated.View entering={SlideInDown.duration(600).springify().damping(16)} style={styles.panelContainer}>
          <BlurView intensity={80} tint="dark" style={styles.panel}>
            <View style={styles.handle} />
            
            <ThemedText type="title" style={styles.questionText}>
              It's time to take your medication. What should you do?
            </ThemedText>

            <View style={styles.buttonGroup}>
              <PrimaryButton 
                title="Take Now" 
                onPress={() => alert('+10 Points! Good job!')} 
                style={styles.buttonSpacing} 
              />
              <SecondaryButton 
                title="Take Later" 
                onPress={() => alert('Health first! Try to take it on time.')} 
              />
            </View>
          </BlurView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  panelContainer: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  panel: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  questionText: {
    color: '#FFF',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonGroup: {
    gap: Spacing.xs,
  },
  buttonSpacing: {
    marginBottom: Spacing.sm,
  },
});
