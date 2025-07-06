// app/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

// This gate checks auth after AuthProvider is mounted
function AuthGate() {
  const { authState } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authState?.authenticated !== null) {
      setChecking(false);
    }
  }, [authState]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

// Wrap the gate in the provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
