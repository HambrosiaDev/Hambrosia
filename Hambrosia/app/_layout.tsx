import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/app/firebaseConfig"; 

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
  

  useEffect(() => {
    if (initializing) return;
  
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';
    const currentPage = segments[1]; // e.g., 'register' or 'login'
  
    SplashScreen.hideAsync();
  
    if (user && inAppGroup) {
      router.replace('/(tabs)/viewPackages'); 
    } else if (
      !user &&
      inAppGroup // trying to go to the app while unauthenticated
    ) {
      router.replace('/');
    }
  }, [user, initializing, segments]);
  

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}