import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Profile() {
  return (
    <ProtectedRoute>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold mb-4">Profile Page</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </ProtectedRoute>
  );
}