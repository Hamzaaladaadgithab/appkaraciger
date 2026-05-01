import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image as RNImage } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// --- POLYFILL CRASH FIX ---
// expo-three'nin DOM polyfill'i (HTMLImageElement) Firebase WebChannel ile çakışıp
// Image.getSize'a obje gönderiyor ve uygulamayı çökertiyor. Bunu burada engelliyoruz.
const originalGetSize = RNImage.getSize;
// @ts-ignore
RNImage.getSize = function (uri: any, success?: any, failure?: any) {
  if (typeof uri !== 'string') {
    // Hata fırlatmak Firestore'u panikletebiliyor (INTERNAL ASSERTION FAILED).
    // Bunun yerine sahte bir başarılı yükleme (0x0 boyut) döndürerek Firebase'i kandırıyoruz.
    if (success) {
      try {
        success(0, 0);
      } catch (e) {}
    }
    return;
  }
  return originalGetSize(uri, success, failure);
};
// --------------------------

import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { User } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';
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
  const { user, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            console.error("User document not found in Firestore!");
            await AuthManager.signOut();
            clearUser();
          }
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Auth Guard Error:", error);
        clearUser();
      } finally {
        setIsReady(true);
      }
    });

    return unsubscribe;
  }, []); // Run once on mount

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user) {
      if (user.role === 'admin' && segments[0] !== '(admin)') {
        router.replace('/(admin)/dashboard');
      } else if (user.role !== 'admin' && (inAuthGroup || segments[0] === '(admin)')) {
        router.replace('/');
      }
    }
  }, [user, isReady, segments]);

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
        <Stack.Screen name="scenario-komplikasyon" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="scenario-psikoloji" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
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
