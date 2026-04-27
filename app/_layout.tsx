import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { User } from '@/types';
import { AuthManager } from '@/services/AuthManager';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const segments = useSegments();
  
  const [isReady, setIsReady] = useState(false);
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            
            // Route based on user role
            if (userData.role === 'admin') {
              router.replace('/(admin)/dashboard');
            } else {
              router.replace('/');
            }
          } else {
            console.error("User document not found in Firestore!");
            await AuthManager.signOut();
            clearUser();
            router.replace('/login');
          }
        } else {
          clearUser();
          router.replace('/login');
        }
      } catch (error) {
        console.error("Auth Guard Error:", error);
        clearUser();
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    });

    return unsubscribe;
  }, []); // Run once on mount

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'fade', animationDuration: 250 }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="scenario" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
