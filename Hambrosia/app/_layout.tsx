import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/app/firebaseConfig"; 
import { useUserStore } from '@/app/user';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase Auth state changed. User:", user);
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);
  

  const role = useUserStore((state) => state.role);

useEffect(() => {
  if (initializing) return;

  SplashScreen.hideAsync();

  const inAuthGroup = segments[0] === '(auth)';
  const inTabsGroup = segments[0] === '(tabs)';

  if (user && inTabsGroup) {
    router.replace('/(tabs)/viewPackages');
  }

  if (!user && inTabsGroup) {
    router.replace('/');
  }
}, [user, initializing]);

  

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}