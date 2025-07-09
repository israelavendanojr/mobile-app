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

  return (
    <ProtectedRoute>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold mb-4">Welcome to the App!</Text>
        <Button title="Go to Plan Generator" onPress={() => router.push('/generator/welcome')} />
        <Button title="View Plans" onPress={() => router.push('/view_plans')} />
        <Button title="Go to Profile" onPress={() => router.push('/auth/profile')} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </ProtectedRoute>
  );
}
