import { View, Text, Button, ScrollView, ActivityIndicator } from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function WelcomeScreen() {
  const { state, nextStep } = useOnboarding();

  const handleStart = () => {
    nextStep();
  };

  if (state.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center justify-center p-6 min-h-screen">
        <View className="w-full max-w-md">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-4">
            Welcome to Your Fitness Journey! 🏋️‍♂️
          </Text>
          
          <Text className="text-lg text-center text-gray-600 mb-8">
            Let's create a personalized workout plan that fits your goals, schedule, and equipment.
          </Text>

          <View className="bg-blue-50 p-6 rounded-lg mb-8">
            <Text className="text-lg font-semibold text-blue-800 mb-3">
              What we'll help you with:
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Text className="text-blue-600 text-xl mr-3">💪</Text>
                <Text className="text-blue-700 flex-1">
                  Set your training preferences and goals
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-blue-600 text-xl mr-3">📅</Text>
                <Text className="text-blue-700 flex-1">
                  Choose your ideal workout schedule
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-blue-600 text-xl mr-3">🏃‍♀️</Text>
                <Text className="text-blue-700 flex-1">
                  Select your available equipment
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-blue-600 text-xl mr-3">🎯</Text>
                <Text className="text-blue-700 flex-1">
                  Generate a custom workout plan
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-green-50 p-4 rounded-lg mb-8">
            <Text className="text-center text-green-700 text-sm">
              This will only take a few minutes, and you can always adjust your preferences later!
            </Text>
          </View>

          <Button
            title="Get Started 🚀"
            onPress={handleStart}
            disabled={state.loading}
          />

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500 text-sm">
              Step 1 of {state.totalSteps}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}