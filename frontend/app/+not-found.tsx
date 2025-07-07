import { Stack, Link, useSegments } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  const segments = useSegments(); // This returns the route segments attempted

  const attemptedPath = '/' + segments.join('/');

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-lg font-bold">This screen does not exist.</Text>
        <Text className="mt-2 text-gray-500">
          Attempted to load: <Text className="font-semibold">{attemptedPath}</Text>
        </Text>
        <Link href="/auth/login" className="mt-4 text-blue-500 underline">
          Go to login screen
        </Link>
      </View>
    </>
  );
}
