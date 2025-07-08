import { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Index() {
  const { authState, onLogout } = useAuth();

  const handleLogout = async () => {
    await onLogout();
    router.replace('/auth/login');
  };

  // // 🚀 Check if user needs onboarding
  // useEffect(() => {
  //   if (authState.authenticated && authState.user) {
  //     const needsOnboarding = !authState.user.has_plan; // replace with your actual key
  //     if (needsOnboarding) {
  //       router.replace('/onboarding/welcome');
  //     }
  //   }
  // }, [authState]);

  return (
    <ProtectedRoute>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold mb-4">Welcome to the App!</Text>
        <Button title="Go to Onboarding" onPress={() => router.push('/onboarding/welcome')} />
        <Button title="Go to Profile" onPress={() => router.push('/auth/profile')} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </ProtectedRoute>
  );
}
