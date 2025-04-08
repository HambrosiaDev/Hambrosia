import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/app/firebaseConfig"; 

import { useColorScheme } from '@/hooks/useColorScheme';
import  { FirebaseAuthTypes } from '@react-native-firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('onAuthStateChanged', user);
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;
  
    const inTabsGroup = segments[0] === '(tabs)';
  
    if (user && !inTabsGroup) {
      router.replace('/(tabs)/viewPackages');
    } else if (!user && inTabsGroup) {
      router.replace('/');
    }
  }, [user, initializing]);
  
  

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false}} />
    </Stack>
  );
}