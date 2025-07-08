import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function PlanPreviewScreen() {
  const { state, generatePlan, savePlan, prevStep, resetOnboarding } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add safety check for state
  if (!state) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  useEffect(() => {
    // Auto-generate plan when screen loads if we don't have one
    if (!state.generatedPlan && !state.loading) {
      handleGeneratePlan();
    }
  }, [state.loading]); // Removed state.generatedPlan from dependencies

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const success = await generatePlan();
    setIsGenerating(false);
    
    if (!success) {
      Alert.alert(
        'Generation Failed',
        state.error || 'Failed to generate your workout plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    const success = await savePlan();
    setIsSaving(false);
    
    if (!success) {
      Alert.alert(
        'Save Failed',
        state.error || 'Failed to save your workout plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Plan',
      'Are you sure you want to generate a new plan? This will replace your current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: handleGeneratePlan },
      ]
    );
  };

  const renderExercise = (exercise: any, index: number) => {
    if (exercise.skip) {
      return (
        <View key={index} className="bg-gray-100 p-3 rounded-lg mb-2">
          <Text className="text-gray-500 italic">{exercise.exercise_name}</Text>
        </View>
      );
    }

    return (
      <View key={index} className="bg-white border border-gray-200 p-4 rounded-lg mb-2">
        <Text className="font-semibold text-gray-800 text-lg">
          {exercise.exercise_name}
        </Text>
        <Text className="text-gray-600 mt-1">
          {exercise.sets} sets × {exercise.start_reps}
          {exercise.end_reps !== exercise.start_reps && `-${exercise.end_reps}`} reps
        </Text>
      </View>
    );
  };

  const renderDay = (day: any, index: number) => (
    <View key={index} className="mb-6">
      <Text className="text-xl font-bold text-gray-800 mb-3">
        {day.day_name}
      </Text>
      <View className="ml-2">
        {day.exercises?.map((exercise: any, exIndex: number) => 
          renderExercise(exercise, exIndex)
        )}
      </View>
    </View>
  );

  if (isGenerating || (state.loading && !state.generatedPlan)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg font-medium text-gray-700">
          Generating your personalized workout plan...
        </Text>
        <Text className="mt-2 text-gray-500 text-center px-4">
          This may take a few seconds while we create the perfect plan for you
        </Text>
      </View>
    );
  }

  if (state.error && !state.generatedPlan) {
    return (
      <View className="flex-1 bg-white p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-bold text-red-600 mb-4">
            Generation Failed
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            {state.error}
          </Text>
          <View className="w-full max-w-sm space-y-3">
            <Button
              title="Try Again"
              onPress={handleGeneratePlan}
              disabled={isGenerating}
            />
            <Button
              title="Go Back"
              onPress={prevStep}
              color="#6B7280"
            />
          </View>
        </View>
      </View>
    );
  }

  if (!state.generatedPlan) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600 mb-4">
          No plan generated yet
        </Text>
        <Button
          title="Generate Plan"
          onPress={handleGeneratePlan}
          disabled={isGenerating}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
          Workout Plan Preview
        </Text>
        <Text className="text-center text-gray-600 mb-6">
          Preview your personalized workout plan
        </Text>
        {/* Added safety checks for array and map */}
        {state.generatedPlan && Array.isArray(state.generatedPlan) && 
          state.generatedPlan.map((day: any, index: number) => 
            renderDay(day, index)
          )
        }
      </View>
    </ScrollView>
  );
}