// app/_not-found.tsx
import { Stack, Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-lg font-bold">This screen does not exist.</Text>
        <Link href="/" className="mt-4 text-blue-500 underline">
          Go to home screen
        </Link>
      </View>
    </>
  );
}
