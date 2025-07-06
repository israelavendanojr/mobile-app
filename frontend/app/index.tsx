// app/index.tsx
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Index() {
  const { onLogout } = useAuth();

  const handleLogout = async () => {
    await onLogout();
    router.replace('/login');
  };

  return (
    <ProtectedRoute>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold mb-4">Welcome to the App!</Text>
        <Button title="Go to Profile" onPress={() => router.push('/profile')} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </ProtectedRoute>
  );
}